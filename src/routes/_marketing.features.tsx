import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ScrollText, BellRing, Shield, Code2, Database, Slack, Webhook } from "lucide-react";

export const Route = createFileRoute("/_marketing/features")({
  head: () => ({
    meta: [
      { title: "Features — VisitorID EU" },
      { name: "description", content: "Company reveal, consent-gated person reveal, Slack and Teams alerts, target accounts, and a full GDPR posture." },
      { property: "og:title", content: "Features — VisitorID EU" },
      { property: "og:description", content: "Every feature pipeline-building needs, none of the privacy debt." },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <p className="text-xs uppercase tracking-wider text-accent">Product</p>
      <h1 className="mt-3 text-4xl md:text-6xl tracking-tight">A complete pipeline-signal stack — without the privacy debt.</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
        Two reveal tiers, one workspace. Marketing and sales get the signal they need; legal gets a defensible lawful basis.
      </p>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        <Feature
          icon={Building2}
          title="Tier 1 — Company reveal (default)"
          body="Reverse-IP enrichment links each session to a company in our European directory. Domain, industry, headcount band, country, HQ. Lawful basis: legitimate interest. No personal data leaves the visitor's browser beyond what your analytics already collects."
        />
        <Feature
          icon={ScrollText}
          title="Tier 2 — Person reveal (consent-gated)"
          body="When a visitor submits a form, clicks a magic link, or logs in, we link their prior anonymous sessions to a named person. Consent payload + timestamp are stored on every identify event."
        />
        <Feature
          icon={BellRing}
          title="Real-time target-account alerts"
          body="Save companies or domain patterns as target accounts. Rules can filter by pages viewed, country, industry, and minimum session depth. Fires to Slack, Teams, or any webhook."
        />
        <Feature
          icon={Slack}
          title="Slack & Microsoft Teams native"
          body="Connect Slack in one click via our managed connector — no app review, no manifest. Teams uses Microsoft Graph with per-channel routing."
        />
        <Feature
          icon={Webhook}
          title="Outbound webhooks for any CRM"
          body="Push identified visits to HubSpot, Pipedrive, Salesforce, or your own stack with a signed webhook. CSV export for everything."
        />
        <Feature
          icon={Database}
          title="EU-only data residency"
          body="Postgres in the EU, served from EU edge nodes. Workspaces are isolated; row-level security is the backstop on every table."
        />
        <Feature
          icon={Code2}
          title="One-line install"
          body={<>One <code className="rounded bg-surface px-1.5 py-0.5 text-xs">&lt;script&gt;</code> tag. First-party, served from our domain. Honours Global Privacy Control and a <code className="rounded bg-surface px-1.5 py-0.5 text-xs">do-not-identify</code> cookie out of the box.</>}
        />
        <Feature
          icon={Shield}
          title="DPA, sub-processors, deletion"
          body="Workspace-level DPA download, signed sub-processor list, and a one-click data-deletion endpoint per workspace and per data subject."
        />
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 md:p-12 text-center">
        <h2 className="text-3xl md:text-4xl">Ready to see your first visit?</h2>
        <Link to="/signup" className="mt-6 inline-flex items-center rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90">
          Start free
        </Link>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, body }: { icon: typeof Building2; title: string; body: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-border bg-card p-6">
      <Icon className="h-6 w-6 text-accent" />
      <h2 className="mt-4 text-xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </article>
  );
}
