import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useWorkspace } from "@/hooks/use-workspace";
import { getLiveVisits, getStats, getSites } from "@/lib/workspace.functions";
import { formatDistanceToNow } from "@/lib/time";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Live visits — VisitorID EU" }] }),
  component: LiveVisits,
});

function LiveVisits() {
  const { data: ws } = useWorkspace();
  const visitsFn = useServerFn(getLiveVisits);
  const statsFn = useServerFn(getStats);
  const sitesFn = useServerFn(getSites);

  const wid = ws?.workspace.id;

  const stats = useQuery({
    queryKey: ["stats", wid],
    queryFn: () => statsFn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
  });
  const sites = useQuery({
    queryKey: ["sites", wid],
    queryFn: () => sitesFn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
  });
  const visits = useQuery({
    queryKey: ["visits", wid],
    queryFn: () => visitsFn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
    refetchInterval: 5000,
  });

  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Live visits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visits update every 5 seconds. Install the tracking snippet to see your real traffic.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Stat label="Sessions (30d)" value={stats.data?.sessions ?? 0} />
        <Stat label="Identified visits" value={stats.data?.companies ?? 0} />
        <Stat label="Known people" value={stats.data?.people ?? 0} />
        <Stat label="Tracked sites" value={stats.data?.sites ?? 0} />
      </div>

      {sites.data && sites.data.length > 0 && sites.data[0].domain === "example.com" && (
        <div className="mb-6 rounded-lg border border-accent/40 bg-accent/5 p-4 text-sm">
          <strong className="text-foreground">Next step:</strong>{" "}
          <span className="text-muted-foreground">
            Add your real domain in <a href="/app/settings" className="underline">Settings</a> and copy the tracking snippet.
          </span>
        </div>
      )}

      <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Industry</th>
              <th className="px-4 py-3 text-left">Country</th>
              <th className="px-4 py-3 text-left">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {(visits.data ?? []).map((v: any) => (
              <tr key={v.id} className="border-t border-border/40">
                <td className="px-4 py-3">
                  {v.companies ? (
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-surface flex items-center justify-center text-xs font-semibold">
                        {v.companies.name?.[0] ?? "?"}
                      </div>
                      <div>
                        <div className="font-medium">{v.companies.name}</div>
                        <div className="text-xs text-muted-foreground">{v.companies.domain}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">Unidentified visitor</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{v.companies?.industry ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.country ?? v.companies?.country ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDistanceToNow(v.last_seen_at)}</td>
              </tr>
            ))}
            {visits.data && visits.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  No visits yet. Install the tracking snippet to start collecting.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}
