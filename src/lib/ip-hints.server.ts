// Warstwa 3 — crowdsourced rozpoznawanie firm po IP (PL ISP fallback)
//
// Po co: warstwa 2 (ipinfo) nie rozpoznaje firm korzystających z polskich ISP
// (Orange, T-Mobile, UPC, Play, Vectra, Plus, Netia, Multimedia, Inea), bo
// to wspólne pule SOHO. Tu zbieramy sygnał z `identify`: jeśli ktoś podaje
// firmowy email (np. anna@allegro.pl) z IP w zakresie Orange Business
// 89.108.10.0/24 + ASN AS5617 — to mocna przesłanka, że ten /24 to Allegro.
//
// Po kilku potwierdzeniach (confidence ≥ 2) traktujemy hint jako prawdę i
// rozpoznajemy kolejne wizyty z tego prefiksu jako tę firmę — nawet bez
// identify. Cała sieć VisitorID się uczy razem.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { lookupIp } from "@/lib/ipinfo.server";

// Darmowe maile — nie wnoszą sygnału o firmie
const FREEMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "wp.pl", "o2.pl", "onet.pl", "onet.eu",
  "interia.pl", "interia.eu", "tlen.pl", "vp.pl", "op.pl", "poczta.fm",
  "yahoo.com", "yahoo.pl", "outlook.com", "hotmail.com", "live.com",
  "icloud.com", "me.com", "proton.me", "protonmail.com",
]);

// Próg confidence — od ilu niezależnych potwierdzeń ufamy hintowi
const HINT_CONFIDENCE_THRESHOLD = 2;

function ipv4Prefix24(ip: string): string | null {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/);
  if (!m) return null;
  return `${m[1]}.${m[2]}.${m[3]}.0/24`;
}

function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  const dom = email.slice(at + 1).toLowerCase().trim();
  if (!dom || FREEMAIL_DOMAINS.has(dom)) return null;
  return dom;
}

/**
 * Wywoływane z /identify — gdy user podaje firmowy email z residential PL IP,
 * tworzymy/utwierdzamy hint (ASN + /24) → company(domain).
 */
export async function recordIdentifyHint(ip: string | null, email: string): Promise<void> {
  if (!ip) return;
  const prefix = ipv4Prefix24(ip);
  if (!prefix) return; // IPv6 — pominijmy na razie
  const domain = emailDomain(email);
  if (!domain) return;

  const info = await lookupIp(ip);
  const asn = info?.asn?.asn;
  if (!asn) return;

  // Upsert company po domenie z maila
  const { data: existing } = await supabaseAdmin
    .from("companies")
    .select("id")
    .eq("domain", domain)
    .maybeSingle();

  let companyId = existing?.id;
  if (!companyId) {
    const { data: created, error } = await supabaseAdmin
      .from("companies")
      .insert({
        domain,
        name: domain, // placeholder — wzbogacimy później
        country: info?.country ?? null,
      })
      .select("id")
      .single();
    if (error || !created) {
      console.error("[ip-hints] failed to upsert company", error);
      return;
    }
    companyId = created.id;
  }

  const { error: rpcErr } = await supabaseAdmin.rpc("increment_ip_hint", {
    _asn: asn,
    _prefix: prefix,
    _company_id: companyId,
  });
  if (rpcErr) console.error("[ip-hints] increment failed", rpcErr);
}

/**
 * Wywoływane z /collect gdy warstwa 2 nic nie zwróciła (residential ISP).
 * Sprawdza ip_company_hints — jeśli mamy wystarczająco mocny hint dla
 * (ASN, /24), zwracamy firmę.
 */
export async function resolveCompanyByHint(
  ip: string | null,
): Promise<{ id: string; domain: string; name: string; country: string | null } | null> {
  if (!ip) return null;
  const prefix = ipv4Prefix24(ip);
  if (!prefix) return null;

  const info = await lookupIp(ip);
  const asn = info?.asn?.asn;
  if (!asn) return null;

  const { data: hint } = await supabaseAdmin
    .from("ip_company_hints")
    .select("company_id, confidence")
    .eq("asn", asn)
    .eq("ip_prefix", prefix)
    .gte("confidence", HINT_CONFIDENCE_THRESHOLD)
    .order("confidence", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!hint) return null;

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("id, domain, name, country")
    .eq("id", hint.company_id)
    .maybeSingle();

  return company ?? null;
}
