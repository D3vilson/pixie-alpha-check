import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle, ShieldCheck, Network } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/app/admin")({
  head: () => ({ meta: [{ title: "Admin — Pixie" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AdminPage,
});

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function AdminPage() {
  const fetchStats = useServerFn(getAdminStats);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchStats(),
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Ładuję…</div>;
  }
  if (error) {
    return (
      <div className="p-8">
        <p className="text-sm text-destructive">
          Brak dostępu lub błąd: {(error as Error).message}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Tylko admin platformy widzi ten widok.
        </p>
      </div>
    );
  }
  if (!data) return null;

  const { totals, users, sites } = data;

  return (
    <div className="mx-auto max-w-7xl p-8 space-y-8">
      <header className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display">Admin platformy</h1>
          <p className="text-sm text-muted-foreground">
            Auto-refresh co 30s
          </p>
        </div>
      </header>

      {/* Totals */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="Użytkownicy" value={totals.users} />
        <Stat label="Sites" value={totals.sites} />
        <Stat label="Aktywne (24h)" value={totals.active_sites_24h} />
        <Stat label="Sesje (total)" value={totals.sessions} />
        <Stat label="Firmy w bazie" value={totals.companies} />
      </section>

      {/* Sites */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Strony klientów</h2>
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Domena</th>
                <th className="px-4 py-3">Workspace</th>
                <th className="px-4 py-3 text-right">Sesje (total)</th>
                <th className="px-4 py-3 text-right">Ostatnie 24h</th>
                <th className="px-4 py-3">Ostatni hit</th>
                <th className="px-4 py-3">Endpoint</th>
              </tr>
            </thead>
            <tbody>
              {sites.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    Brak wygenerowanych snippetów.
                  </td>
                </tr>
              )}
              {sites.map((s) => (
                <tr key={s.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-mono text-xs">{s.domain}</td>
                  <td className="px-4 py-3">{s.workspace_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.sessions_total}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.sessions_24h}</td>
                  <td className="px-4 py-3 text-xs">{fmt(s.last_seen_at)}</td>
                  <td className="px-4 py-3">
                    {s.collect_visible ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-500">
                        <CheckCircle2 className="h-3.5 w-3.5" /> aktywny
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        <XCircle className="h-3.5 w-3.5" /> brak hitów
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          „Aktywny" = był przynajmniej jeden hit POST /api/public/collect z tej domeny w ostatnich 24h.
        </p>
      </section>

      {/* Users */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Użytkownicy ({users.length})</h2>
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Zarejestrowany</th>
                <th className="px-4 py-3">Ostatnie logowanie</th>
                <th className="px-4 py-3 text-right">Workspace'y</th>
                <th className="px-4 py-3">Rola</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border/60">
                  <td className="px-4 py-3">{u.email ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{fmt(u.created_at)}</td>
                  <td className="px-4 py-3 text-xs">{fmt(u.last_sign_in_at)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{u.workspaces}</td>
                  <td className="px-4 py-3">
                    {u.is_admin ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" /> admin
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">user</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-display tabular-nums">{value}</p>
    </div>
  );
}
