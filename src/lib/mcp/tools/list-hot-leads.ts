import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  getActiveWorkspaceId,
  noWorkspace,
  supabaseForUser,
  unauthenticated,
} from "../supabase";

export default defineTool({
  name: "list_hot_leads",
  title: "List hot leads",
  description:
    "Return recent sessions with the highest intent score, joined with the resolved company. Use this to answer 'who visited us today with buying intent?'.",
  inputSchema: {
    hours: z
      .number()
      .int()
      .min(1)
      .max(720)
      .default(24)
      .describe("Lookback window in hours (default 24)."),
    min_score: z
      .number()
      .int()
      .min(0)
      .max(100)
      .default(60)
      .describe("Minimum intent score (0-100)."),
    limit: z.number().int().min(1).max(100).default(20),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ hours, min_score, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const wid = await getActiveWorkspaceId(supabase);
    if (!wid) return noWorkspace();

    const { data: sites } = await supabase
      .from("sites")
      .select("id, domain")
      .eq("workspace_id", wid);
    const siteIds = (sites ?? []).map((s) => s.id);
    if (siteIds.length === 0) {
      return {
        content: [{ type: "text", text: "No sites in workspace." }],
        structuredContent: { leads: [] },
      };
    }

    const since = new Date(Date.now() - hours * 3_600_000).toISOString();
    const { data, error } = await supabase
      .from("sessions")
      .select(
        "id, site_id, intent_score, pageview_count, max_scroll_pct, total_duration_ms, high_intent_hit, last_seen_at, country, companies(id, name, domain, industry, country)",
      )
      .in("site_id", siteIds)
      .gte("last_seen_at", since)
      .gte("intent_score", min_score)
      .order("intent_score", { ascending: false })
      .limit(limit);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { leads: data ?? [] },
    };
  },
});
