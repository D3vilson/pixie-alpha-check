import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { getHotLeads } from "@/lib/workspace.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "@/lib/time";
import { useT } from "@/i18n";

export const Route = createFileRoute("/app/hot-leads")({
  head: () => ({ meta: [{ title: "Hot Leads — VisitorID EU" }] }),
  component: HotLeadsPage,
});

function scoreColor(score: number): string {
  if (score >= 80) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (score >= 65) return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
}

function HotLeadsPage() {
  const t = useT();
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const fn = useServerFn(getHotLeads);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["hot-leads", wid],
    queryFn: () => fn({ data: { workspaceId: wid!, minScore: 50 } }),
    enabled: !!wid,
    refetchInterval: 10_000,
  });

  // Realtime — invaliduj listę gdy sesja zostanie zmieniona
  useEffect(() => {
    if (!wid) return;
    const ch = supabase
      .channel(`hot-leads-${wid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => qc.invalidateQueries({ queryKey: ["hot-leads", wid] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [wid, qc]);

  const rows = data ?? [];

  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">🔥 Hot Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.app.hotLeads?.sub ??
              "Sesje z wysokim intent score — gotowe do kontaktu sprzedażowego. Lista odświeża się w czasie rzeczywistym."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-muted-foreground">Realtime</span>
        </div>
      </header>

      <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-left">Firma</th>
              <th className="px-4 py-3 text-left">Sygnały</th>
              <th className="px-4 py-3 text-left">Strona</th>
              <th className="px-4 py-3 text-left">Ostatnio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v: any) => {
              const minutes = Math.round((v.total_duration_ms ?? 0) / 6000) / 10;
              return (
                <tr key={v.id} className="border-t border-border/40 hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center justify-center min-w-[3rem] rounded-md border px-2 py-1 font-mono text-sm font-semibold ${scoreColor(v.intent_score)}`}
                    >
                      {v.intent_score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {v.companies ? (
                      <div>
                        <div className="font-medium">{v.companies.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {v.companies.domain}
                          {v.companies.country ? ` · ${v.companies.country}` : ""}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Nierozpoznana firma</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span>📄 {v.pageview_count} stron</span>
                      <span>⏱ {minutes} min</span>
                      <span>📜 {v.max_scroll_pct}%</span>
                      {v.high_intent_hit && (
                        <span className="text-accent">🎯 high-intent</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {v.site_domain ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDistanceToNow(v.last_seen_at)}
                  </td>
                </tr>
              );
            })}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Brak gorących leadów. Pojawią się tutaj automatycznie, gdy odwiedzający
                  przekroczą próg intent score (domyślnie 50).
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Ładowanie…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Próg alertu i ścieżki high-intent (np. <code>/pricing</code>, <code>/demo</code>)
        konfigurujesz w <a href="/app/settings" className="underline">Ustawieniach</a>.
        Powiadomienia Slack/Teams: <a href="/app/integrations" className="underline">Integracje</a>.
      </p>
    </div>
  );
}
