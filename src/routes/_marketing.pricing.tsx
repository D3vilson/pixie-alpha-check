import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_marketing/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — VisitorID EU" },
      { name: "description", content: "Transparent pricing. Tiered by monthly identified companies. EU-billed in EUR, VAT-compliant invoices." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const t = useT();
  const tiers = t.pricing.tiers.map((tier, i) => ({
    ...tier,
    featured: i === 1,
    cta: i === 2 ? t.common.talkToUs : t.common.startFree,
  }));
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-wider text-accent">{t.pricing.pill}</p>
        <h1 className="mt-3 text-4xl md:text-6xl">{t.pricing.h1}</h1>
        <p className="mt-4 text-muted-foreground">{t.pricing.sub}</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl border p-8 flex flex-col ${tier.featured ? "border-accent bg-card shadow-lg shadow-accent/5 md:-translate-y-3" : "border-border bg-card"}`}
          >
            {tier.featured && <span className="self-start rounded-full bg-accent/10 text-accent text-xs font-medium px-2 py-1 mb-3">{t.pricing.mostPopular}</span>}
            <h2 className="text-2xl">{tier.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-5xl">{tier.price}</span>
              {tier.price !== "Custom" && tier.price !== "Indywidualnie" && <span className="text-muted-foreground text-sm">{t.pricing.perMonth}</span>}
            </div>
            <p className="mt-2 text-sm text-foreground/80">{tier.cap}</p>
            <ul className="mt-6 space-y-2 text-sm flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className={`mt-8 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-opacity ${tier.featured ? "bg-accent text-accent-foreground hover:opacity-90" : "bg-primary text-primary-foreground hover:opacity-90"}`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-border bg-surface/50 p-6 md:p-8 text-sm text-muted-foreground">
        <strong className="text-foreground">{t.pricing.noteLead}</strong> {t.pricing.note}
      </div>
    </div>
  );
}
