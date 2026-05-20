import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useWorkspace } from "@/hooks/use-workspace";
import { getCompanyDetail } from "@/lib/workspace.functions";
import { formatDistanceToNow } from "@/lib/time";

export const Route = createFileRoute("/app/companies/$companyId")({
  head: () => ({ meta: [{ title: "Company — VisitorID EU" }] }),
  component: CompanyDetail,
});

function CompanyDetail() {
  const { companyId } = Route.useParams();
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const fn = useServerFn(getCompanyDetail);
  const q = useQuery({
    queryKey: ["company-detail", wid, companyId],
    queryFn: () => fn({ data: { workspaceId: wid!, companyId } }),
    enabled: !!wid,
  });

  if (q.isLoading) return <div className="px-8 py-8 text-sm text-muted-foreground">Loading…</div>;
  if (!q.data) return <div className="px-8 py-8 text-sm text-muted-foreground">Company not found.</div>;

  const { company, sessions, pageviews } = q.data;
  const pvBySession = new Map<string, any[]>();
  for (const pv of pageviews) {
    const arr = pvBySession.get(pv.session_id) ?? [];
    arr.push(pv);
    pvBySession.set(pv.session_id, arr);
  }

  return (
    <div className="px-8 py-8 max-w-5xl">
      <Link to="/app/companies" className="text-xs text-muted-foreground hover:text-foreground">← Companies</Link>
      <header className="mt-3 flex items-center gap-3">
        <div className="h-12 w-12 rounded bg-surface flex items-center justify-center text-lg font-semibold">
          {company.name?.[0]}
        </div>
        <div>
          <h1 className="font-display text-3xl">{company.name}</h1>
          <p className="text-sm text-muted-foreground">{company.domain} · {company.industry ?? "—"} · {company.country ?? "—"}</p>
        </div>
      </header>

      <h2 className="font-medium mt-8 mb-3">Visit timeline ({sessions.length})</h2>
      <div className="space-y-3">
        {sessions.map((s: any) => (
          <div key={s.id} className="rounded-lg border border-border/60 bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">
                  {s.people ? `${s.people.name ?? s.people.email}` : "Anonymous visitor"}
                </span>
                <span className="text-muted-foreground"> · {s.country ?? "—"}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                last seen {formatDistanceToNow(s.last_seen_at)}
              </span>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {(pvBySession.get(s.id) ?? []).slice(0, 10).map((pv: any) => (
                <li key={pv.id} className="flex items-center gap-2">
                  <span className="text-foreground/70">{pv.title || pv.url}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(pv.ts)}</span>
                </li>
              ))}
              {(pvBySession.get(s.id) ?? []).length === 0 && (
                <li className="italic">No pageviews recorded.</li>
              )}
            </ul>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">No sessions recorded for this company yet.</p>
        )}
      </div>
    </div>
  );
}
