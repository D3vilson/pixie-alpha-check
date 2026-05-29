import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield } from "lucide-react";
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
      <Compliance />
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

function HowItWorks() {
  const t = useT();
  return (
    <section className="bg-surface/40 border-y border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <h2 className="text-3xl md:text-5xl max-w-2xl">{t.home.howH2}</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-6">
              <div className="font-display text-3xl text-accent">{s.n}</div>
              <h3 className="mt-3 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
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
