import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/docs/install")({
  head: () => ({
    meta: [
      { title: "Install the tracking snippet — VisitorID EU" },
      { name: "description", content: "Drop one script tag in your <head>. First-party, GDPR-compliant, honours Global Privacy Control." },
      { property: "og:title", content: "Install — VisitorID EU" },
      { property: "og:description", content: "One-line install. First-party. GPC-aware." },
    ],
  }),
  component: InstallPage,
});

const SNIPPET = `<script async
  src="https://app.visitorid.eu/api/public/t.js"
  data-site="YOUR_TRACKING_ID"></script>`;

function InstallPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="text-xs uppercase tracking-wider text-accent">Docs</p>
      <h1 className="mt-3 text-4xl md:text-6xl">Install in 60 seconds.</h1>
      <p className="mt-5 text-lg text-muted-foreground">
        One <code className="rounded bg-surface px-1.5 py-0.5">&lt;script&gt;</code> tag in your site's <code className="rounded bg-surface px-1.5 py-0.5">&lt;head&gt;</code>. No bundler config, no consent banner changes, no third-party cookies.
      </p>

      <h2 className="mt-12 text-2xl">1. Paste the snippet</h2>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-primary text-primary-foreground p-5 text-sm leading-relaxed">
        <code>{SNIPPET}</code>
      </pre>
      <p className="mt-3 text-sm text-muted-foreground">
        Your <code className="rounded bg-surface px-1.5 py-0.5">YOUR_TRACKING_ID</code> appears on the install screen once you've created your workspace.
      </p>

      <h2 className="mt-12 text-2xl">2. Verify in the dashboard</h2>
      <p className="mt-3 text-muted-foreground">Visit your site once in a non-incognito browser. Within seconds the live feed in your workspace will show the visit.</p>

      <h2 className="mt-12 text-2xl">3. What runs in your visitor's browser</h2>
      <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
        <li>A first-party cookie scoped to your site, ~6KB, expires after 12 months.</li>
        <li>One POST per pageview to <code className="rounded bg-surface px-1.5 py-0.5">app.visitorid.eu/api/public/collect</code>.</li>
        <li>No third-party cookies, no localStorage cross-site sync, no fingerprinting.</li>
        <li>The script returns immediately and respects <code className="rounded bg-surface px-1.5 py-0.5">Sec-GPC: 1</code>.</li>
      </ul>

      <h2 className="mt-12 text-2xl">4. Identify visitors who give consent</h2>
      <p className="mt-3 text-muted-foreground">When someone submits a form, call:</p>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-primary text-primary-foreground p-5 text-sm leading-relaxed">
        <code>{`window.VisitorID && window.VisitorID.identify({
  email: 'jane@example.com',
  name: 'Jane Doe',
  consent: { source: 'form_submit', timestamp: new Date().toISOString() },
});`}</code>
      </pre>

      <h2 className="mt-12 text-2xl">5. Honour erasure requests (Article 17)</h2>
      <p className="mt-3 text-muted-foreground">
        After verifying the requester (e.g. via a signed email link), POST to the erase endpoint
        from your server. We delete the person record and unlink any sessions.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-primary text-primary-foreground p-5 text-sm leading-relaxed">
        <code>{`fetch('https://app.visitorid.eu/api/public/erase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tracking_id: 'YOUR_ID', email: 'jane@example.com' }),
});`}</code>
      </pre>



      <div className="mt-14 rounded-xl border border-border bg-card p-6 md:p-8">
        <h3 className="text-xl">Ready?</h3>
        <p className="mt-2 text-sm text-muted-foreground">Create a workspace and grab your tracking ID.</p>
        <Link to="/signup" className="mt-4 inline-flex items-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90">
          Create your workspace
        </Link>
      </div>
    </div>
  );
}
