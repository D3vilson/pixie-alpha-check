import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import { createSite, getSites } from "@/lib/workspace.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — VisitorID EU" }] }),
  component: Settings,
});

function Settings() {
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const qc = useQueryClient();
  const listFn = useServerFn(getSites);
  const createFn = useServerFn(createSite);

  const q = useQuery({
    queryKey: ["sites", wid],
    queryFn: () => listFn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
  });

  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Manage tracked sites and grab your installation snippet.
      </p>

      <section className="mt-8">
        <h2 className="font-medium mb-3">Workspace</h2>
        <div className="rounded-lg border border-border/60 bg-card p-4 text-sm">
          <div><span className="text-muted-foreground">Name:</span> {ws?.workspace.name}</div>
          <div className="mt-1"><span className="text-muted-foreground">Plan:</span> {ws?.workspace.plan}</div>
          <div className="mt-1"><span className="text-muted-foreground">Your role:</span> {ws?.role}</div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-medium mb-3">Tracked sites</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!wid || !domain) return;
            setBusy(true);
            try {
              await createFn({ data: { workspaceId: wid, domain } });
              setDomain("");
              qc.invalidateQueries({ queryKey: ["sites", wid] });
              toast.success("Site added");
            } catch (err: any) {
              toast.error(err.message ?? "Failed");
            } finally { setBusy(false); }
          }}
          className="flex gap-2"
        >
          <Input placeholder="yourdomain.com" value={domain} onChange={(e) => setDomain(e.target.value)} required />
          <Button type="submit" disabled={busy}>Add site</Button>
        </form>

        <ul className="mt-4 space-y-3">
          {(q.data ?? []).map((s: any) => {
            const snippet = `<script async src="${origin}/api/public/t.js" data-vid="${s.tracking_id}"></script>`;
            return (
              <li key={s.id} className="rounded-lg border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.domain}</div>
                    <div className="text-xs text-muted-foreground">Tracking ID: <code>{s.tracking_id}</code></div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Install snippet</p>
                  <pre className="bg-surface rounded p-3 text-xs overflow-auto">{snippet}</pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => { navigator.clipboard.writeText(snippet); toast.success("Copied"); }}
                  >Copy</Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
