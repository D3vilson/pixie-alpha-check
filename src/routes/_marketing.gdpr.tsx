import { createFileRoute } from "@tanstack/react-router";
import { Shield, FileText, Database, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_marketing/gdpr")({
  head: () => ({
    meta: [
      { title: "GDPR, DPA & sub-processors — VisitorID EU" },
      { name: "description", content: "Lawful basis, sub-processor list, DPA, and data-deletion process for VisitorID EU." },
      { property: "og:title", content: "GDPR & DPA — VisitorID EU" },
      { property: "og:description", content: "How we make visitor identification compliant with GDPR — the full brief." },
    ],
  }),
  component: GdprPage,
});

function GdprPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="text-xs uppercase tracking-wider text-accent">Trust</p>
      <h1 className="mt-3 text-4xl md:text-6xl">GDPR, DPA & sub-processors</h1>
      <p className="mt-5 text-lg text-muted-foreground">
        The honest, plain-language brief — written so your DPO can sign off in an afternoon, not a quarter.
      </p>

      <Section icon={Shield} title="Lawful basis">
        <p>We operate on two lawful bases, separated by data tier.</p>
        <ul className="mt-3 list-disc pl-5 space-y-1.5">
          <li><strong>Company-level reveal</strong> — Article 6(1)(f) GDPR, <em>legitimate interest</em>. The data point produced is the visiting organisation, not a person. We perform a balancing test on your behalf and document it in the DPA.</li>
          <li><strong>Person-level reveal</strong> — Article 6(1)(a) GDPR, <em>explicit consent</em>. We only link a session to a named person when that person has actively submitted their email (form fill, magic-link click, or logged-in identifier). Consent source and timestamp are stored on every identify event.</li>
        </ul>
      </Section>

      <Section icon={Database} title="What we collect, what we don't">
        <p>For anonymous visitors we collect: timestamp, page URL, referrer, user-agent, country (derived from IP), and a salted hash of the IP for short-term deduplication.</p>
        <p className="mt-3"><strong>What we never store:</strong> raw IPs, browser fingerprints, third-party cookies, or cross-site tracking identifiers. Hashed IPs are purged after 30 days.</p>
        <p className="mt-3"><strong>What we honour:</strong> Global Privacy Control (Sec-GPC), a <code className="rounded bg-surface px-1.5 py-0.5 text-xs">do-not-identify</code> first-party cookie, and your CMP's consent state if you forward it.</p>
      </Section>

      <Section icon={FileText} title="DPA & sub-processors">
        <p>A signed Data Processing Agreement is generated per workspace and is downloadable from <code className="rounded bg-surface px-1.5 py-0.5 text-xs">/app/settings</code>. Standard Contractual Clauses included.</p>
        <p className="mt-3"><strong>Sub-processors (all EEA / adequacy-decision):</strong></p>
        <ul className="mt-2 list-disc pl-5 space-y-1.5">
          <li>Cloud hosting — Cloudflare Workers (EU edge), data at rest in <em>eu-central-1</em>.</li>
          <li>Database & auth — Supabase EU (Frankfurt).</li>
          <li>Email delivery — Postmark EU.</li>
          <li>IP-to-company enrichment — IPinfo EU region (configurable; can be self-hosted on request).</li>
        </ul>
      </Section>

      <Section icon={Trash2} title="Data deletion">
        <p>Three deletion paths, all self-serve:</p>
        <ul className="mt-3 list-disc pl-5 space-y-1.5">
          <li><strong>Per session</strong> — your visitors can request deletion via a hosted page; we resolve within 24h.</li>
          <li><strong>Per workspace</strong> — owners can purge all visit data with one click from settings.</li>
          <li><strong>Full account close</strong> — irrecoverable hard-delete within 30 days; backups expire within 60.</li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">Questions? Email <a className="text-accent underline" href="mailto:dpo@visitorid.eu">dpo@visitorid.eu</a>.</p>
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Shield; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 rounded-xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-accent" />
        <h2 className="text-2xl">{title}</h2>
      </div>
      <div className="mt-4 text-sm leading-relaxed text-foreground/85 prose-zinc">{children}</div>
    </section>
  );
}
