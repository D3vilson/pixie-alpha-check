// Warstwa 2 — identyfikacja przez reverse-IP (ipinfo.io)
// Free tier: 50k lookups/mies, zwraca ASN + company.domain + lokalizację.
// Dla polskich ISP residential (Orange, T-Mobile, UPC, Play, Vectra, Plus,
// Netia, Multimedia, Inea) NIE rozwiązujemy firmy — to mieszany ruch SOHO.
// Tę lukę pokryje warstwa 3: crowdsourced baza PL (kolejny krok).

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type IpinfoResult = {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
  asn?: { asn: string; name: string; domain: string; route: string; type: string };
  company?: { name: string; domain: string; type: string };
};

// Domeny / ASN-y polskich ISP, których nie traktujemy jako firmy
const PL_RESIDENTIAL_ISP_PATTERNS = [
  "orange.pl", "tmobile.pl", "t-mobile", "upc.pl", "upc-broadband",
  "play.pl", "p4 sp", "vectra", "plus.pl", "polkomtel", "netia",
  "multimedia.pl", "inea.pl", "tpnet", "telekomunikacja polska",
];

const cache = new Map<string, { value: IpinfoResult | null; expires: number }>();
const TTL_MS = 60 * 60 * 1000; // 1h

export async function lookupIp(ip: string): Promise<IpinfoResult | null> {
  if (!ip || ip === "127.0.0.1" || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return null;
  }
  const now = Date.now();
  const hit = cache.get(ip);
  if (hit && hit.expires > now) return hit.value;

  const token = process.env.IPINFO_TOKEN;
  if (!token) {
    console.error("[ipinfo] IPINFO_TOKEN not configured");
    return null;
  }

  try {
    const res = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}?token=${token}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error(`[ipinfo] lookup failed ${res.status} for ${ip}`);
      cache.set(ip, { value: null, expires: now + 5 * 60 * 1000 });
      return null;
    }
    const data = (await res.json()) as IpinfoResult;
    cache.set(ip, { value: data, expires: now + TTL_MS });
    return data;
  } catch (e) {
    console.error("[ipinfo] network error", e);
    return null;
  }
}

function isResidentialISP(info: IpinfoResult): boolean {
  const haystack = [
    info.org ?? "",
    info.company?.name ?? "",
    info.company?.domain ?? "",
    info.asn?.name ?? "",
    info.asn?.domain ?? "",
  ].join(" ").toLowerCase();
  return PL_RESIDENTIAL_ISP_PATTERNS.some((p) => haystack.includes(p));
}

export async function resolveCompanyByIp(
  ip: string | null,
): Promise<{ id: string; domain: string; name: string; country: string | null } | null> {
  if (!ip) return null;
  const info = await lookupIp(ip);
  if (!info) return null;

  // Pomiń residential ISP (warstwa 3 to dopełni)
  if (isResidentialISP(info)) return null;

  // Wyciągnij domenę i nazwę firmy
  const domain = (info.company?.domain || info.asn?.domain || "").toLowerCase().trim();
  const name = info.company?.name || info.asn?.name || info.org || "";
  if (!domain || !name) return null;

  // Pomiń "hosting"/"isp" type — to data center, nie firma docelowa
  const type = (info.company?.type || info.asn?.type || "").toLowerCase();
  if (type === "hosting" || type === "isp") return null;

  const country = info.country ?? null;

  // Upsert po domenie (companies.domain nie ma unique constraintu — szukamy ręcznie)
  const { data: existing } = await supabaseAdmin
    .from("companies")
    .select("id, domain, name, country")
    .eq("domain", domain)
    .maybeSingle();

  if (existing) return existing;

  const { data: inserted, error } = await supabaseAdmin
    .from("companies")
    .insert({ domain, name, country })
    .select("id, domain, name, country")
    .single();

  if (error || !inserted) {
    console.error("[ipinfo] failed to upsert company", error);
    return null;
  }
  return inserted;
}
