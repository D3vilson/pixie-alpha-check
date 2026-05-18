
# VisitorID EU — GDPR-Compliant Visitor Identification

A SaaS that reveals which companies (and, with consent, which people) visit your website. EU-first, built around GDPR rather than around it.

## Positioning vs RB2B

RB2B identifies individuals on US traffic via a third-party identity graph. That model does not work cleanly under GDPR: matching an IP/cookie to a named person is personal data and requires a lawful basis (usually consent). This product takes a two-tier approach:

- **Tier 1 — Company reveal (default, no consent required).** Reverse-IP lookup to the visiting organisation. Legitimate interest basis. No personal data leaves the visitor's browser beyond what a normal analytics request already contains.
- **Tier 2 — Person reveal (consent-gated).** Only activates for visitors who pass an explicit consent gate (CMP signal, form submission, email link click, or logged-in identifier). No partner identity graph in v1.

This is the honest answer to "RB2B for Europe" — and the differentiator we lead with on the marketing site.

---

## Scope of v1

A full SaaS shell with:

1. Public marketing site (home, features, pricing, GDPR/legal, login, signup)
2. Authenticated dashboard (visits feed, company detail, target accounts, settings)
3. Tracking script served from our domain, embeddable in one line
4. Ingestion endpoint that records pageviews + resolves company (mocked)
5. Slack + Microsoft Teams notifications for target-account visits
6. Multi-tenant workspaces with role-based access
7. Consent-gated person reveal flow (form fill / identified user merge)

Real IP enrichment is deferred — we ship behind a provider interface and seed mock company data so the entire product is demoable end-to-end.

---

## User flows

**Marketer signs up** → creates workspace → copies tracking snippet → installs on site → sees first visits within minutes (mock data in dev, real once enrichment is wired).

**Visit happens** → script POSTs pageview → server resolves IP→company → stores visit → if company matches a target account, sends Slack/Teams alert.

**Person reveal** → visitor submits a form (newsletter, demo, gated content) → form posts to our identify endpoint with consent flag + email → we link the prior anonymous session(s) to that person.

**Sales user** → opens dashboard → filters live feed by target accounts, industry, pages viewed → opens a company card showing all sessions, pages, time on site, and any identified people.

---

## Information architecture

```text
Marketing (public)
  /                       Home — "RB2B-style reveal, GDPR-native"
  /features               Company reveal, consent flow, integrations
  /pricing                Tiered by monthly identified companies
  /gdpr                   Lawful basis explainer, DPA, sub-processors
  /docs/install           Snippet + verification
  /login  /signup

App (authenticated, /_authenticated/...)
  /app                    Live visits feed
  /app/companies          Identified companies list
  /app/companies/$id      Company detail (sessions, pages, people)
  /app/people             Consent-identified people
  /app/target-accounts    Saved target lists + alert rules
  /app/integrations       Slack, Teams, webhooks
  /app/settings           Workspace, members, tracking script, billing
```

---

## Data model

```text
workspaces           id, name, plan
workspace_members    workspace_id, user_id, role (owner|admin|member)
sites                workspace_id, domain, tracking_id
sessions             site_id, anon_id, ip_hash, ua, country, started_at, person_id?
pageviews            session_id, url, referrer, title, ts
companies            id, domain, name, industry, size, country, logo_url
company_visits       site_id, company_id, session_id, first_seen, last_seen
target_accounts      workspace_id, company_id|domain_pattern, label
alert_rules          workspace_id, target_account_id?, channel (slack|teams|webhook), config
people               workspace_id, email, name?, company_id?, consent_source, consent_ts
identify_events      session_id, person_id, source, consent_proof
integrations         workspace_id, type, credentials (encrypted), settings
```

IP itself is never stored in clear — only a salted hash for short-term dedupe (auto-purged after 30 days). This is the GDPR posture we'll document.

---

## Technical details

**Stack.** TanStack Start (already scaffolded), Lovable Cloud (Postgres + auth + storage), shadcn/ui, Tailwind v4 tokens in `src/styles.css`. Slack via the Lovable Slack connector. Teams via Graph API connector.

**Tracking script.** Served from `/api/public/t.js` (TanStack server route). Tiny: assigns an anon cookie scoped to the customer's site (first-party via their own snippet — no third-party cookie issues), POSTs pageviews to `/api/public/collect`.

**Ingestion.** `/api/public/collect` validates payload with Zod, rate-limits per tracking_id, looks up the visitor's IP through a `CompanyResolver` interface (mock implementation now, swap to IPinfo/IP2Location later by changing one binding), upserts session + pageview, evaluates alert rules, fires Slack/Teams webhook async.

**Identify endpoint.** `/api/public/identify` accepts `{ tracking_id, anon_id, email, consent: { source, timestamp, proof } }`. Without a consent payload the call is rejected — no silent enrichment.

**Auth-protected serverFns.** All dashboard data goes through `createServerFn` with `requireSupabaseAuth`, scoped by workspace membership.

**Slack / Teams.** Per-workspace integration. Connector returns `SLACK_API_KEY` env var; we send via the gateway. Message includes company name, country, pages viewed, and a deep link to the company in the dashboard.

**Mock enrichment.** A seeded list of ~50 fake European companies (Klarna-like, Spotify-like, fictional SMBs across DE/FR/NL/SE) with logos. The resolver picks deterministically from the IP hash so demo data is stable per visitor.

**GDPR specifics baked in.**
- Salted IP hashing, 30-day raw-event TTL.
- Region detection: if visitor IP is outside EEA we can still reveal (US/UK/CH have separate regimes) but the default policy stays consent-gated for person data.
- DPA template at `/gdpr`, sub-processor list, data deletion endpoint per workspace.
- Tracking script honours Global Privacy Control and a `do-not-identify` cookie.

---

## Out of scope for v1 (call out so we don't sprawl)

- Real IP→company provider wiring (interface ready, switch later)
- CRM sync (HubSpot/Salesforce) — webhook in v1, native later
- Identity graph / third-party person reveal
- Billing collection (Stripe) — pricing page only, "Join waitlist" CTA
- Mobile app

---

## Build order

1. Lovable Cloud on + schema + RLS (workspaces, members, sites, sessions, pageviews, companies, company_visits, target_accounts, alert_rules, people, integrations).
2. Marketing site (home, features, pricing, gdpr, docs/install) with a clear EU/GDPR narrative.
3. Auth (email + Google) and workspace creation flow.
4. Authenticated shell + tracking script install screen.
5. `/api/public/t.js` + `/api/public/collect` with mock `CompanyResolver` and seed data.
6. Live visits feed + company detail.
7. Target accounts + alert rules.
8. Slack connector + Teams integration; fire on rule match.
9. Consent-gated `/api/public/identify` + people view.
10. GDPR page, DPA, data-deletion endpoint, polish.

Once you approve, I'll start by enabling Lovable Cloud and laying down the schema + marketing shell.
