import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Shield } from "lucide-react";
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
      <HowItWorks />
      <Compliance />
      <CTA />
    </>
  );
}

const SAMPLE_VISITS = [
  { company: "Allegro", pkd: "E-commerce", pages: 3, last: "2 min ago" },
  { company: "Booksy", pkd: "SaaS", pages: 2, last: "5 min ago" },
  { company: "LiveChat", pkd: "B2B Tech", pages: 4, last: "just now" },
];

function SampleVisits() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <h3 className="text-sm font-semibold tracking-tight">Live visits</h3>
        </div>
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground border border-border rounded-full px-2 py-0.5">Demo</span>
      </div>
      <ul className="space-y-1.5">
        {SAMPLE_VISITS.map((v) => (
          <li key={v.company} className="flex items-center gap-3 rounded-xl bg-surface px-3.5 py-3 text-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold">
              {v.company.slice(0, 2).toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate text-foreground">{v.company}</span>
                <span className="text-xs text-muted-foreground">· {v.pkd}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {v.pages} pages · {v.last}
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 20% 0%, oklch(0.58 0.19 264 / 0.18), transparent 60%), radial-gradient(50% 40% at 100% 30%, oklch(0.7 0.13 200 / 0.12), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid gap-16 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              {t.home.pill}
            </div>
            <h1 className="mt-6 text-5xl md:text-7xl leading-[0.98] tracking-[-0.035em] font-semibold">
              {t.home.h1Pre}{" "}
              <span className="text-primary">{t.home.h1Em}</span>{" "}
              {t.home.h1Post}
            </h1>
            <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {t.home.sub}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t.common.startFreeTrial}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/docs/install"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold hover:bg-surface transition-colors"
              >
                {t.home.seeSnippet}
              </Link>
            </div>
          </div>
          <div className="md:col-span-5">
            <SampleVisits />
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const t = useT();
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">How it works</p>
          <h2 className="mt-4 text-4xl md:text-6xl tracking-[-0.03em] font-semibold leading-[1.02]">
            {t.home.howH2}
          </h2>
        </div>
        <div className="mt-16 grid gap-px bg-border rounded-2xl overflow-hidden border border-border md:grid-cols-3">
          {t.home.layers.map((l, i) => (
            <div key={l.title} className="bg-card p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {i + 1}
                </span>
                <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">
                  {l.tag.split("·")[1]?.trim() ?? l.tag}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">{l.title}</h3>
              <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">{l.body}</p>
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
    <section className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Compliance</p>
            <h2 className="mt-4 text-4xl md:text-6xl tracking-[-0.03em] font-semibold leading-[1.02] text-ink-foreground">
              {t.home.complianceH2}
            </h2>
            <p className="mt-6 text-base md:text-lg text-ink-foreground/70 leading-relaxed max-w-md">
              {t.home.complianceLead}
            </p>
            <Link
              to="/gdpr"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
            >
              {t.nav.gdpr} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="md:col-span-7 grid gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10 sm:grid-cols-2">
            {t.home.compliancePoints.map((p) => (
              <li key={p} className="flex items-start gap-3 bg-ink px-5 py-5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-ink-foreground/90 leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const t = useT();
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl tracking-[-0.03em] font-semibold leading-[1.02]">
            {t.home.ctaH2}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">{t.home.ctaSub}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t.common.startFreeTrial} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/docs/install"
              className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold hover:bg-surface"
            >
              {t.home.seeSnippet}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
