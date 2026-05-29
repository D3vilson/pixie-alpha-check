// Polski rejestr firm — publiczne API KRS (Ministerstwo Sprawiedliwości).
// https://api-krs.ms.gov.pl/api/krs/OdpisAktualny/{krs}?rejestr=P&format=json
// Bez klucza. Rejestr "P" (przedsiębiorcy) -> fallback "S" (stowarzyszenia).

const FETCH_TIMEOUT_MS = 6000;

export type KrsLookupResult = {
  krs: string;
  name: string;
  nip?: string;
  regon?: string;
  pkd?: string;
  address?: string;
};

async function fetchWithTimeout(url: string, ms: number): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function pickAddress(adres: Record<string, unknown> | undefined): string | undefined {
  if (!adres) return undefined;
  const a = adres as {
    ulica?: string;
    nrDomu?: string;
    nrLokalu?: string;
    miejscowosc?: string;
    kodPocztowy?: string;
    kraj?: string;
  };
  const line1 = [a.ulica, a.nrDomu && (a.nrLokalu ? `${a.nrDomu}/${a.nrLokalu}` : a.nrDomu)]
    .filter(Boolean).join(" ");
  const line2 = [a.kodPocztowy, a.miejscowosc].filter(Boolean).join(" ");
  return [line1, line2].filter(Boolean).join(", ") || undefined;
}

export async function lookupKrs(krsRaw: string): Promise<KrsLookupResult | null> {
  const krs = krsRaw.replace(/\D/g, "").padStart(10, "0");
  if (krs.length !== 10) return null;

  for (const rejestr of ["P", "S"] as const) {
    const url = `https://api-krs.ms.gov.pl/api/krs/OdpisAktualny/${krs}?rejestr=${rejestr}&format=json`;
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    if (!res || !res.ok) continue;
    let json: unknown;
    try { json = await res.json(); } catch { continue; }
    const odpis = (json as { odpis?: { dane?: Record<string, unknown> } }).odpis;
    const dane = odpis?.dane as
      | { dzial1?: Record<string, unknown>; dzial3?: Record<string, unknown> }
      | undefined;
    if (!dane?.dzial1) continue;

    const dz1 = dane.dzial1 as {
      danePodmiotu?: {
        nazwa?: string;
        identyfikatory?: { nip?: string; regon?: string };
      };
      siedzibaIAdres?: { adres?: Record<string, unknown> };
    };
    const dz3 = dane.dzial3 as {
      przedmiotDzialalnosci?: {
        przedmiotPrzewazajacejDzialalnosci?: Array<{ opis?: string; kodPKD?: string }>;
      };
    } | undefined;

    const name = dz1.danePodmiotu?.nazwa;
    if (!name) continue;

    const pkdEntry = dz3?.przedmiotDzialalnosci?.przedmiotPrzewazajacejDzialalnosci?.[0];
    const pkd = pkdEntry
      ? [pkdEntry.kodPKD, pkdEntry.opis].filter(Boolean).join(" — ")
      : undefined;

    return {
      krs,
      name: name.trim(),
      nip: dz1.danePodmiotu?.identyfikatory?.nip,
      regon: dz1.danePodmiotu?.identyfikatory?.regon,
      pkd,
      address: pickAddress(dz1.siedzibaIAdres?.adres),
    };
  }
  return null;
}
