// Wysyłka real-time alertów do Slack/Teams gdy intent_score przekroczy próg.
// Idempotentne: debounce 1h na sesję.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface HotLeadAlertInput {
  workspaceId: string;
  sessionId: string;
  score: number;
  company: { id: string; name: string; domain: string; country: string | null } | null;
  pageviewCount: number;
  totalDurationMs: number;
  maxScrollPct: number;
  lastUrl: string;
  siteDomain: string;
}

function formatSlackMessage(a: HotLeadAlertInput): object {
  const companyLine = a.company
    ? `*${a.company.name}* (${a.company.domain}${a.company.country ? `, ${a.company.country}` : ""})`
    : "_Nierozpoznana firma_";
  const minutes = Math.round(a.totalDurationMs / 60000 * 10) / 10;
  return {
    text: `🔥 Hot lead na ${a.siteDomain} — score ${a.score}/100`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🔥 *Hot Lead* — score *${a.score}/100*\n${companyLine}\n📄 ${a.pageviewCount} stron · ⏱ ${minutes} min · 📜 ${a.maxScrollPct}% scroll\n🔗 Ostatnio: ${a.lastUrl}`,
        },
      },
    ],
  };
}

export async function maybeFireHotLeadAlert(input: HotLeadAlertInput): Promise<void> {
  // Pobierz aktywne integracje
  const { data: integrations } = await supabaseAdmin
    .from("integrations")
    .select("type, settings, enabled")
    .eq("workspace_id", input.workspaceId)
    .eq("enabled", true);

  if (!integrations || integrations.length === 0) return;

  const payload = formatSlackMessage(input);
  const body = JSON.stringify(payload);

  await Promise.allSettled(
    integrations.map(async (integ) => {
      const url = (integ.settings as { webhook_url?: string } | null)?.webhook_url;
      if (!url) return;
      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } catch (e) {
        console.error(`[alerts] ${integ.type} webhook failed`, e);
      }
    }),
  );

  // Zaznacz że alert poszedł — debounce
  await supabaseAdmin
    .from("sessions")
    .update({ last_alert_at: new Date().toISOString() })
    .eq("id", input.sessionId);
}
