import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_marketing/")({
  head: () => ({
    meta: [
      { title: "Pixie — Zobacz, która polska firma odwiedza Twoją stronę" },
      { name: "description", content: "High-intent leady B2B zanim wypełnią formularz. Pixie rozpoznaje polskie firmy odwiedzające Twoją stronę i daje sprzedaży kontekst do semi-cold outreachu. Bez cookies, zgodne z RODO." },
      { property: "og:title", content: "Pixie — High-intent leady B2B zanim wypełnią formularz" },
      { property: "og:description", content: "Sprzedaż widzi, która polska firma czyta cennik i case studies — z kontekstem do semi-cold outreachu tego samego dnia." },
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

function SlackPreview() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(15,23,42,0.3)] overflow-hidden">
      {/* Slack-like header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-surface">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">#</span>
          <span className="font-semibold tracking-tight">sales-signals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ed6a5e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f5bf4f]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#62c554]" />
        </div>
      </div>

      {/* Message */}
      <div className="p-5">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            Px
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm">Pixie</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1 py-0.5">APP</span>
              <span className="text-xs text-muted-foreground">10:42</span>
            </div>
            <p className="mt-1 text-sm text-foreground">
              🔥 <span className="font-semibold">Allegro</span> właśnie odwiedził Twoją stronę
            </p>

            {/* Slack attachment card */}
            <div className="mt-2 rounded-md border-l-4 border-primary bg-surface/60 pl-3 pr-3 py-3">
              <div className="text-xs text-muted-foreground">allegro.pl · E-commerce · Warszawa</div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0">Podstrony:</span>
                  <span className="font-medium">/cennik, /case-studies, /integracje</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0">Czas:</span>
                  <span className="font-medium">4 min 12 s</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0">Intent score:</span>
                  <span className="font-semibold text-primary">87 / 100 · high</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0">Decydenci:</span>
                  <span className="font-medium">Head of Growth, CMO</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0">Telefony:</span>
                  <span className="font-medium">+48 22 123 45 67, +48 501 234 567</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Otwórz w Pixie
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const lines = [
                      "Allegro",
                      "E-commerce · Warszawa",
                      "Podstrony: /cennik, /case-studies, /integracje",
                      "Czas: 4 min 12 s",
                      "Intent: 87 / 100 · high",
                      "Decydenci: Head of Growth, CMO",
                      "Telefony: +48 22 123 45 67, +48 501 234 567",
                    ];
                    const text = lines.join("\n");
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      await navigator.clipboard.writeText(text);
                      toast.success("Skopiowano e-maile i numery");
                    }
                  }}
                  className="inline-flex items-center rounded border border-border bg-card px-3 py-1 text-xs font-semibold hover:bg-surface transition-colors cursor-pointer"
                >
                  Skopiuj e-maile & numery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 -z-10 opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 20% 0%, oklch(0.58 0.19 264 / 0.18), transparent 60%), radial-gradient(50% 40% at 100% 30%, oklch(0.7 0.13 200 / 0.12), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid gap-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.035em] font-semibold">
              {t.home.h1Pre}{" "}
              <span className="text-primary">{t.home.h1Em}</span>{" "}
              {t.home.h1Post}
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
              {t.home.heroSub}
            </p>
            <div className="mt-8">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t.common.startFreeTrial}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="md:col-span-7">
            <SlackPreview />
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
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Jak to działa</p>
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
            <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Zgodność</p>
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
