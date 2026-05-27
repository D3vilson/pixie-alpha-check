// Wzbogacanie firm — logo + nazwa + opis
//
// Logo: Clearbit Logo API (https://logo.clearbit.com/{domain}) — darmowe,
// bez klucza. Zwraca obrazek lub 404. Zapisujemy URL, nie cachujemy pliku.
//
// Nazwa/opis: pobieramy stronę domową domeny i parsujemy <title> +
// <meta name="description"> / <meta property="og:site_name"> / og:description.
// Tanio, brak zewnętrznego API. Timeout 4s żeby nie blokować.
//
// Refresh: nie częściej niż raz na 30 dni (enriched_at).

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ENRICH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dni
const FETCH_TIMEOUT_MS = 4000;

async function fetchWithTimeout(url: string, ms: number): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "VisitorID-EU/1.0 (+https://app.visitorid.eu/bot)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function pickMeta(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1].trim()).slice(0, 500);
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

async function scrapeDomainMeta(
  domain: string,
): Promise<{ name?: string; description?: string }> {
  // Próbujemy https najpierw, potem http
  for (const scheme of ["https", "http"] as const) {
    const res = await fetchWithTimeout(`${scheme}://${domain}/`, FETCH_TIMEOUT_MS);
    if (!res || !res.ok) continue;
    const html = (await res.text()).slice(0, 200_000); // hard cap

    const ogSiteName = pickMeta(html, [
      /<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+property=["']og:site_name["']/i,
    ]);
    const title = pickMeta(html, [/<title[^>]*>([^<]+)<\/title>/i]);
    const description = pickMeta(html, [
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
      /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i,
    ]);

    // Czyść tytuł: usuń " | Brand", " - Brand" itp. — bierzemy najkrótszy człon
    let name = ogSiteName ?? title ?? undefined;
    if (name) {
      const parts = name.split(/\s+[|–—-]\s+/).map((p) => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        // Wybierz najkrótszy człon ≥3 znaki — zwykle to nazwa marki
        const shortest = parts.reduce((a, b) =>
          b.length >= 3 && b.length < a.length ? b : a,
        );
        name = shortest;
      }
      name = name.slice(0, 200);
    }

    return { name, description: description ?? undefined };
  }
  return {};
}

async function checkLogo(domain: string): Promise<string | null> {
  const url = `https://logo.clearbit.com/${encodeURIComponent(domain)}`;
  // HEAD nie zawsze działa — robimy GET ale tylko sprawdzamy status
  const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  if (res && res.ok) return url;
  return null;
}

/**
 * Wzbogaca firmę. Idempotentne — pomija jeśli enriched_at < TTL.
 * Fire-and-forget z /collect i /identify.
 */
export async function enrichCompany(companyId: string): Promise<void> {
  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("id, domain, name, logo_url, description, enriched_at")
    .eq("id", companyId)
    .maybeSingle();
  if (!company) return;

  // Skip jeśli świeże
  if (company.enriched_at) {
    const age = Date.now() - new Date(company.enriched_at).getTime();
    if (age < ENRICH_TTL_MS) return;
  }

  const domain = company.domain;
  if (!domain) return;

  const [meta, logo] = await Promise.all([
    scrapeDomainMeta(domain),
    company.logo_url ? Promise.resolve(company.logo_url) : checkLogo(domain),
  ]);

  // Tylko wpisujemy jeśli mamy coś nowego / nazwa wygląda na placeholder (==domain)
  const updates: Record<string, unknown> = { enriched_at: new Date().toISOString() };
  if (meta.name && (company.name === domain || !company.name)) updates.name = meta.name;
  if (meta.description && !company.description) updates.description = meta.description;
  if (logo && !company.logo_url) updates.logo_url = logo;

  const { error } = await supabaseAdmin
    .from("companies")
    .update(updates)
    .eq("id", company.id);
  if (error) console.error("[enrich] update failed", error);
}
