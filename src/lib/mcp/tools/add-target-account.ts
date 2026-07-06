import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  getActiveWorkspaceId,
  noWorkspace,
  supabaseForUser,
  unauthenticated,
} from "../supabase";

export default defineTool({
  name: "add_target_account",
  title: "Add target account",
  description:
    "Add a target-account domain pattern (e.g. 'acme.com' or '*.acme.com') so hits from matching companies trigger alerts.",
  inputSchema: {
    domain_pattern: z
      .string()
      .trim()
      .min(3)
      .max(255)
      .describe("Exact domain or wildcard pattern like *.acme.com"),
    label: z.string().trim().max(200).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async ({ domain_pattern, label }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const wid = await getActiveWorkspaceId(supabase);
    if (!wid) return noWorkspace();
    const { data, error } = await supabase
      .from("target_accounts")
      .insert({
        workspace_id: wid,
        domain_pattern: domain_pattern.toLowerCase(),
        label: label ?? null,
      })
      .select("id, label, domain_pattern")
      .single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Added target account: ${data.domain_pattern}` }],
      structuredContent: { target_account: data },
    };
  },
});
