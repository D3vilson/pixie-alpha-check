// Warstwa 2.5 — mapowanie firm po ASN (kuratorowana baza)
//
// Kiedy ipinfo zwraca ASN (np. AS197226 "Allegro.pl sp. z o.o."), ale bez
// pola `company` (typowe dla mniejszych ASN-ów), używamy własnej mapy ASN →
// firma. Sieć ASN-owa jest stabilniejsza od /24 hintów — jedna firma zwykle
// ma cały ASN, więc jeden wpis pokrywa cały jej ruch.
//
// Uzupełniana ręcznie przez admina platformy lub automatycznie z hintów
// (jeśli hint pokrywa cały ASN z wysokim confidence — TODO).

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { lookupIp } from "@/lib/ipinfo.server";

type ResolvedCompany = {
  id: string;
  domain: string;
  name: string;
  country: string | null;
};

export async function resolveCompanyByAsn(
  ip: string | null,
): Promise<ResolvedCompany | null> {
  if (!ip) return null;
  const info = await lookupIp(ip);
  const asn = info?.asn?.asn;
  if (!asn) return null;

  // Odrzuć hosting/ISP na poziomie ASN
  const asnType = (info.asn?.type ?? "").toLowerCase();
  if (asnType === "hosting" || asnType === "isp") return null;

  const { data: map } = await supabaseAdmin
    .from("asn_companies")
    .select("company_name, company_domain, country")
    .eq("asn", asn)
    .maybeSingle();

  if (!map) return null;

  const domain = map.company_domain.toLowerCase().trim();
  const name = map.company_name;
  const country = map.country ?? info.country ?? null;

  // Upsert w tabeli companies po domenie
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
    console.error("[asn-map] failed to upsert company", error);
    return null;
  }
  return inserted;
}
