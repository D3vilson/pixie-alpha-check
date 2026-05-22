import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ScrollText, BellRing, Shield, Code2, Database, Slack, Webhook } from "lucide-react";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_marketing/features")({
  head: () => ({
    meta: [
      { title: "Features — VisitorID EU" },
      { name: "description", content: "Company reveal, consent-gated person reveal, Slack and Teams alerts, target accounts, and a full GDPR posture." },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const t = useT();
  const icons = [Building2, ScrollText, BellRing, Slack, Webhook, Database, Code2, Shield];
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <p className="text-xs uppercase tracking-wider text-accent">{t.features.pill}</p>
      <h1 className="mt-3 text-4xl md:text-6xl tracking-tight">{t.features.h1}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{t.features.sub}</p>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {t.features.items.map((f, i) => {
          const Icon = icons[i];
          return (
            <article key={f.title} className="rounded-xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-accent" />
              <h2 className="mt-4 text-xl">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 md:p-12 text-center">
        <h2 className="text-3xl md:text-4xl">{t.features.ctaH2}</h2>
        <Link to="/signup" className="mt-6 inline-flex items-center rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90">
          {t.common.startFree}
        </Link>
      </div>
    </div>
  );
}
