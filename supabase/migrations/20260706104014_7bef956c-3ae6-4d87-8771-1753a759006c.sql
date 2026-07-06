-- 1. Lock down SECURITY DEFINER helpers from public API access.
--    They're still callable from RLS policies (inline SQL) and server code
--    (service role bypasses REVOKE), but PostgREST /rpc will no longer expose them.
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_workspace_role(uuid, uuid, workspace_role[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_ip_hint(text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies (e.g. admin panel). SECURITY DEFINER
-- functions still execute when referenced from policies regardless of EXECUTE
-- grants, so this is safe.

-- 2. companies: replace open "authenticated USING (true)" with workspace-scoped access.
DROP POLICY IF EXISTS "authenticated read companies" ON public.companies;

CREATE POLICY "workspace members read own companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sessions s
    JOIN public.sites si ON si.id = s.site_id
    WHERE s.company_id = companies.id
      AND public.is_workspace_member(si.workspace_id, auth.uid())
  )
  OR EXISTS (
    SELECT 1
    FROM public.target_accounts ta
    WHERE ta.company_id = companies.id
      AND public.is_workspace_member(ta.workspace_id, auth.uid())
  )
);

-- 3. ip_company_hints: remove the "any authenticated" read policy.
--    Reads only happen from server code via supabaseAdmin (bypasses RLS).
DROP POLICY IF EXISTS "authenticated read hints" ON public.ip_company_hints;

-- 4. people: add workspace-scoped INSERT/UPDATE policies for defense in depth.
--    Writes currently happen through supabaseAdmin (bypasses RLS), so this
--    doesn't break existing flows — it only prevents future client-side
--    write paths from bypassing workspace isolation.
CREATE POLICY "members insert people"
ON public.people
FOR INSERT
TO authenticated
WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "members update people"
ON public.people
FOR UPDATE
TO authenticated
USING (public.is_workspace_member(workspace_id, auth.uid()))
WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));