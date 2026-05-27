import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

async function resolveCompany(anonId: string): Promise<{ id: string; domain: string; name: string; country: string | null } | null> {
  // Deterministic mock: hash the anon id and pick a company from the seeded list.
  // 30% of visitors are intentionally unresolved.
  const h = createHash("md5").update(anonId).digest();
  if (h[0] < 76) return null; // ~30% unresolved
  const { data: companies } = await supabaseAdmin
    .from("companies")
    .select("id, domain, name, country")
    .order("domain", { ascending: true });
  if (!companies || companies.length === 0) return null;
  const idx = h.readUInt32BE(1) % companies.length;
  return companies[idx];
}

async function maybeFireAlerts(workspaceId: string, company: { id: string; domain: string; name: string }) {
  // Check if company matches any target_account by company_id or domain pattern.
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
    .eq("workspace_id", workspaceId);
  if (!integrations) return;

  for (const integ of integrations) {
    if (!integ.enabled) continue;
    const url = (integ.settings as any)?.webhook_url as string | undefined;
    if (!url) continue;
    const text = `🎯 Target account visit: *${company.name}* (${company.domain})`;
    const body =
      integ.type === "teams"
        ? JSON.stringify({ text })
        : JSON.stringify({ text });
    try {
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
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

        // Resolve site by tracking_id
        const { data: site } = await supabaseAdmin
          .from("sites")
          .select("id, workspace_id, domain")
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

        const company = await resolveCompany(data.anon_id);

        // Find or create session keyed by (site_id, anon_id)
        const { data: existing } = await supabaseAdmin
          .from("sessions")
          .select("id")
          .eq("site_id", site.id)
          .eq("anon_id", data.anon_id)
          .maybeSingle();

        let sessionId: string;
        if (existing) {
          sessionId = existing.id;
          await supabaseAdmin
            .from("sessions")
            .update({
              last_seen_at: new Date().toISOString(),
              company_id: company?.id ?? null,
              country: company?.country ?? null,
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
            })
            .select("id")
            .single();
          if (insErr || !created) {
            console.error(insErr);
            return new Response("Insert failed", { status: 500, headers: CORS });
          }
          sessionId = created.id;
        }

        await supabaseAdmin.from("pageviews").insert({
          session_id: sessionId,
          url: data.url,
          referrer: data.referrer ?? null,
          title: data.title ?? null,
        });

        if (company) {
          // Fire and forget — don't await network to keep the beacon snappy.
          maybeFireAlerts(site.workspace_id, company).catch((e) => console.error(e));
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...CORS },
        });
      },
    },
  },
});
