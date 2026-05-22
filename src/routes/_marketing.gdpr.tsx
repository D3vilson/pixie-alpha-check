import { createFileRoute } from "@tanstack/react-router";
import { Shield, FileText, Database, Trash2 } from "lucide-react";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_marketing/gdpr")({
  head: () => ({
    meta: [
      { title: "GDPR, DPA & sub-processors — VisitorID EU" },
      { name: "description", content: "Lawful basis, sub-processor list, DPA, and data-deletion process for VisitorID EU." },
    ],
  }),
  component: GdprPage,
});

function GdprPage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="text-xs uppercase tracking-wider text-accent">{t.gdpr.pill}</p>
      <h1 className="mt-3 text-4xl md:text-6xl">{t.gdpr.h1}</h1>
      <p className="mt-5 text-lg text-muted-foreground">{t.gdpr.sub}</p>

      <Section icon={Shield} title={t.gdpr.lawful.title}>
        <p>{t.gdpr.lawful.lead}</p>
        <ul className="mt-3 list-disc pl-5 space-y-1.5">
          <li>{t.gdpr.lawful.company}</li>
          <li>{t.gdpr.lawful.person}</li>
        </ul>
      </Section>

      <Section icon={Database} title={t.gdpr.collect.title}>
        <p>{t.gdpr.collect.p1}</p>
        <p className="mt-3">{t.gdpr.collect.p2}</p>
        <p className="mt-3">{t.gdpr.collect.p3}</p>
      </Section>

      <Section icon={FileText} title={t.gdpr.dpa.title}>
        <p>{t.gdpr.dpa.lead}</p>
        <p className="mt-3"><strong>{t.gdpr.dpa.listIntro}</strong></p>
        <ul className="mt-2 list-disc pl-5 space-y-1.5">
          {t.gdpr.dpa.items.map((it) => <li key={it}>{it}</li>)}
        </ul>
      </Section>

      <Section icon={Trash2} title={t.gdpr.deletion.title}>
        <p>{t.gdpr.deletion.lead}</p>
        <ul className="mt-3 list-disc pl-5 space-y-1.5">
          {t.gdpr.deletion.items.map((it) => <li key={it}>{it}</li>)}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">{t.gdpr.deletion.contact} <a className="text-accent underline" href="mailto:dpo@visitorid.eu">dpo@visitorid.eu</a>.</p>
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
