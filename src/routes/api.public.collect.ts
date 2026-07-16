import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveCompanyByIp, lookupIp } from "@/lib/ipinfo.server";
import { resolveCompanyByHint } from "@/lib/ip-hints.server";
import { enrichCompany } from "@/lib/enrich.server";
import { computeIntentScore, matchesHighIntent } from "@/lib/scoring.server";
import { maybeFireHotLeadAlert } from "@/lib/alerts.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

const Schema = z.object({
  tracking_id: z.string().min(8).max(64),
  anon_id: z.string().min(8).max(128),
  event: z.enum(["pageview", "unload"]).optional(),
  url: z.string().url().max(2000),
  referrer: z.string().max(2000).nullable().optional(),
  title: z.string().max(500).nullable().optional(),
  tz: z.string().max(100).nullable().optional(),
  lang: z.string().max(20).nullable().optional(),
  screen: z.string().max(20).nullable().optional(),
  duration_ms: z.number().int().min(0).max(86_400_000).optional(),
  scroll_pct: z.number().int().min(0).max(100).optional(),
});

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? "visitorid-eu-default-salt";
  return createHash("sha256").update(salt + ":" + ip).digest("hex").slice(0, 32);
}

function ipv4Prefix24(ip: string | null): string | null {
  if (!ip) return null;
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/);
  return m ? `${m[1]}.${m[2]}.${m[3]}.0/24` : null;
}

async function logIpLookup(
  siteId: string,
  ip: string | null,
  resolvedCompanyId: string | null,
  layer: "ipinfo" | "hint" | "none",
) {
  try {
    const info = ip ? await lookupIp(ip) : null;
    await supabaseAdmin.from("ip_lookups").insert({
      site_id: siteId,
      ip_prefix: ipv4Prefix24(ip) ?? (ip ? "ipv6" : "unknown"),
      country: info?.country ?? null,
      org: info?.org ?? null,
      asn_name: info?.asn?.name ?? null,
      asn_domain: info?.asn?.domain ?? null,
      company_name: info?.company?.name ?? null,
      company_domain: info?.company?.domain ?? null,
      company_type: info?.company?.type ?? info?.asn?.type ?? null,
      layer,
      resolved_company_id: resolvedCompanyId,
    });
  } catch (e) {
    console.error("[ip_lookups] log failed", e);
  }
}

// Tło — nie blokuje response do pixela
async function maybeFireTargetAccountAlert(
  workspaceId: string,
  company: { id: string; domain: string; name: string },
) {
  const { data: targets } = await supabaseAdmin
    .from("target_accounts")
    .select("id, domain_pattern, company_id")
    .eq("workspace_id", workspaceId);
  if (!targets || targets.length === 0) return;

  const matched = targets.find((t) => {
    if (t.company_id === company.id) return true;
    if (!t.domain_pattern) return false;
    const pat = t.domain_pattern.toLowerCase();
    const dom = company.domain.toLowerCase();
    if (pat.startsWith("*.")) return dom.endsWith(pat.slice(1));
    return dom === pat;
  });
  if (!matched) return;

  const { data: integrations } = await supabaseAdmin
    .from("integrations")
    .select("type, settings, enabled")
    .eq("workspace_id", workspaceId)
    .eq("enabled", true);
  if (!integrations) return;

  for (const integ of integrations) {
    const url = (integ.settings as { webhook_url?: string } | null)?.webhook_url;
    if (!url) continue;
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `🎯 Target account visit: *${company.name}* (${company.domain})` }),
      });
    } catch (e) {
      console.error("alert webhook failed", e);
    }
  }
}

export const Route = createFileRoute("/api/public/collect")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return new Response("Bad JSON", { status: 400, headers: CORS });
        }
        const parsed = Schema.safeParse(payload);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }
        const data = parsed.data;

        // Site lookup + scoring config
        const { data: site } = await supabaseAdmin
          .from("sites")
          .select("id, workspace_id, domain, alert_threshold, high_intent_paths")
          .eq("tracking_id", data.tracking_id)
          .maybeSingle();
        if (!site) {
          return new Response("Unknown tracking id", { status: 404, headers: CORS });
        }

        const ip =
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          null;
        const ua = request.headers.get("user-agent") ?? null;

        // IP lookup (raz) — daje country/asn/org niezależnie od dopasowania firmy
        const ipInfo = ip ? await lookupIp(ip) : null;
        const ipCountry = ipInfo?.country ?? null;


        // Company resolution — 2 warstwy
        const ipinfoCompany = await resolveCompanyByIp(ip);
        const hintCompany = ipinfoCompany ? null : await resolveCompanyByHint(ip);
        const company = ipinfoCompany ?? hintCompany;
        const resolutionLayer: "ipinfo" | "hint" | "none" = ipinfoCompany
          ? "ipinfo"
          : hintCompany
            ? "hint"
            : "none";


        // Background: enrichment
        if (company) enrichCompany(company.id).catch((e) => console.error(e));

        const isHighIntent = matchesHighIntent(data.url, site.high_intent_paths ?? []);
        const now = new Date().toISOString();

        // Upsert sesji — agregaty inkrementalne
        const { data: existing } = await supabaseAdmin
          .from("sessions")
          .select(
            "id, pageview_count, max_scroll_pct, total_duration_ms, high_intent_hit, intent_score, last_alert_at",
          )
          .eq("site_id", site.id)
          .eq("anon_id", data.anon_id)
          .maybeSingle();

        // Czy ten anon_id był widziany wcześniej w innej sesji?
        let isReturning = false;
        if (!existing) {
          const { count } = await supabaseAdmin
            .from("sessions")
            .select("id", { count: "exact", head: true })
            .eq("anon_id", data.anon_id)
            .neq("site_id", "00000000-0000-0000-0000-000000000000");
          isReturning = (count ?? 0) > 0;
        }

        const newPageviewCount = (existing?.pageview_count ?? 0) + 1;
        const newMaxScroll = Math.max(
          existing?.max_scroll_pct ?? 0,
          data.scroll_pct ?? 0,
        );
        const newDuration = Math.max(
          existing?.total_duration_ms ?? 0,
          data.duration_ms ?? 0,
        );
        const newHighIntent = (existing?.high_intent_hit ?? false) || isHighIntent;

        const newScore = computeIntentScore({
          pageviewCount: newPageviewCount,
          totalDurationMs: newDuration,
          maxScrollPct: newMaxScroll,
          highIntentHit: newHighIntent,
          hasCompany: !!company,
          isReturnVisitor: isReturning,
        });

        let sessionId: string;
        if (existing) {
          sessionId = existing.id;
          await supabaseAdmin
            .from("sessions")
            .update({
              last_seen_at: now,
              company_id: company?.id ?? null,
              country: company?.country ?? null,
              pageview_count: newPageviewCount,
              max_scroll_pct: newMaxScroll,
              total_duration_ms: newDuration,
              high_intent_hit: newHighIntent,
              intent_score: newScore,
            })
            .eq("id", sessionId);
        } else {
          const { data: created, error: insErr } = await supabaseAdmin
            .from("sessions")
            .insert({
              site_id: site.id,
              anon_id: data.anon_id,
              ip_hash: hashIp(ip),
              user_agent: ua,
              country: company?.country ?? null,
              company_id: company?.id ?? null,
              pageview_count: newPageviewCount,
              max_scroll_pct: newMaxScroll,
              total_duration_ms: newDuration,
              high_intent_hit: newHighIntent,
              intent_score: newScore,
            })
            .select("id")
            .single();
          if (insErr || !created) {
            console.error(insErr);
            return new Response("Insert failed", { status: 500, headers: CORS });
          }
          sessionId = created.id;
          // Background: log IP resolution for debug panel (new sessions only)
          logIpLookup(site.id, ip, company?.id ?? null, resolutionLayer).catch(() => {});
        }

        await supabaseAdmin.from("pageviews").insert({
          session_id: sessionId,
          url: data.url,
          referrer: data.referrer ?? null,
          title: data.title ?? null,
        });

        // KILLER FEATURE: real-time hot lead alert
        // Debounce 1h per session, próg konfigurowany per site.
        const threshold = site.alert_threshold ?? 70;
        const lastAlert = existing?.last_alert_at ? new Date(existing.last_alert_at).getTime() : 0;
        const debounceOk = Date.now() - lastAlert > 3_600_000;
        if (newScore >= threshold && debounceOk) {
          maybeFireHotLeadAlert({
            workspaceId: site.workspace_id,
            sessionId,
            score: newScore,
            company,
            pageviewCount: newPageviewCount,
            totalDurationMs: newDuration,
            maxScrollPct: newMaxScroll,
            lastUrl: data.url,
            siteDomain: site.domain,
          }).catch((e) => console.error("hot lead alert failed", e));
        }

        if (company) {
          maybeFireTargetAccountAlert(site.workspace_id, company).catch((e) =>
            console.error(e),
          );
        }

        return new Response(JSON.stringify({ ok: true, score: newScore }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...CORS },
        });
      },
    },
  },
});
