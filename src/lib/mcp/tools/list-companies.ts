import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  getActiveWorkspaceId,
  noWorkspace,
  supabaseForUser,
  unauthenticated,
} from "../supabase";

export default defineTool({
  name: "list_companies",
  title: "List companies",
  description:
    "List companies that visited the workspace's sites, most recent first. Optionally filter by domain substring.",
  inputSchema: {
    search: z.string().trim().max(200).optional().describe("Substring match on domain or name."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
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
        content: [{ type: "text", text: "No sites in workspace." }],
        structuredContent: { companies: [] },
      };
    }

    const { data: sessions } = await supabase
      .from("sessions")
      .select("company_id, last_seen_at")
      .in("site_id", siteIds)
      .not("company_id", "is", null)
      .order("last_seen_at", { ascending: false })
      .limit(500);

    const seen = new Set<string>();
    const companyIds: string[] = [];
    for (const s of sessions ?? []) {
      const cid = s.company_id as string | null;
      if (cid && !seen.has(cid)) {
        seen.add(cid);
        companyIds.push(cid);
      }
    }
    if (companyIds.length === 0) {
      return {
        content: [{ type: "text", text: "No companies detected yet." }],
        structuredContent: { companies: [] },
      };
    }

    let q = supabase
      .from("companies")
      .select("id, name, domain, industry, country, size, website, enriched_at")
      .in("id", companyIds);
    if (search) q = q.or(`domain.ilike.%${search}%,name.ilike.%${search}%`);
    const { data, error } = await q.limit(limit);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { companies: data ?? [] },
    };
  },
});
