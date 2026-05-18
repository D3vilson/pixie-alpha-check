
-- Revoke public execute on security-definer helpers
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_workspace_role(uuid, uuid, public.workspace_role[]) FROM PUBLIC, anon, authenticated;
-- The functions are referenced inside RLS policies, which run as the table owner; no role needs direct EXECUTE.

-- Tighten workspace insert: must be a logged-in user
DROP POLICY IF EXISTS "authenticated create workspace" ON public.workspaces;
CREATE POLICY "authenticated create workspace" ON public.workspaces FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
