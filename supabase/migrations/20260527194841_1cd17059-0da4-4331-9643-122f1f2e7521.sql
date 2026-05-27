REVOKE EXECUTE ON FUNCTION public.increment_ip_hint(text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ip_hint(text, text, uuid) TO service_role;