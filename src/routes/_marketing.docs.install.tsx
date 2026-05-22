import { createFileRoute, Link } from "@tanstack/react-router";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_marketing/docs/install")({
  head: () => ({
    meta: [
      { title: "Install the tracking snippet — VisitorID EU" },
      { name: "description", content: "Drop one script tag in your <head>. First-party, GDPR-compliant, honours Global Privacy Control." },
    ],
  }),
  component: InstallPage,
});

const SNIPPET = `<script async
  src="https://app.visitorid.eu/api/public/t.js"
  data-site="YOUR_TRACKING_ID"></script>`;

function InstallPage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="text-xs uppercase tracking-wider text-accent">{t.install.pill}</p>
      <h1 className="mt-3 text-4xl md:text-6xl">{t.install.h1}</h1>
      <p className="mt-5 text-lg text-muted-foreground">{t.install.sub}</p>

      <h2 className="mt-12 text-2xl">{t.install.h2_1}</h2>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-primary text-primary-foreground p-5 text-sm leading-relaxed">
        <code>{SNIPPET}</code>
      </pre>
      <p className="mt-3 text-sm text-muted-foreground">{t.install.snippetNote}</p>

      <h2 className="mt-12 text-2xl">{t.install.h2_2}</h2>
      <p className="mt-3 text-muted-foreground">{t.install.p2}</p>

      <h2 className="mt-12 text-2xl">{t.install.h2_3}</h2>
      <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
        {t.install.runs.map((r) => <li key={r}>{r}</li>)}
      </ul>

      <h2 className="mt-12 text-2xl">{t.install.h2_4}</h2>
      <p className="mt-3 text-muted-foreground">{t.install.p4}</p>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-primary text-primary-foreground p-5 text-sm leading-relaxed">
        <code>{`window.VisitorID && window.VisitorID.identify({
  email: 'jane@example.com',
  name: 'Jane Doe',
  consent: { source: 'form_submit', timestamp: new Date().toISOString() },
});`}</code>
      </pre>

      <h2 className="mt-12 text-2xl">{t.install.h2_5}</h2>
      <p className="mt-3 text-muted-foreground">{t.install.p5}</p>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-primary text-primary-foreground p-5 text-sm leading-relaxed">
        <code>{`fetch('https://app.visitorid.eu/api/public/erase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tracking_id: 'YOUR_ID', email: 'jane@example.com' }),
});`}</code>
      </pre>

      <div className="mt-14 rounded-xl border border-border bg-card p-6 md:p-8">
        <h3 className="text-xl">{t.install.readyH3}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t.install.readyP}</p>
        <Link to="/signup" className="mt-4 inline-flex items-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90">
          {t.install.readyCta}
        </Link>
      </div>
    </div>
  );
}
