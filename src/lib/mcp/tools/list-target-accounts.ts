import { defineTool } from "@lovable.dev/mcp-js";
import {
  getActiveWorkspaceId,
  noWorkspace,
  supabaseForUser,
  unauthenticated,
} from "../supabase";

export default defineTool({
  name: "list_target_accounts",
  title: "List target accounts",
  description: "List target account domain patterns for the workspace.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const wid = await getActiveWorkspaceId(supabase);
    if (!wid) return noWorkspace();
    const { data, error } = await supabase
      .from("target_accounts")
      .select("id, label, domain_pattern, company_id, created_at")
      .eq("workspace_id", wid)
      .order("created_at", { ascending: false });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { target_accounts: data ?? [] },
    };
  },
});
