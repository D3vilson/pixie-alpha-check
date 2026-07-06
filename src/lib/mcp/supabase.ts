import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

/**
 * Supabase client bound to the OAuth-verified end user. RLS runs as that user,
 * so every read/write is workspace-scoped without extra filtering here.
 */
export function supabaseForUser(ctx: ToolContext): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

/**
 * Returns the user's active workspace ID (first membership). Mirrors
 * bootstrapWorkspace's "first workspace wins" contract used in the UI.
 */
export async function getActiveWorkspaceId(
  client: SupabaseClient,
): Promise<string | null> {
  const { data, error } = await client
    .from("workspace_members")
    .select("workspace_id")
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.workspace_id as string;
}

export function unauthenticated() {
  return {
    content: [{ type: "text" as const, text: "Not authenticated." }],
    isError: true,
  };
}

export function noWorkspace() {
  return {
    content: [
      {
        type: "text" as const,
        text: "No workspace found for this user. Sign in to the app first to bootstrap one.",
      },
    ],
    isError: true,
  };
}
