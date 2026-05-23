import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield, Building2, BellRing, ScrollText } from "lucide-react";
import { useT } from "@/i18n";

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
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface to-background" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 pt-8 pb-24 md:pt-12 md:pb-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-accent" />
          {t.home.pill}
        </div>
        <h1 className="mt-6 max-w-3xl text-5xl leading-[1.05] tracking-tight md:text-7xl">
          {t.home.h1Pre} <span className="italic text-accent">{t.home.h1Em}</span> {t.home.h1Post}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">{t.home.sub}</p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
          >
            {t.common.startFreeTrial}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          {t.home.bullets.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-16 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-surface/60 px-4 py-2 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-chart-4/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/50" />
            <span className="ml-3 text-xs text-muted-foreground">{t.home.sampleHeader}</span>
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
                    {v.target && <span className="rounded-full bg-accent/10 text-accent text-[10px] font-medium px-2 py-0.5">{t.home.targetAccount}</span>}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{t.home.pagesAgo(v.pages, v.last)}</div>
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
  { company: "Brand24", country: "PL", pages: 7, last: "just now", industry: "PKD 62.01", target: true },
  { company: "DocPlanner", country: "PL", pages: 3, last: "2 min ago", industry: "PKD 62.02", target: false },
  { company: "Booksy", country: "PL", pages: 12, last: "5 min ago", industry: "PKD 63.12", target: true },
  { company: "IFIRMA", country: "PL", pages: 2, last: "8 min ago", industry: "PKD 69.20", target: false },
];

function LogoStrip() {
  const t = useT();
  return (
    <section className="border-y border-border/60 bg-surface/40 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs uppercase tracking-wider text-muted-foreground">{t.home.logoStrip}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-foreground/40 font-display text-2xl">
          <span>Berlin</span><span>Paris</span><span>Amsterdam</span><span>Stockholm</span><span>Madrid</span><span>Dublin</span>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const t = useT();
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <h2 className="text-3xl md:text-5xl max-w-2xl">{t.home.howH2}</h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {t.home.steps.map((s) => (
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
  const t = useT();
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-accent">{t.home.diffPill}</p>
            <h2 className="mt-3 text-3xl md:text-5xl">{t.home.diffH2}</h2>
            <p className="mt-5 text-primary-foreground/70 leading-relaxed">
              {t.home.diffBody} <strong className="text-primary-foreground">{t.home.diffEm}</strong> {t.home.diffOutro}
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            {t.home.diffRows.map((l) => <Row key={l} good label={l} />)}
            <Row bad label={t.home.diffBad} />
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
  const t = useT();
  const icons = [Building2, ScrollText, BellRing, Shield];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <h2 className="text-3xl md:text-5xl max-w-2xl">{t.home.featH2}</h2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.home.features.map((f, i) => {
          const Icon = icons[i];
          return (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CTA() {
  const t = useT();
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-card p-10 md:p-16 text-center">
        <h2 className="text-3xl md:text-5xl max-w-2xl mx-auto">{t.home.ctaH2}</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t.home.ctaSub}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90">
            {t.common.startFreeTrial} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/docs/install" className="inline-flex items-center rounded-md border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-surface">
            {t.home.seeSnippet}
          </Link>
        </div>
      </div>
    </section>
  );
}
