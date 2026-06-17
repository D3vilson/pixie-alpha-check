import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Copy, AlertCircle } from "lucide-react";
import { useWorkspace } from "@/hooks/use-workspace";
import { getSites, createSite, getSitePixelStatus, getIpDebugLog } from "@/lib/workspace.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "@/lib/time";

export const Route = createFileRoute("/app/install")({
  head: () => ({ meta: [{ title: "Install pixel — Pixie" }] }),
  component: InstallPage,
});

function InstallPage() {
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const listFn = useServerFn(getSites);
  const createFn = useServerFn(createSite);
  const qc = useQueryClient();

  const sitesQ = useQuery({
    queryKey: ["sites", wid],
    queryFn: () => listFn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
  });

  const sites = sitesQ.data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId && sites.length > 0) setSelectedId(sites[0].id);
  }, [sites, selectedId]);

  const [newDomain, setNewDomain] = useState("");
  const [creating, setCreating] = useState(false);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!wid || !newDomain.trim()) return;
    setCreating(true);
    try {
      await createFn({ data: { workspaceId: wid, domain: newDomain.trim() } });
      setNewDomain("");
      await qc.invalidateQueries({ queryKey: ["sites", wid] });
      toast.success("Dodano stronę");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nie udało się dodać");
    } finally {
      setCreating(false);
    }
  }

  const selectedSite = sites.find((s) => s.id === selectedId);

  return (
    <div className="px-8 py-10 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl tracking-tight">Instalacja pixela</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Wklej jeden tag do <code className="font-mono text-xs">&lt;head&gt;</code> swojej strony.
        Status detekcji zaktualizuje się automatycznie po pierwszym pageview.
      </p>

      {/* Sites picker */}
      <section className="mt-8">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Wybierz stronę
        </h2>
        {sites.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nie masz jeszcze żadnej strony. Dodaj poniżej.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sites.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  s.id === selectedId
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground/30"
                }`}
              >
                {s.domain}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={onCreate} className="mt-4 flex gap-2 max-w-md">
          <Input
            placeholder="example.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            disabled={creating}
          />
          <Button type="submit" variant="outline" disabled={creating || !newDomain.trim()}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dodaj stronę"}
          </Button>
        </form>
      </section>

      {selectedSite && wid && (
        <SiteInstall workspaceId={wid} site={selectedSite} />
      )}
    </div>
  );
}

function SiteInstall({
  workspaceId,
  site,
}: {
  workspaceId: string;
  site: { id: string; domain: string; tracking_id: string };
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://app.visitorid.eu";
  const snippet = useMemo(
    () =>
      `<script async src="${origin}/api/public/t.js" data-vid="${site.tracking_id}"></script>`,
    [origin, site.tracking_id],
  );

  const statusFn = useServerFn(getSitePixelStatus);
  const status = useQuery({
    queryKey: ["pixel-status", site.id],
    queryFn: () => statusFn({ data: { workspaceId, siteId: site.id } }),
    refetchInterval: 5000,
  });

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Skopiowano");
  }

  return (
    <>
      {/* Detection status */}
      <section className="mt-8">
        <DetectionStatus
          loading={status.isLoading}
          detected={status.data?.detected ?? false}
          lastSeenAt={status.data?.lastSeenAt ?? null}
          sessions24h={status.data?.sessions24h ?? 0}
          domain={site.domain}
        />
      </section>

      {/* Snippet */}
      <section className="mt-8">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Twój snippet
        </h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
            <span className="text-xs font-mono text-muted-foreground">HTML</span>
            <button
              onClick={() => copy(snippet)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3 w-3" /> Kopiuj
            </button>
          </div>
          <pre className="p-4 text-xs overflow-x-auto font-mono">{snippet}</pre>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Tracking ID: <code className="font-mono">{site.tracking_id}</code>. Skrypt ~2KB, async, bez cookies, honoruje Global Privacy Control.
        </p>
      </section>

      {/* Platform instructions */}
      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Instrukcja dla Twojej platformy
        </h2>
        <Tabs defaultValue="html">
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="wp">WordPress</TabsTrigger>
            <TabsTrigger value="gtm">Google Tag Manager</TabsTrigger>
            <TabsTrigger value="webflow">Webflow</TabsTrigger>
            <TabsTrigger value="shopify">Shopify</TabsTrigger>
          </TabsList>

          <TabsContent value="html" className="mt-4 text-sm text-foreground/80 space-y-2">
            <p>Wklej snippet bezpośrednio przed zamykającym tagiem <code className="font-mono">&lt;/head&gt;</code> w pliku HTML.</p>
            <p className="text-xs text-muted-foreground">Działa na każdym statycznym/Next/Nuxt/Astro/etc.</p>
          </TabsContent>

          <TabsContent value="wp" className="mt-4 text-sm text-foreground/80 space-y-2">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Wtyczka <strong>WPCode</strong> (lub Insert Headers and Footers).</li>
              <li>Code Snippets → Header Scripts → wklej snippet → Save.</li>
              <li>Bez wtyczki: <code className="font-mono text-xs">functions.php</code> → akcja <code className="font-mono text-xs">wp_head</code>.</li>
            </ol>
          </TabsContent>

          <TabsContent value="gtm" className="mt-4 text-sm text-foreground/80 space-y-2">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Tags → New → <strong>Custom HTML</strong>.</li>
              <li>Wklej snippet w polu HTML.</li>
              <li>Trigger: <strong>All Pages</strong> → Save → Publish.</li>
            </ol>
            <p className="text-xs text-muted-foreground">Skrypt już jest async — nie zaznaczaj „Support document.write".</p>
          </TabsContent>

          <TabsContent value="webflow" className="mt-4 text-sm text-foreground/80 space-y-2">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Project Settings → Custom Code → <strong>Head Code</strong>.</li>
              <li>Wklej snippet → Save → Publish project.</li>
            </ol>
          </TabsContent>

          <TabsContent value="shopify" className="mt-4 text-sm text-foreground/80 space-y-2">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Online Store → Themes → <strong>Edit code</strong>.</li>
              <li>Layout → <code className="font-mono text-xs">theme.liquid</code>.</li>
              <li>Wklej snippet przed <code className="font-mono text-xs">&lt;/head&gt;</code> → Save.</li>
            </ol>
          </TabsContent>
        </Tabs>
      </section>

      {/* Test */}
      <section className="mt-10 rounded-lg border border-border bg-card p-5">
        <h2 className="font-medium">Jak przetestować</h2>
        <ol className="mt-3 text-sm text-foreground/80 list-decimal pl-5 space-y-1.5">
          <li>Otwórz <a href={`https://${site.domain}`} target="_blank" rel="noreferrer" className="underline">{site.domain}</a> w nowej karcie.</li>
          <li>Wróć tu — status powyżej zmieni się na „Wykryto" w ciągu 5 sekund.</li>
          <li>Sprawdź konsolę: <code className="font-mono text-xs">window.VisitorID</code> powinien istnieć.</li>
        </ol>
      </section>

      <IpDebugPanel workspaceId={workspaceId} siteId={site.id} />
    </>
  );
}

function IpDebugPanel({ workspaceId, siteId }: { workspaceId: string; siteId: string }) {
  const fn = useServerFn(getIpDebugLog);
  const q = useQuery({
    queryKey: ["ip-debug-log", siteId],
    queryFn: () => fn({ data: { workspaceId, siteId } }),
    refetchInterval: 5000,
  });
  const rows = q.data ?? [];

  return (
    <section className="mt-10">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
        Debug: ostatnie 20 IP (co zwrócił ipinfo)
      </h2>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {q.isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Ładuję…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            Brak wpisów. Pojawią się tu po pierwszej nowej sesji (nie liczy się każdy pageview).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-surface text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 font-medium">Kiedy</th>
                  <th className="text-left px-3 py-2 font-medium">/24</th>
                  <th className="text-left px-3 py-2 font-medium">Kraj</th>
                  <th className="text-left px-3 py-2 font-medium">ipinfo: org / ASN</th>
                  <th className="text-left px-3 py-2 font-medium">ipinfo: company</th>
                  <th className="text-left px-3 py-2 font-medium">Warstwa</th>
                  <th className="text-left px-3 py-2 font-medium">Rozpoznano</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                      {formatDistanceToNow(r.created_at)}
                    </td>
                    <td className="px-3 py-2 font-mono">{r.ip_prefix}</td>
                    <td className="px-3 py-2">{r.country ?? "—"}</td>
                    <td className="px-3 py-2">
                      <div>{r.org ?? "—"}</div>
                      {r.asn_name && (
                        <div className="text-muted-foreground text-[10px]">
                          {r.asn_name} {r.asn_domain ? `· ${r.asn_domain}` : ""}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {r.company_name ? (
                        <div>
                          <div>{r.company_name}</div>
                          <div className="text-muted-foreground text-[10px]">
                            {r.company_domain} {r.company_type ? `· ${r.company_type}` : ""}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          r.layer === "ipinfo"
                            ? "bg-primary/10 text-primary"
                            : r.layer === "hint"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-amber-500/10 text-amber-700"
                        }`}
                      >
                        {r.layer}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {r.resolved_company_id ? (
                        <span className="text-primary">✓ firma</span>
                      ) : (
                        <span className="text-muted-foreground">nierozpoznana</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Log per nowa sesja (nie per pageview). Pokazuje co dokładnie ipinfo zwróciło dla danego /24 — łatwo zobaczyć czemu coś nie zostało rozpoznane (residential ISP, hosting, brak company).
      </p>
    </section>
  );
}


function DetectionStatus({
  loading, detected, lastSeenAt, sessions24h, domain,
}: {
  loading: boolean; detected: boolean; lastSeenAt: string | null; sessions24h: number; domain: string;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Sprawdzam status…</span>
      </div>
    );
  }
  if (detected) {
    return (
      <div className="rounded-lg border border-primary/40 bg-primary/5 p-5 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-sm">Pixel wykryty na {domain}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Ostatni pageview {lastSeenAt && formatDistanceToNow(lastSeenAt)} · {sessions24h} sesji w ciągu 24h
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-5 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-medium text-sm">Pixel jeszcze nie wykryty</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Wklej snippet poniżej do <code className="font-mono">{domain}</code>, potem odwiedź stronę.
          Status odświeża się co 5s.
        </div>
      </div>
    </div>
  );
}
