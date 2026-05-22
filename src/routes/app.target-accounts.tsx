import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import { addTargetAccount, deleteTargetAccount, getTargetAccounts } from "@/lib/workspace.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n";

export const Route = createFileRoute("/app/target-accounts")({
  head: () => ({ meta: [{ title: "Target accounts — VisitorID EU" }] }),
  component: TargetAccounts,
});

function TargetAccounts() {
  const t = useT();
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const qc = useQueryClient();
  const listFn = useServerFn(getTargetAccounts);
  const addFn = useServerFn(addTargetAccount);
  const delFn = useServerFn(deleteTargetAccount);

  const q = useQuery({
    queryKey: ["targets", wid],
    queryFn: () => listFn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
  });

  const [domain, setDomain] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!wid || !domain) return;
    setBusy(true);
    try {
      await addFn({ data: { workspaceId: wid, domain, label: label || undefined } });
      setDomain(""); setLabel("");
      qc.invalidateQueries({ queryKey: ["targets", wid] });
      toast.success(t.app.targets.added);
    } catch (err: any) {
      toast.error(err.message ?? t.app.targets.addFailed);
    } finally { setBusy(false); }
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <h1 className="font-display text-3xl">{t.app.targets.h1}</h1>
      <p className="text-sm text-muted-foreground mt-1">{t.app.targets.sub}</p>

      <form onSubmit={onAdd} className="mt-6 flex gap-2">
        <Input placeholder={t.app.targets.domainPh} value={domain} onChange={(e) => setDomain(e.target.value)} required />
        <Input placeholder={t.app.targets.labelPh} value={label} onChange={(e) => setLabel(e.target.value)} />
        <Button type="submit" disabled={busy}>{t.common.add}</Button>
      </form>

      <ul className="mt-6 divide-y divide-border/40 rounded-lg border border-border/60 bg-card">
        {(q.data ?? []).map((it: any) => (
          <li key={it.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-medium">{it.label}</div>
              <div className="text-xs text-muted-foreground">{it.domain_pattern}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await delFn({ data: { id: it.id } });
                qc.invalidateQueries({ queryKey: ["targets", wid] });
              }}
            >{t.common.remove}</Button>
          </li>
        ))}
        {q.data && q.data.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">{t.app.targets.empty}</li>
        )}
      </ul>
    </div>
  );
}
