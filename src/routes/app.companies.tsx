import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useWorkspace } from "@/hooks/use-workspace";
import { getCompanies } from "@/lib/workspace.functions";
import { formatDistanceToNow } from "@/lib/time";
import { useT } from "@/i18n";

export const Route = createFileRoute("/app/companies")({
  head: () => ({ meta: [{ title: "Companies — VisitorID EU" }] }),
  component: Companies,
});

function Companies() {
  const t = useT();
  const { data: ws } = useWorkspace();
  const fn = useServerFn(getCompanies);
  const wid = ws?.workspace.id;
  const q = useQuery({
    queryKey: ["companies", wid],
    queryFn: () => fn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
  });

  return (
    <div className="px-8 py-8 max-w-6xl">
      <h1 className="font-display text-3xl">{t.app.companies.h1}</h1>
      <p className="text-sm text-muted-foreground mt-1">{t.app.companies.sub}</p>

      <div className="mt-6 rounded-lg border border-border/60 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">{t.app.live.company}</th>
              <th className="px-4 py-3 text-left">{t.app.live.industry}</th>
              <th className="px-4 py-3 text-left">{t.app.companies.size}</th>
              <th className="px-4 py-3 text-left">{t.app.live.country}</th>
              <th className="px-4 py-3 text-right">{t.app.companies.visits}</th>
              <th className="px-4 py-3 text-right">{t.app.live.lastSeen}</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t border-border/40 hover:bg-surface/50">
                <td className="px-4 py-3">
                  <Link to="/app/companies/$companyId" params={{ companyId: c.id }} className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded bg-surface flex items-center justify-center text-xs font-semibold">
                      {c.name?.[0]}
                    </div>
                    <div>
                      <div className="font-medium hover:underline">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.domain}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.industry ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.size ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.country ?? "—"}</td>
                <td className="px-4 py-3 text-right">{c.visits}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatDistanceToNow(c.last_seen_at)}</td>
              </tr>
            ))}
            {q.data && q.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">{t.app.companies.empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
