import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  deleteIntegration,
  getIntegrations,
  setIntegrationEnabled,
  testIntegration,
  upsertWebhookIntegration,
} from "@/lib/workspace.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/i18n";

export const Route = createFileRoute("/app/integrations")({
  head: () => ({ meta: [{ title: "Integrations — VisitorID EU" }] }),
  component: Integrations,
});

function Integrations() {
  const t = useT();
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const qc = useQueryClient();
  const listFn = useServerFn(getIntegrations);
  const upsertFn = useServerFn(upsertWebhookIntegration);
  const delFn = useServerFn(deleteIntegration);
  const toggleFn = useServerFn(setIntegrationEnabled);
  const testFn = useServerFn(testIntegration);

  const q = useQuery({
    queryKey: ["integrations", wid],
    queryFn: () => listFn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["integrations", wid] });

  const handlers = {
    onSave: async (type: "slack" | "teams", url: string) => {
      await upsertFn({ data: { workspaceId: wid!, type, webhookUrl: url } });
      invalidate();
      toast.success(type === "slack" ? t.app.integrations.slackConnected : t.app.integrations.teamsConnected);
    },
    onDelete: async (id: string) => {
      await delFn({ data: { id } });
      invalidate();
    },
    onToggle: async (id: string, enabled: boolean) => {
      await toggleFn({ data: { id, enabled } });
      invalidate();
    },
    onTest: async (id: string) => {
      try {
        await testFn({ data: { id } });
        toast.success("Testowy hot lead wysłany 🔥");
      } catch (e: any) {
        toast.error(`Test nieudany: ${e?.message ?? "unknown error"}`);
      }
    },
  };

  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="font-display text-3xl">{t.app.integrations.h1}</h1>
      <p className="text-sm text-muted-foreground mt-1">{t.app.integrations.sub}</p>

      <div className="mt-6 space-y-4">
        <WebhookCard
          type="slack"
          title="Slack"
          subtitle={t.app.integrations.slackSub}
          existing={(q.data ?? []).find((i: any) => i.type === "slack")}
          {...handlers}
        />
        <WebhookCard
          type="teams"
          title="Microsoft Teams"
          subtitle={t.app.integrations.teamsSub}
          existing={(q.data ?? []).find((i: any) => i.type === "teams")}
          {...handlers}
        />
      </div>
    </div>
  );
}

function WebhookCard({
  type, title, subtitle, existing, onSave, onDelete, onToggle, onTest,
}: {
  type: "slack" | "teams"; title: string; subtitle: string;
  existing: any;
  onSave: (type: "slack" | "teams", url: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  onTest: (id: string) => Promise<void>;
}) {
  const t = useT();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toggling, setToggling] = useState(false);

  return (
    <div className="rounded-lg border border-border/60 bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {existing && (
          <span
            className={`text-xs rounded-full px-2 py-1 ${
              existing.enabled
                ? "bg-accent/15 text-accent"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {existing.enabled ? t.common.connected : "Wyłączone"}
          </span>
        )}
      </div>
      {existing ? (
        <div className="mt-4 space-y-3">
          <code className="block text-xs text-muted-foreground truncate rounded bg-surface px-2 py-1.5">
            {existing.settings?.webhook_url}
          </code>
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={!!existing.enabled}
                disabled={toggling}
                onCheckedChange={async (checked) => {
                  setToggling(true);
                  try {
                    await onToggle(existing.id, checked);
                  } finally {
                    setToggling(false);
                  }
                }}
              />
              <span className="text-muted-foreground">Włączona</span>
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={testing || !existing.enabled}
                onClick={async () => {
                  setTesting(true);
                  try { await onTest(existing.id); } finally { setTesting(false); }
                }}
              >
                {testing ? "Wysyłanie…" : "Wyślij test"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(existing.id)}>
                {t.common.disconnect}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <form
          className="mt-4 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!url) return;
            setBusy(true);
            try { await onSave(type, url); setUrl(""); } finally { setBusy(false); }
          }}
        >
          <Input
            type="url"
            placeholder={`https://hooks.${type === "slack" ? "slack.com" : "office.com"}/…`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <Button type="submit" disabled={busy}>{t.common.save}</Button>
        </form>
      )}
    </div>
  );
}
