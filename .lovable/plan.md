# Uproszczenie landing page

Tnę landing do absolutnego minimum. Cztery sekcje, koniec.

## Nowa struktura

1. **Hero — CO + DLA KOGO**
   - H1, sub (1 zdanie: dla kogo)
   - 2 CTA (Start free / See snippet)
   - SampleVisits po prawej (zostawiam — pokazuje produkt)
   - Bullets pod CTA (3 max, twarde fakty)

2. **Jak to działa — JAK** (3 warstwy: Pixel / Identify / Enrich)
   - Bez podtytułu, bez ozdobników. 3 karty.

3. **Dlaczego to działa — DLACZEGO** (Moat)
   - Network effect w 1 zdaniu + 2 liczby (50 / 200 klientów)

4. **Compliance** (skrócone)
   - 4 bullety, link do /gdpr. Bez osobnej sekcji "Privacy" w nagłówku.

5. **CTA** (final)

## Co wycinam

- `ForWhom` sekcja (3 karty) — DLA KOGO przenoszę do sub w Hero (1 zdanie)
- `FeatureGrid` (Reverse-IP / Crowdsourced / CEIDG+KRS / Intent scoring) — wycinam całkowicie. Te detale są na `/features`. Landing nie potrzebuje 4 dodatkowych kart obok 3 warstw How.
- `howSub` (podtytuł nad warstwami) — wycinam
- `moatExplain` (drugi akapit pod liczbami) — wycinam, zostaje sam lead
- Samples-related dekoracje — zostaje sam komponent

## Pliki

- `src/routes/_marketing.index.tsx` — usuwam `ForWhom`, `FeatureGrid`, upraszczam `Moat`, `HowItWorks`, `Compliance`
- `src/i18n/translations.ts` — usuwam klucze: `forWhomH2`, `forWhom`, `featureGridH2`, `featureGrid`, `howSub`, `moatExplain`. Skracam `compliancePoints` do 4.

## Czego NIE ruszam

- `/features`, `/gdpr`, `/docs/install`, `/pricing` — bez zmian
- Nav, footer, routing
- Backend, schema, serverFns
