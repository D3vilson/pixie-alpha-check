import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  deleteIntegration,
  getIntegrations,
  upsertWebhookIntegration,
} from "@/lib/workspace.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/integrations")({
  head: () => ({ meta: [{ title: "Integrations — VisitorID EU" }] }),
  component: Integrations,
});

function Integrations() {
  const { data: ws } = useWorkspace();
  const wid = ws?.workspace.id;
  const qc = useQueryClient();
  const listFn = useServerFn(getIntegrations);
  const upsertFn = useServerFn(upsertWebhookIntegration);
  const delFn = useServerFn(deleteIntegration);

  const q = useQuery({
    queryKey: ["integrations", wid],
    queryFn: () => listFn({ data: { workspaceId: wid! } }),
    enabled: !!wid,
  });

  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="font-display text-3xl">Integrations</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Get notified when a target account visits your site. Paste your incoming webhook URL.
      </p>

      <div className="mt-6 space-y-4">
        <WebhookCard
          type="slack"
          title="Slack"
          subtitle="Create an Incoming Webhook in your Slack workspace and paste the URL."
          existing={(q.data ?? []).find((i: any) => i.type === "slack")}
          onSave={async (url) => {
            await upsertFn({ data: { workspaceId: wid!, type: "slack", webhookUrl: url } });
            qc.invalidateQueries({ queryKey: ["integrations", wid] });
            toast.success("Slack connected");
          }}
          onDelete={async (id) => {
            await delFn({ data: { id } });
            qc.invalidateQueries({ queryKey: ["integrations", wid] });
          }}
        />
        <WebhookCard
          type="teams"
          title="Microsoft Teams"
          subtitle="Create an Incoming Webhook on the target Teams channel."
          existing={(q.data ?? []).find((i: any) => i.type === "teams")}
          onSave={async (url) => {
            await upsertFn({ data: { workspaceId: wid!, type: "teams", webhookUrl: url } });
            qc.invalidateQueries({ queryKey: ["integrations", wid] });
            toast.success("Teams connected");
          }}
          onDelete={async (id) => {
            await delFn({ data: { id } });
            qc.invalidateQueries({ queryKey: ["integrations", wid] });
          }}
        />
      </div>
    </div>
  );
}

function WebhookCard({
  type, title, subtitle, existing, onSave, onDelete,
}: {
  type: string; title: string; subtitle: string;
  existing: any;
  onSave: (url: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-lg border border-border/60 bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {existing && (
          <span className="text-xs rounded-full bg-accent/15 text-accent px-2 py-1">Connected</span>
        )}
      </div>
      {existing ? (
        <div className="mt-4 flex items-center justify-between gap-2">
          <code className="text-xs text-muted-foreground truncate flex-1">
            {existing.settings?.webhook_url}
          </code>
          <Button variant="outline" size="sm" onClick={() => onDelete(existing.id)}>Disconnect</Button>
        </div>
      ) : (
        <form
          className="mt-4 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!url) return;
            setBusy(true);
            try { await onSave(url); setUrl(""); } finally { setBusy(false); }
          }}
        >
          <Input
            type="url"
            placeholder={`https://hooks.${type === "slack" ? "slack.com" : "office.com"}/…`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <Button type="submit" disabled={busy}>Save</Button>
        </form>
      )}
    </div>
  );
}
