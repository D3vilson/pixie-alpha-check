import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Users, MousePointerClick, Eye } from "lucide-react";
import { useWorkspace } from "@/hooks/use-workspace";
import { getCompanyDetail } from "@/lib/workspace.functions";
import { formatDistanceToNow } from "@/lib/time";
import { useT } from "@/i18n";

export const Route = createFileRoute("/app/companies/$companyId")({
  head: () => ({ meta: [{ title: "Company — VisitorID EU" }] }),
  component: CompanyDetail,
});

function CompanyDetail() {
  const t = useT();
  const { companyId } = Route.useParams();
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const fn = useServerFn(getCompanyDetail);
  const q = useQuery({
    queryKey: ["company-detail", wid, companyId],
    queryFn: () => fn({ data: { workspaceId: wid!, companyId } }),
    enabled: !!wid,
  });

  if (q.isLoading)
    return <div className="px-8 py-8 text-sm text-muted-foreground">{t.common.loading}</div>;
  if (!q.data)
    return <div className="px-8 py-8 text-sm text-muted-foreground">{t.app.companies.notFound}</div>;

  const { company, sessions, pageviews } = q.data;
  const c = company as typeof company & { description?: string | null };

  const pvBySession = new Map<string, typeof pageviews>();
  for (const pv of pageviews) {
    const arr = pvBySession.get(pv.session_id) ?? [];
    arr.push(pv);
    pvBySession.set(pv.session_id, arr);
  }

  const identifiedCount = sessions.filter((s) => s.person_id).length;
  const initials = (c.name || c.domain || "?").slice(0, 2).toUpperCase();

  return (
    <div className="px-8 py-10 max-w-4xl mx-auto">
      <Link
        to="/app/companies"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {t.app.companies.back}
      </Link>

      {/* Hero */}
      <header className="mt-6 flex items-start gap-5">
        <div className="h-16 w-16 shrink-0 rounded-lg border border-border bg-card flex items-center justify-center overflow-hidden">
          {c.logo_url ? (
            <img
              src={c.logo_url}
              alt={c.name}
              className="h-full w-full object-contain"
              onError={(e) => ((e.currentTarget.style.display = "none"))}
            />
          ) : (
            <span className="text-xl font-semibold text-muted-foreground">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl tracking-tight truncate">{c.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <a
              href={`https://${c.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {c.domain}
              <ExternalLink className="h-3 w-3" />
            </a>
            {c.country && (
              <>
                <span>·</span>
                <span>{c.country}</span>
              </>
            )}
            {c.industry && (
              <>
                <span>·</span>
                <span>{c.industry}</span>
              </>
            )}
          </div>
          {c.description && (
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed line-clamp-3">
              {c.description}
            </p>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-px rounded-lg overflow-hidden bg-border border border-border">
        <Stat icon={MousePointerClick} label={t.app.companies.sessions} value={sessions.length} />
        <Stat icon={Eye} label={t.app.companies.pageviews} value={pageviews.length} />
        <Stat icon={Users} label={t.app.companies.identified} value={identifiedCount} />
      </div>

      {/* Timeline */}
      <h2 className="font-medium mt-10 mb-4 text-sm uppercase tracking-wider text-muted-foreground">
        {t.app.companies.timeline(sessions.length)}
      </h2>
      <div className="space-y-2">
        {sessions.map((s) => {
          const pvs = pvBySession.get(s.id) ?? [];
          const person = s.people as { name?: string | null; email?: string } | null;
          return (
            <div
              key={s.id}
              className="group rounded-lg border border-border bg-card p-4 hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2 text-sm">
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      person ? "bg-primary" : "bg-muted-foreground/40"
                    }`}
                  />
                  <span className="font-medium truncate">
                    {person ? person.name ?? person.email : t.app.companies.anonymous}
                  </span>
                  {s.country && (
                    <span className="text-xs text-muted-foreground shrink-0">· {s.country}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                  {formatDistanceToNow(s.last_seen_at)}
                </span>
              </div>
              {pvs.length > 0 ? (
                <ul className="mt-3 ml-3.5 space-y-1 border-l border-border pl-3">
                  {pvs.slice(0, 8).map((pv) => (
                    <li
                      key={pv.id}
                      className="flex items-baseline justify-between gap-3 text-xs"
                    >
                      <span className="truncate text-foreground/80">{pv.title || pv.url}</span>
                      <span className="text-muted-foreground tabular-nums shrink-0">
                        {formatDistanceToNow(pv.ts)}
                      </span>
                    </li>
                  ))}
                  {pvs.length > 8 && (
                    <li className="text-xs text-muted-foreground italic">
                      +{pvs.length - 8}
                    </li>
                  )}
                </ul>
              ) : (
                <p className="mt-3 ml-3.5 text-xs text-muted-foreground italic">
                  {t.app.companies.noPageviews}
                </p>
              )}
            </div>
          );
        })}
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {t.app.companies.noSessions}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="mt-2 font-display text-2xl tabular-nums">{value}</div>
    </div>
  );
}
