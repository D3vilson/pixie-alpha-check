import { defineTool } from "@lovable.dev/mcp-js";
import {
  getActiveWorkspaceId,
  noWorkspace,
  supabaseForUser,
  unauthenticated,
} from "../supabase";

export default defineTool({
  name: "list_sites",
  title: "List sites",
  description:
    "List all tracked sites in the signed-in user's workspace, with domain, tracking ID and alert threshold.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const wid = await getActiveWorkspaceId(supabase);
    if (!wid) return noWorkspace();
    const { data, error } = await supabase
      .from("sites")
      .select("id, domain, tracking_id, alert_threshold, created_at")
      .eq("workspace_id", wid)
      .order("created_at", { ascending: false });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { sites: data ?? [] },
    };
  },
});
