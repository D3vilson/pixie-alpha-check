import { defineTool } from "@lovable.dev/mcp-js";
import {
  getActiveWorkspaceId,
  noWorkspace,
  supabaseForUser,
  unauthenticated,
} from "../supabase";

export default defineTool({
  name: "get_workspace_stats",
  title: "Get workspace stats",
  description:
    "High-level counts for the workspace: sites, sessions in the last 24h, sessions in the last 7d, identified companies.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const wid = await getActiveWorkspaceId(supabase);
    if (!wid) return noWorkspace();

    const { data: sites } = await supabase
      .from("sites")
      .select("id")
      .eq("workspace_id", wid);
    const siteIds = (sites ?? []).map((s) => s.id);

    if (siteIds.length === 0) {
      return {
        content: [{ type: "text", text: "No sites yet." }],
        structuredContent: { sites: 0, sessions_24h: 0, sessions_7d: 0, companies: 0 },
      };
    }

    const since24 = new Date(Date.now() - 24 * 3_600_000).toISOString();
    const since7 = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString();

    const [{ count: c24 }, { count: c7 }, { data: comp }] = await Promise.all([
      supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .in("site_id", siteIds)
        .gte("last_seen_at", since24),
      supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .in("site_id", siteIds)
        .gte("last_seen_at", since7),
      supabase
        .from("sessions")
        .select("company_id")
        .in("site_id", siteIds)
        .not("company_id", "is", null)
        .gte("last_seen_at", since7)
        .limit(1000),
    ]);

    const uniqueCompanies = new Set((comp ?? []).map((r) => r.company_id));
    const stats = {
      sites: siteIds.length,
      sessions_24h: c24 ?? 0,
      sessions_7d: c7 ?? 0,
      companies_7d: uniqueCompanies.size,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      structuredContent: stats,
    };
  },
});
