import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import { deletePerson, getPeople } from "@/lib/workspace.functions";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/time";
import { useT } from "@/i18n";

export const Route = createFileRoute("/app/people")({
  head: () => ({ meta: [{ title: "People — VisitorID EU" }] }),
  component: People,
});

function People() {
  const t = useT();
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const qc = useQueryClient();
  const listFn = useServerFn(getPeople);
  const delFn = useServerFn(deletePerson);

  const q = useQuery({
    queryKey: ["people", wid],
    queryFn: () => listFn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
  });

  return (
    <div className="px-8 py-8 max-w-6xl">
      <h1 className="font-display text-3xl">{t.app.people.h1}</h1>
      <p className="text-sm text-muted-foreground mt-1">{t.app.people.sub}</p>

      <div className="mt-6 rounded-lg border border-border/60 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">{t.app.people.colName}</th>
              <th className="px-4 py-3 text-left">{t.app.people.colCompany}</th>
              <th className="px-4 py-3 text-left">{t.app.people.colConsent}</th>
              <th className="px-4 py-3 text-left">{t.app.people.colCaptured}</th>
              <th className="px-4 py-3 text-right">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((p: any) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="px-4 py-3 font-medium">{p.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.companies?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="text-xs rounded-full bg-accent/15 text-accent px-2 py-1">
                    {p.consent_source}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDistanceToNow(p.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (!confirm(t.app.people.confirmErase(p.email))) return;
                      await delFn({ data: { id: p.id } });
                      qc.invalidateQueries({ queryKey: ["people", wid] });
                      toast.success(t.app.people.erased);
                    }}
                  >
                    {t.common.erase}
                  </Button>
                </td>
              </tr>
            ))}
            {q.data && q.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">{t.app.people.empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
