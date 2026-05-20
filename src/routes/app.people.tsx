import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import { deletePerson, getPeople } from "@/lib/workspace.functions";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/time";

export const Route = createFileRoute("/app/people")({
  head: () => ({ meta: [{ title: "People — VisitorID EU" }] }),
  component: People,
});

function People() {
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
      <h1 className="font-display text-3xl">People</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Identified individuals — only stored after a consent signal (form, email link, or CMP). Right to erasure: one click.
      </p>

      <div className="mt-6 rounded-lg border border-border/60 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Consent</th>
              <th className="px-4 py-3 text-left">Captured</th>
              <th className="px-4 py-3 text-right">Actions</th>
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
                      if (!confirm(`Erase ${p.email}? This deletes the person record and unlinks sessions.`)) return;
                      await delFn({ data: { id: p.id } });
                      qc.invalidateQueries({ queryKey: ["people", wid] });
                      toast.success("Person erased");
                    }}
                  >
                    Erase
                  </Button>
                </td>
              </tr>
            ))}
            {q.data && q.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No identified people yet. Call <code>window.VisitorID.identify()</code> with consent to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
