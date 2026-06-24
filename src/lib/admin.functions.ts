import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw error;
  if (!data) throw new Error("Forbidden");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw error;
    return { isAdmin: Boolean(data) };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Users (auth.admin.listUsers paginates; first 1000 wystarczy w MVP)
    const { data: usersResp, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersErr) throw usersErr;
    const users = usersResp.users;

    // Workspace membership counts per user
    const { data: members } = await supabaseAdmin
      .from("workspace_members")
      .select("user_id, workspace_id, role");
    const wsByUser = new Map<string, { workspaces: number; roles: string[] }>();
    (members ?? []).forEach((m: any) => {
      const cur = wsByUser.get(m.user_id) ?? { workspaces: 0, roles: [] };
      cur.workspaces += 1;
      cur.roles.push(m.role);
      wsByUser.set(m.user_id, cur);
    });

    // Admin user_ids
    const { data: adminRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    const adminIds = new Set((adminRoles ?? []).map((r: any) => r.user_id));

    const usersOut = users.map((u) => ({
      id: u.id,
      email: u.email ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      workspaces: wsByUser.get(u.id)?.workspaces ?? 0,
      is_admin: adminIds.has(u.id),
    }));

    // Sites + workspace name + session stats
    const { data: sites } = await supabaseAdmin
      .from("sites")
      .select("id, domain, tracking_id, created_at, workspace_id, workspaces(name)")
      .order("created_at", { ascending: false });

    const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    const sitesOut = await Promise.all(
      (sites ?? []).map(async (s: any) => {
        const [{ count: total }, { count: last24h }, { data: lastSession }] =
          await Promise.all([
            supabaseAdmin
              .from("sessions")
              .select("id", { count: "exact", head: true })
              .eq("site_id", s.id),
            supabaseAdmin
              .from("sessions")
              .select("id", { count: "exact", head: true })
              .eq("site_id", s.id)
              .gte("last_seen_at", since24h),
            supabaseAdmin
              .from("sessions")
              .select("last_seen_at")
              .eq("site_id", s.id)
              .order("last_seen_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

        return {
          id: s.id,
          domain: s.domain,
          tracking_id: s.tracking_id,
          workspace_name: s.workspaces?.name ?? "—",
          created_at: s.created_at,
          sessions_total: total ?? 0,
          sessions_24h: last24h ?? 0,
          last_seen_at: lastSession?.last_seen_at ?? null,
          collect_visible: Boolean(lastSession?.last_seen_at &&
            new Date(lastSession.last_seen_at) > new Date(since24h)),
        };
      }),
    );

    // Aggregates
    const [{ count: companies }, { count: sessions }] = await Promise.all([
      supabaseAdmin.from("companies").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("sessions").select("id", { count: "exact", head: true }),
    ]);

    return {
      totals: {
        users: users.length,
        sites: sitesOut.length,
        companies: companies ?? 0,
        sessions: sessions ?? 0,
        active_sites_24h: sitesOut.filter((s) => s.collect_visible).length,
      },
      users: usersOut,
      sites: sitesOut,
    };
  });
