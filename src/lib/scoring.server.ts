// Intent scoring — czysta funkcja, deterministyczna, testowalna.
// Skala 0-100. Inputy znormalizowane do "bezpiecznych" wartości.

export interface ScoringInputs {
  pageviewCount: number;        // unikalne odsłony w sesji
  totalDurationMs: number;      // łączny czas
  maxScrollPct: number;         // 0-100
  highIntentHit: boolean;       // odwiedził pricing/demo/contact
  hasCompany: boolean;          // udało się rozpoznać firmę
  isReturnVisitor: boolean;     // anon_id widziany wcześniej w innej sesji
}

const W = {
  pages: 8,        // do 5 stron → 40 pkt
  time: 6,         // do 5 min → 30 pkt
  scroll: 0.15,    // 100% scroll → 15 pkt
  highIntent: 25,  // jednorazowy bonus
  company: 10,    // bonus za rozpoznanie firmy
  returning: 10,   // powracający gość
} as const;

export function computeIntentScore(i: ScoringInputs): number {
  const pagesPts = Math.min(5, i.pageviewCount) * W.pages;
  const timePts = Math.min(300_000, i.totalDurationMs) / 1000 / 60 * W.time;
  const scrollPts = Math.min(100, Math.max(0, i.maxScrollPct)) * W.scroll;
  const intentPts = i.highIntentHit ? W.highIntent : 0;
  const companyPts = i.hasCompany ? W.company : 0;
  const returnPts = i.isReturnVisitor ? W.returning : 0;
  const raw = pagesPts + timePts + scrollPts + intentPts + companyPts + returnPts;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function matchesHighIntent(url: string, patterns: string[]): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return patterns.some((p) => path.includes(p.toLowerCase()));
  } catch {
    return false;
  }
}
