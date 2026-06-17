import { Fragment } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  anonymizeSession,
  deletePerson,
  getConsentAudit,
} from "@/lib/workspace.functions";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/time";
import { useT } from "@/i18n";

export const Route = createFileRoute("/app/consent-audit")({
  head: () => ({ meta: [{ title: "Consent audit — Pixie" }] }),
  component: ConsentAudit,
});

type Filter = "all" | "identified" | "anonymous";

function ConsentAudit() {
  const t = useT();
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const qc = useQueryClient();
  const listFn = useServerFn(getConsentAudit);
  const anonFn = useServerFn(anonymizeSession);
  const erasePersonFn = useServerFn(deletePerson);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["consent-audit", wid],
    queryFn: () => listFn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
  });

  const rows = (q.data ?? []).filter((r: any) =>
    filter === "all" ? true : r.consent_state === filter,
  );
  const total = q.data?.length ?? 0;
  const identified = (q.data ?? []).filter(
    (r: any) => r.consent_state === "identified",
  ).length;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["consent-audit", wid] });
    qc.invalidateQueries({ queryKey: ["people", wid] });
  };

  return (
    <div className="px-8 py-8 max-w-7xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl">{t.app.audit.h1}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t.app.audit.sub}</p>
        </div>
        <a
          href={`/api/public/erase`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground underline underline-offset-4"
        >
          {t.app.audit.eraseEndpoint}
        </a>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label={t.app.audit.sessions} value={total} />
        <Stat label={t.app.audit.identified} value={identified} />
        <Stat label={t.app.audit.anonymous} value={total - identified} />
      </div>

      <div className="mt-6 flex items-center gap-2">
        {(["all", "identified", "anonymous"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
              filter === f
                ? "bg-foreground text-background"
                : "bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.app.audit.filters[f]}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-border/60 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">{t.app.audit.colSession}</th>
              <th className="px-4 py-3 text-left">{t.app.audit.colConsent}</th>
              <th className="px-4 py-3 text-left">{t.app.audit.colPerson}</th>
              <th className="px-4 py-3 text-left">{t.app.audit.colSource}</th>
              <th className="px-4 py-3 text-left">{t.app.audit.colCompany}</th>
              <th className="px-4 py-3 text-left">{t.app.audit.colSeen}</th>
              <th className="px-4 py-3 text-right">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => {
              const ev = r.identify_events?.[0];
              const isOpen = expanded === r.id;
              return (
                <Fragment key={r.id}>
                  <tr className="border-t border-border/40 align-top">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground"
                      >
                        {r.anon_id?.slice(0, 10) ?? r.id.slice(0, 8)}…
                      </button>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {r.site_domain ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.consent_state === "identified" ? (
                        <span className="text-xs rounded-full bg-accent/15 text-accent px-2 py-1">{t.app.audit.consented}</span>
                      ) : (
                        <span className="text-xs rounded-full bg-muted text-muted-foreground px-2 py-1">{t.app.audit.anonymousTag}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.people ? (
                        <div>
                          <div className="font-medium">{r.people.email}</div>
                          {r.people.name && (
                            <div className="text-xs text-muted-foreground">{r.people.name}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ev?.source ?? r.people?.consent_source ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {r.companies ? (
                        <Link
                          to="/app/companies/$companyId"
                          params={{ companyId: r.companies.id }}
                          className="text-foreground hover:underline"
                        >
                          {r.companies.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDistanceToNow(r.last_seen_at)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.person_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (!confirm(t.app.audit.confirmAnon)) return;
                            await anonFn({ data: { workspaceId: wid!, sessionId: r.id } });
                            invalidate();
                            toast.success(t.app.audit.anonymized);
                          }}
                        >
                          {t.app.audit.anonymizeBtn}
                        </Button>
                      )}
                      {r.people && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (!confirm(t.app.audit.confirmErase(r.people.email))) return;
                            await erasePersonFn({ data: { id: r.people.id } });
                            invalidate();
                            toast.success(t.app.audit.erased);
                          }}
                        >
                          {t.app.audit.erasePersonBtn}
                        </Button>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-surface/40">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-6 text-xs">
                          <div>
                            <div className="uppercase tracking-wider text-muted-foreground mb-2">{t.app.audit.session}</div>
                            <KV k={t.app.audit.sessionId} v={r.id} mono />
                            <KV k={t.app.audit.anonId} v={r.anon_id} mono />
                            <KV k={t.app.audit.started} v={new Date(r.started_at).toISOString()} />
                            <KV k={t.app.audit.lastSeen} v={new Date(r.last_seen_at).toISOString()} />
                            <KV k={t.app.audit.country} v={r.country ?? "—"} />
                          </div>
                          <div>
                            <div className="uppercase tracking-wider text-muted-foreground mb-2">
                              {t.app.audit.consentProof(r.identify_events.length)}
                            </div>
                            {r.identify_events.length === 0 ? (
                              <p className="text-muted-foreground">{t.app.audit.noIdent}</p>
                            ) : (
                              r.identify_events.map((e: any) => (
                                <div
                                  key={e.id}
                                  className="mb-3 rounded-md border border-border/60 bg-background p-3"
                                >
                                  <KV k={t.app.audit.source} v={e.source} />
                                  <KV k={t.app.audit.captured} v={new Date(e.created_at).toISOString()} />
                                  <div className="mt-2">
                                    <div className="text-muted-foreground mb-1">{t.app.audit.proofPayload}</div>
                                    <pre className="text-[10px] leading-relaxed bg-surface rounded p-2 overflow-auto max-h-40">
                                      {JSON.stringify(e.consent_proof ?? {}, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {q.data && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">{t.app.audit.emptyFilter}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{t.app.audit.footer}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-3 py-0.5">
      <div className="w-20 shrink-0 text-muted-foreground">{k}</div>
      <div className={mono ? "font-mono text-[11px] break-all" : "break-all"}>{v}</div>
    </div>
  );
}
