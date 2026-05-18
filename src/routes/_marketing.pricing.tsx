import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_marketing/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — VisitorID EU" },
      { name: "description", content: "Transparent pricing. Tiered by monthly identified companies. EU-billed in EUR, VAT-compliant invoices." },
      { property: "og:title", content: "Pricing — VisitorID EU" },
      { property: "og:description", content: "Tiered by monthly identified companies. Start free for 14 days." },
    ],
  }),
  component: PricingPage,
});

const TIERS = [
  {
    name: "Starter",
    price: "€49",
    period: "/ month",
    blurb: "For founders validating outbound.",
    cap: "Up to 500 identified companies / month",
    features: ["1 website", "Slack alerts", "Email support", "30-day data retention"],
    cta: "Start free",
  },
  {
    name: "Growth",
    price: "€199",
    period: "/ month",
    blurb: "For sales teams with a real pipeline.",
    cap: "Up to 5,000 identified companies / month",
    features: ["Up to 5 sites", "Slack + Teams + webhooks", "Target accounts & rules", "Consent-gated person reveal", "90-day retention", "Priority support"],
    cta: "Start free",
    featured: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    blurb: "For RevOps at scale.",
    cap: "Unlimited",
    features: ["Unlimited sites", "SAML SSO", "Custom DPA & sub-processor terms", "Dedicated EU sub-processor list", "12-month retention", "Slack-connect support"],
    cta: "Talk to us",
  },
];

function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-wider text-accent">Pricing</p>
        <h1 className="mt-3 text-4xl md:text-6xl">Pay for companies revealed — nothing else.</h1>
        <p className="mt-4 text-muted-foreground">EU-billed in EUR. VAT-compliant invoices. No per-seat fees, no setup fees.</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`rounded-2xl border p-8 flex flex-col ${t.featured ? "border-accent bg-card shadow-lg shadow-accent/5 md:-translate-y-3" : "border-border bg-card"}`}
          >
            {t.featured && <span className="self-start rounded-full bg-accent/10 text-accent text-xs font-medium px-2 py-1 mb-3">Most popular</span>}
            <h2 className="text-2xl">{t.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-5xl">{t.price}</span>
              <span className="text-muted-foreground text-sm">{t.period}</span>
            </div>
            <p className="mt-2 text-sm text-foreground/80">{t.cap}</p>
            <ul className="mt-6 space-y-2 text-sm flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className={`mt-8 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-opacity ${t.featured ? "bg-accent text-accent-foreground hover:opacity-90" : "bg-primary text-primary-foreground hover:opacity-90"}`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-border bg-surface/50 p-6 md:p-8 text-sm text-muted-foreground">
        <strong className="text-foreground">A note on usage.</strong> An identified company is counted once per workspace per calendar month, no matter how many sessions or pages they generate. We never count anonymous traffic — only successful reveals.
      </div>
    </div>
  );
}
