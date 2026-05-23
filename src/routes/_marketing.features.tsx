import { createFileRoute, Link } from "@tanstack/react-router";
import { Code2, Network, Database } from "lucide-react";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_marketing/features")({
  head: () => ({
    meta: [
      { title: "Product — Pixel, identyfikacja IP→firma, enrichment CEIDG/KRS" },
      { name: "description", content: "Trzy warstwy: jedna linijka JS, reverse-IP dla zagranicy + własna baza dla polskich MŚP, enrichment z CEIDG, KRS i Hunter.io." },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const t = useT();
  const icons = [Code2, Network, Database];
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <p className="text-xs uppercase tracking-wider text-accent">{t.features.pill}</p>
      <h1 className="mt-3 text-4xl md:text-6xl tracking-tight">{t.features.h1}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{t.features.sub}</p>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {t.features.layers.map((f, i) => {
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

      {/* Enrichment sources */}
      <section className="mt-20">
        <h2 className="text-2xl md:text-3xl">{t.features.enrichmentTitle}</h2>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t.features.enrichmentHeaders.source}</th>
                <th className="px-4 py-3 font-medium">{t.features.enrichmentHeaders.delivers}</th>
                <th className="px-4 py-3 font-medium">{t.features.enrichmentHeaders.cost}</th>
                <th className="px-4 py-3 font-medium">{t.features.enrichmentHeaders.notes}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.features.enrichmentRows.map((r) => (
                <tr key={r.source}>
                  <td className="px-4 py-3 font-medium">{r.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.delivers}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.cost}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Coverage table */}
      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl">{t.features.coverageTitle}</h2>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t.features.coverageHeaders.segment}</th>
                <th className="px-4 py-3 font-medium">{t.features.coverageHeaders.source}</th>
                <th className="px-4 py-3 font-medium">{t.features.coverageHeaders.day1}</th>
                <th className="px-4 py-3 font-medium">{t.features.coverageHeaders.at50}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.features.coverageRows.map((r) => (
                <tr key={r.segment}>
                  <td className="px-4 py-3 font-medium">{r.segment}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.day1}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.at50}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dashboard contents */}
      <section className="mt-16 rounded-xl border border-border bg-card p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl">{t.features.dashboardTitle}</h2>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground list-disc pl-5">
          {t.features.dashboardItems.map((it) => <li key={it}>{it}</li>)}
        </ul>
      </section>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 md:p-12 text-center">
        <h2 className="text-3xl md:text-4xl">{t.features.ctaH2}</h2>
        <Link to="/signup" className="mt-6 inline-flex items-center rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90">
          {t.common.startFree}
        </Link>
      </div>
    </div>
  );
}
