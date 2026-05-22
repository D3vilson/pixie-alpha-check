import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield, Building2, BellRing, ScrollText } from "lucide-react";

export const Route = createFileRoute("/_marketing/")({
  head: () => ({
    meta: [
      { title: "VisitorID EU — GDPR-compliant website visitor identification" },
      { name: "description", content: "See which European companies visit your website. Reveal people only after consent. Built around GDPR, not around it." },
      { property: "og:title", content: "VisitorID EU — GDPR-compliant visitor identification" },
      { property: "og:description", content: "Built for the EU. Company reveal by default, person reveal with consent." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <LogoStrip />
      <HowItWorks />
      <Differentiator />
      <FeatureGrid />
      <CTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface to-background" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-accent" />
          GDPR-native · EU-hosted · DPA in 2 clicks
        </div>
        <h1 className="mt-6 max-w-3xl text-5xl leading-[1.05] tracking-tight md:text-7xl">
          See which <span className="italic text-accent">European</span> companies visit your website.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          RB2B-style reveal — but built for GDPR. Identify visiting companies by default with legitimate interest. Reveal people only when they consent. No grey area, no Schrems III risk.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Start identifying — free 14 days
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/gdpr"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-5 py-3 text-sm font-medium text-foreground hover:bg-card transition-colors"
          >
            Read the lawful-basis brief
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No card. No cookies dropped on your visitors. EU-only data residency.</p>

        <div className="mt-16 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-surface/60 px-4 py-2 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-chart-4/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/50" />
            <span className="ml-3 text-xs text-muted-foreground">app.visitorid.eu — Live visits</span>
          </div>
          <div className="divide-y divide-border">
            {SAMPLE_VISITS.map((v) => (
              <div key={v.company} className="flex items-center gap-4 px-5 py-4">
                <div className="h-9 w-9 shrink-0 rounded-md bg-surface flex items-center justify-center text-xs font-semibold text-foreground/70">
                  {v.company.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{v.company}</span>
                    <span className="text-xs text-muted-foreground">· {v.country}</span>
                    {v.target && <span className="rounded-full bg-accent/10 text-accent text-[10px] font-medium px-2 py-0.5">Target account</span>}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{v.pages} pages · {v.last}</div>
                </div>
                <span className="hidden sm:inline text-xs text-muted-foreground">{v.industry}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const SAMPLE_VISITS = [
  { company: "Klarna", country: "SE", pages: 7, last: "just now", industry: "Fintech", target: true },
  { company: "Mistral AI", country: "FR", pages: 3, last: "2 min ago", industry: "AI", target: false },
  { company: "Personio", country: "DE", pages: 12, last: "5 min ago", industry: "HR Tech", target: true },
  { company: "Bolt", country: "EE", pages: 2, last: "8 min ago", industry: "Mobility", target: false },
];

function LogoStrip() {
  return (
    <section className="border-y border-border/60 bg-surface/40 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs uppercase tracking-wider text-muted-foreground">
          Designed for B2B teams across the EU
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-foreground/40 font-display text-2xl">
          <span>Berlin</span><span>Paris</span><span>Amsterdam</span><span>Stockholm</span><span>Madrid</span><span>Dublin</span>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Drop one line of JavaScript", body: "First-party tracking script served from your domain. No third-party cookies. No fingerprinting." },
    { n: "02", title: "We resolve the IP to a company", body: "Lawful basis: legitimate interest. The company name — not a person — is what shows up." },
    { n: "03", title: "Get a Slack ping the moment a target account lands", body: "Filter by industry, pages, country. Forward to your CRM via webhook." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <h2 className="text-3xl md:text-5xl max-w-2xl">From install to first identified visit in under 5 minutes.</h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-xl border border-border bg-card p-6">
            <div className="font-display text-3xl text-accent">{s.n}</div>
            <h3 className="mt-3 text-xl">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Differentiator() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-accent">Why EU-first matters</p>
            <h2 className="mt-3 text-3xl md:text-5xl">RB2B identifies people. Under GDPR, that's the wrong default.</h2>
            <p className="mt-5 text-primary-foreground/70 leading-relaxed">
              US-style identity graphs match anonymous IPs to named individuals without their consent. That model has no lawful basis in the EEA. We split the problem in two: <strong className="text-primary-foreground">companies by default, people only with consent.</strong> Your sales team still gets the signal; your DPO still sleeps at night.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <Row good label="Reverse-IP company reveal (legitimate interest)" />
            <Row good label="Person reveal only after explicit form-fill or login" />
            <Row good label="IPs hashed + salted, raw events purged after 30 days" />
            <Row good label="Honours Global Privacy Control & do-not-identify cookies" />
            <Row good label="EU-only data residency, signed DPA, sub-processor list" />
            <Row bad label="No third-party identity graphs. No silent person reveal." />
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ good, bad, label }: { good?: boolean; bad?: boolean; label: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-3">
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${good ? "bg-accent text-accent-foreground" : "bg-primary-foreground/15 text-primary-foreground"}`}>
        {good ? <Check className="h-3 w-3" /> : <span className="text-xs">×</span>}
      </span>
      <span className={bad ? "text-primary-foreground/70" : ""}>{label}</span>
    </div>
  );
}

function FeatureGrid() {
  const features = [
    { icon: Building2, title: "Company-level reveal", body: "Domain, name, industry, size, country and HQ — surfaced the moment a visitor lands." },
    { icon: ScrollText, title: "Consent-gated person reveal", body: "Form-fill or magic-link consent links the prior session to a named person." },
    { icon: BellRing, title: "Slack & Teams alerts", body: "Per-target-account rules. Filter by pages viewed, country, industry." },
    { icon: Shield, title: "DPA in two clicks", body: "Workspace-level DPA generation, sub-processor list, data-deletion endpoint." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <h2 className="text-3xl md:text-5xl max-w-2xl">Everything pipeline-building needs. Nothing privacy-burning.</h2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-6">
            <f.icon className="h-6 w-6 text-accent" />
            <h3 className="mt-4 text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-card p-10 md:p-16 text-center">
        <h2 className="text-3xl md:text-5xl max-w-2xl mx-auto">Your next pipeline lead is already on the site.</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">14 days free. Install in 5 minutes. Cancel any time, export everything.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90">
            Start free trial <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/docs/install" className="inline-flex items-center rounded-md border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-surface">
            See the snippet
          </Link>
        </div>
      </div>
    </section>
  );
}
