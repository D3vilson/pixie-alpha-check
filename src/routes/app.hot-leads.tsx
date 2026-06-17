import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { getHotLeads } from "@/lib/workspace.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "@/lib/time";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/app/hot-leads")({
  head: () => ({ meta: [{ title: "Hot Leads — Pixie" }] }),
  component: HotLeadsPage,
});

function scoreColor(score: number): string {
  if (score >= 80) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (score >= 65) return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
}

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(rows: any[]) {
  const headers = [
    "score",
    "company_name",
    "company_domain",
    "country",
    "pkd",
    "pageviews",
    "duration_min",
    "max_scroll_pct",
    "high_intent",
    "site_domain",
    "last_seen_at",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const c = r.companies ?? {};
    const minutes = Math.round((r.total_duration_ms ?? 0) / 6000) / 10;
    lines.push(
      [
        r.intent_score,
        c.name ?? "",
        c.domain ?? "",
        c.country ?? r.country ?? "",
        c.pkd ?? "",
        r.pageview_count,
        minutes,
        r.max_scroll_pct,
        r.high_intent_hit ? "yes" : "no",
        r.site_domain ?? "",
        r.last_seen_at,
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hot-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function HotLeadsPage() {
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const fn = useServerFn(getHotLeads);
  const qc = useQueryClient();

  const [minScore, setMinScore] = useState(50);
  const [country, setCountry] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["hot-leads", wid, minScore, country, search],
    queryFn: () =>
      fn({
        data: {
          workspaceId: wid!,
          minScore,
          country: country === "ALL" ? undefined : country,
          search: search || undefined,
        },
      }),
    enabled: !!wid,
    refetchInterval: 10_000,
  });

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

  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const c = (r as any).companies?.country ?? (r as any).country;
      if (c) set.add(c);
    }
    return Array.from(set).sort();
  }, [rows]);

  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">🔥 Hot Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sesje z wysokim intent score — gotowe do kontaktu sprzedażowego. Lista odświeża się w czasie rzeczywistym.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-muted-foreground">Realtime</span>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_200px_180px_auto] gap-4 items-end rounded-lg border border-border/60 bg-card p-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-2">
            Min. score: <span className="font-mono font-semibold text-foreground">{minScore}</span>
          </label>
          <Slider
            value={[minScore]}
            onValueChange={(v) => setMinScore(v[0])}
            min={0}
            max={100}
            step={5}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-2">Kraj</label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Wszystkie</SelectItem>
              {countryOptions.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-2">Szukaj firmy</label>
          <Input
            placeholder="nazwa lub domena…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => downloadCsv(rows)}
          disabled={rows.length === 0}
        >
          ⬇ CSV ({rows.length})
        </Button>
      </div>

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
                          {v.companies.pkd ? ` · PKD ${v.companies.pkd}` : ""}
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
                  Brak gorących leadów dla aktualnych filtrów. Zmniejsz próg score albo wyczyść filtry.
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
