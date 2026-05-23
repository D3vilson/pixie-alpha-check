
# Pivot: VisitorID EU → polski B2B reveal z crowdsourced moat

Repozycjonowanie produktu pod polski rynek MŚP. Bez zmian w backendzie, schemacie bazy, dashboardzie i pricingu — to jest iteracja na warstwie narracji i contentu. Wszystko dwujęzyczne (PL/EN) — i18n już mamy.

## Co się zmienia

### 1. Hero (`_marketing.index.tsx`)
- Nowa obietnica: "Zobacz które polskie firmy odwiedzają Twoją stronę. Identyfikacja na poziomie organizacji, bez cookies, zgodnie z wyrokiem NSA z 16.10.2025."
- Bullet list pod CTA: bez cookies, bez danych osobowych, CEIDG + KRS, free forever z pixelem.
- Sample visits dashboard: podmienić Klarna/Mistral/Personio na polskie firmy (np. Brand24, DocPlanner, Booksy, LiveChat, IFIRMA) z PKD zamiast "industry".

### 2. Sekcja "How it works" → 3 warstwy
Trzy karty zamiast obecnych trzech kroków:
- **Pixel** — 1 linijka JS, instalacja na WordPress/Wix/Webflow/HTML
- **Identyfikacja** — dwie ścieżki: reverse-IP dla zagranicy (ipinfo) + własna baza dla polskich MŚP
- **Enrichment** — CEIDG (NIP, PKD, właściciel), KRS (zarząd), Hunter.io (kontakty)

### 3. Nowa sekcja "Moat" (zamiast obecnego "Differentiator" o RB2B)
Wyjaśnić efekt sieciowy: każdy pixel = dane do bazy IP → polska firma. Konkurent zaczynający rok później zaczyna od zera. Diagram tekstowy:

```text
50 klientów   → coverage ~20% polskich MŚP
200 klientów  → coverage trudny do nadgonienia
```

### 4. Feature grid
Cztery karty: Reverse-IP (zagranica), Crowdsourced PL base, CEIDG+KRS enrichment, Intent scoring (czas + strony).

### 5. `/gdpr` — przepisać
- Wyrok NSA 16.10.2025 jako kluczowy argument (IP ≠ automatycznie dane osobowe).
- Pixel: brak cookies, brak unique browser fingerprint, tylko metadane sieciowe (IP + ASN).
- Gotowy paragraf do polityki prywatności klienta (copy-paste).
- Link do publicznego repo z kodem pixela (placeholder GitHub URL).

### 6. `/features` — przepisać pod 3 warstwy + dashboard
- Sekcja "Pixel" — instalacja, jakie eventy
- Sekcja "Identyfikacja" — tabela coverage (PL vs zagranica, start vs po 50 klientach)
- Sekcja "Enrichment" — tabela źródeł (CEIDG, KRS, Hunter) z opisem co dostarczają
- Sekcja "Dashboard" — kolumny, scoring, filtry

### 7. `/docs/install` — dopisać przewodniki
WordPress, Wix, Webflow, czysty HTML — każdy jako rozwijana sekcja ze snippetem.

### 8. Tłumaczenia (`src/i18n/translations.ts`)
Wszystkie powyższe stringi w PL i EN. PL jako język-matka (pisany pierwszy, EN tłumaczone).

### 9. `.lovable/plan.md`
Zaktualizować sekcję "Positioning" — usunąć RB2B, dodać polski moat thesis.

## Czego nie ruszam
- Pricing (`/pricing`) — user explicit: zostaw obecny
- Schema bazy, RLS, serverFns, dashboard routes (`/app/*`)
- Mock CompanyResolver — wciąż demo
- Auth flow
- Integracje ipinfo/CEIDG/KRS/Hunter (to byłaby "Pełna ścieżka MVP")

## Techniczne uwagi
- Sample visits w hero: hardcoded array — wymiana wartości, bez logiki.
- Diagramy moat/coverage: pure CSS/Tailwind, bez bibliotek.
- Tabele w features/gdpr: shadcn `Table` jeśli już używamy, inaczej semantyczny `<table>` z tokenami.
- Wszystkie kolory przez tokeny z `src/styles.css` (bez hardcoded hex).
- Link do GitHub repo z kodem pixela: placeholder `https://github.com/your-org/pixel` — user podmieni.

## Pliki do edycji
- `src/routes/_marketing.index.tsx` — hero, how-it-works, moat, features, CTA
- `src/routes/_marketing.features.tsx` — pełna przebudowa
- `src/routes/_marketing.gdpr.tsx` — pełna przebudowa, wyrok NSA, paragraf polityki
- `src/routes/_marketing.docs.install.tsx` — dodać WP/Wix/Webflow guides
- `src/i18n/translations.ts` — nowe klucze PL+EN
- `.lovable/plan.md` — zaktualizować positioning

## Kolejne kroki po akceptacji
Jeśli zatwierdzisz ten plan, kolejną iteracją może być:
- **Dashboard UI** — kolumny PKD/scoring/źródło (PL base vs ipinfo), wciąż mock
- **Pełna integracja** — ipinfo.io + CEIDG + KRS + Hunter.io (wymaga API keys)
