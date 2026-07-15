# CRM push — HubSpot + Pipedrive (Fala 1, #10)

## Cel
Gdy Pixie wykryje hot lead (score ≥ threshold), obok Slack/Teams/email trafia on jako **Company + Contact + Note/Activity** do CRM handlowca. Bez ręcznego kopiowania.

## Scope MVP
1. **HubSpot** (priorytet — ~40% rynku SMB PL) i **Pipedrive** (drugi wybór polskich sprzedażówek).
2. **Push per workspace**, jedno konto CRM na workspace (App connector, nie per-user).
3. Kierunek jednostronny: **Pixie → CRM**. Bez importu wstecznego (na razie).
4. Trigger: ten sam co Slack alerts — `intent_score ≥ threshold` + debounce 1h/company.

## Architektura

### Connectors
- **HubSpot**: `standard_connectors--connect` (`connector_id: hubspot`) — gateway, service key `pat-...` z scope: `crm.objects.contacts.write`, `crm.objects.companies.write`, `crm.objects.deals.read`, `crm.objects.notes.write`.
- **Pipedrive**: `standard_connectors--connect` (`connector_id: pipedrive`) — gateway, api token.
- Sekrety trafiają jako `HUBSPOT_API_KEY` / `PIPEDRIVE_API_KEY` do env (workspace-wide → dostępne dla wszystkich workspace'ów w projekcie; per-workspace routing rozwiążemy w Fali 2).

### Schema
Nowa tabela `crm_integrations`:
- `workspace_id`, `provider` (`hubspot|pipedrive`), `enabled bool`, `min_score int default 70`, `owner_email text` (do przypisania w CRM), `last_push_at timestamptz`, `last_error text`.
- RLS: workspace members read/write, service_role full.

Rozszerzenie `sessions` / hot-leads: dodać kolumnę `pushed_to_crm jsonb` (log providerów, do których poszło) — zapobiega duplikatom.

### Kod
- `src/lib/crm/hubspot.server.ts` — `upsertCompanyAndContact(lead)` przez gateway (`/crm/v3/objects/companies/search` → create/update, potem `/contacts` + `/objects/notes` z linkiem do wizyty w Pixie).
- `src/lib/crm/pipedrive.server.ts` — analogicznie: `/organizations/search` → create, `/persons`, `/activities` (typ: `call`, subject: "Hot lead z Twojej strony").
- `src/lib/crm/dispatch.server.ts` — wywołanie z istniejącego `alerts.server.ts`, obok Slack/Teams: iteruj po enabled integrations, wywołaj providera, zapisz result do `pushed_to_crm`.
- Retry: 1 próba + log do `last_error` (bez kolejki na start).

### UI
Rozbudowa `app.integrations.tsx`:
- Karta **HubSpot**: status connection (z `list_connections`), toggle enabled, slider `min_score`, input `owner_email`, button "Test push" (wysyła fake leada Allegro), link "Ostatnie 5 pushy" z logiem.
- Karta **Pipedrive**: identycznie.
- Komunikat: "Aby połączyć, poproś Pixie w czacie: *Połącz HubSpot*" (bo connector picker to tool).

### Data mapping (co ląduje w CRM)
| Pixie | HubSpot | Pipedrive |
|---|---|---|
| `company.name` + `nip` | Company (`name`, `domain`, `nip_pl` custom) | Organization (`name`, custom field `nip`) |
| pierwsza osoba z `people` | Contact (`email`, `firstname`, `lastname`) | Person |
| Note z linkiem do `app/companies/{id}` + timeline sesji | Note na Company | Activity typu "note" |
| `intent_score` | Custom property `pixie_score` | Custom field |

## Poza scope (Fala 2)
- Salesforce, Zoho, Freshsales.
- Bi-directional sync (statusy z CRM → Pixie).
- Kolejka + exponential backoff.
- Per-user CRM (każdy handlowiec swoje konto → App User Connector).

## Kolejność wykonania
1. Migracja: `crm_integrations` + `sessions.pushed_to_crm`.
2. `list_app_connectors` → potwierdzić dostępność HubSpot i Pipedrive, potem `connect` dla obu (wymaga akcji usera).
3. `hubspot.server.ts` + testowy fetch companies przez gateway.
4. `pipedrive.server.ts` + test.
5. `dispatch.server.ts` + integracja w `alerts.server.ts`.
6. UI w `app.integrations.tsx` + "Test push".
7. Weryfikacja: trigger `testIntegration` → sprawdź, że w CRM pojawia się firma "Pixie Test — Allegro" z notatką.

## Ryzyka
- **HubSpot scopes**: user musi wygenerować `pat-...` z prawidłowymi scope'ami — inaczej `MISSING_SCOPES`. Instrukcja w UI.
- **Duplikaty**: HubSpot deduplikuje po `domain` — używamy `company.domain` z rejestru CEIDG/KRS. Firmy bez domeny → search po `name` + `nip` custom property.
- **Rate limits**: HubSpot 100 req/10s, Pipedrive 100 req/10s — MVP nie zbliża się.
- **NIP jako custom property**: user musi ją utworzyć w CRM ręcznie (albo tworzymy programatycznie przy pierwszym push — Fala 2).

## Estymacja
2–3 tury implementacji (migracja + 2 connectory + dispatch + UI). Testy end-to-end zależne od realnego konta HubSpot/Pipedrive u usera.
