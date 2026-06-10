import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield, Globe, Database, FileText, TrendingUp, Activity, Network } from "lucide-react";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_marketing/")({
  head: () => ({
    meta: [
      { title: "VisitorID EU — GDPR-compliant website visitor identification" },
      { name: "description", content: "See which Polish companies visit your website. Organization-level identification, no cookies, no personal data." },
      { property: "og:title", content: "VisitorID EU — GDPR-compliant visitor identification" },
      { property: "og:description", content: "One line of JavaScript. Company-level reveal, hot lead alerts, no cookies." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <ForWhom />
      <HowItWorks />
      <Moat />
      <FeatureGrid />
      <Compliance />
      <CTA />
    </>
  );
}

const SAMPLE_VISITS = [
  { company: "Allegro", pkd: "E-commerce", pages: 3, time: "4 min", last: "2 min ago", flag: "🇵🇱" },
  { company: "Booksy", pkd: "SaaS", pages: 2, time: "2 min", last: "5 min ago", flag: "🇵🇱" },
  { company: "LiveChat", pkd: "B2B Tech", pages: 4, time: "6 min", last: "just now", flag: "🇵🇱" },
];

function SampleVisits() {
  const t = useT();
  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <h3 className="text-sm font-medium">{t.home.samplesH2}</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">Demo</span>
      </div>
      <ul className="space-y-2">
        {SAMPLE_VISITS.map((v) => (
          <li key={v.company} className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface/60 px-3 py-2.5 text-sm">
            <span className="text-base">{v.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{v.company}</span>
                <span className="text-xs text-muted-foreground">· {v.pkd}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {v.pages} pages · {v.time} · {v.last}
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted-foreground">{t.home.samplesNote}</p>
    </div>
  );
}

function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface to-background" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 pt-8 pb-20 md:pt-12 md:pb-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-accent" />
              {t.home.pill}
            </div>
            <h1 className="mt-6 text-4xl leading-[1.05] tracking-tight md:text-6xl">
              {t.home.h1Pre} <span className="italic text-accent">{t.home.h1Em}</span> {t.home.h1Post}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">{t.home.sub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
              >
                {t.common.startFreeTrial}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/docs/install"
                className="inline-flex items-center rounded-md border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-surface"
              >
                {t.home.seeSnippet}
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
          </div>
          <div className="md:pl-4">
            <SampleVisits />
          </div>
        </div>
      </div>
    </section>
  );
}

function ForWhom() {
  const t = useT();
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
      <h2 className="text-3xl md:text-5xl max-w-2xl">{t.home.forWhomH2}</h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {t.home.forWhom.map((w) => (
          <div key={w.title} className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-xl">{w.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{w.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const LAYER_STYLES = [
  "border-l-4 border-l-blue-500/70",
  "border-l-4 border-l-teal-500/70",
  "border-l-4 border-l-purple-500/70",
];

function HowItWorks() {
  const t = useT();
  return (
    <section className="bg-surface/40 border-y border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <h2 className="text-3xl md:text-5xl max-w-2xl">{t.home.howH2}</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t.home.howSub}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.home.layers.map((l, i) => (
            <div key={l.title} className={`rounded-xl border border-border bg-card p-6 ${LAYER_STYLES[i]}`}>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{l.tag}</div>
              <h3 className="mt-3 text-xl">{l.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{l.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Moat() {
  const t = useT();
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid gap-10 md:grid-cols-2 md:items-start">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent flex items-center gap-2">
            <Network className="h-3.5 w-3.5" /> Moat
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl">{t.home.moatH2}</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">{t.home.moatLead}</p>
        </div>
        <div className="space-y-4">
          {t.home.moatPoints.map((p) => (
            <div key={p.k} className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
              <Activity className="h-6 w-6 text-accent shrink-0" />
              <div>
                <div className="font-display text-2xl">{p.k}</div>
                <div className="text-sm text-muted-foreground mt-1">{p.v}</div>
              </div>
            </div>
          ))}
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">{t.home.moatExplain}</p>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const t = useT();
  const icons = [Globe, Database, FileText, TrendingUp];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
      <h2 className="text-3xl md:text-5xl max-w-2xl">{t.home.featureGridH2}</h2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.home.featureGrid.map((f, i) => {
          const Icon = icons[i];
          return (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 flex flex-col">
              <Icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{f.body}</p>
              <Link
                to={f.link}
                className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-accent/10 transition-colors"
              >
                {f.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Compliance() {
  const t = useT();
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid gap-10 md:grid-cols-2 md:items-start">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent">Privacy</p>
          <h2 className="mt-3 text-3xl md:text-5xl">{t.home.complianceH2}</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">{t.home.complianceLead}</p>
          <Link to="/gdpr" className="mt-6 inline-flex items-center gap-2 text-sm text-accent hover:underline">
            {t.nav.gdpr} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="space-y-3">
          {t.home.compliancePoints.map((p) => (
            <li key={p} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-3 w-3" />
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
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
