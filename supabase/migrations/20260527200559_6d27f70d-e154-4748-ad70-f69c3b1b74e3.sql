GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_workspace_role(uuid, uuid, workspace_role[]) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_ip_hint(text, text, uuid) TO authenticated, service_role;