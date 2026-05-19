import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

const Schema = z.object({
  tracking_id: z.string().min(8).max(64),
  anon_id: z.string().min(8).max(128),
  email: z.string().email().max(255),
  name: z.string().max(255).nullable().optional(),
  consent: z.object({
    source: z.enum(["form", "email_link", "logged_in", "cmp"]),
    timestamp: z.string().min(1).max(64),
    proof: z.string().max(2000).optional(),
  }),
});

export const Route = createFileRoute("/api/public/identify")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let payload: unknown;
        try { payload = await request.json(); } catch {
          return new Response("Bad JSON", { status: 400, headers: CORS });
        }
        const parsed = Schema.safeParse(payload);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
            status: 400, headers: { "Content-Type": "application/json", ...CORS },
          });
        }
        const data = parsed.data;

        const { data: site } = await supabaseAdmin
          .from("sites")
          .select("id, workspace_id")
          .eq("tracking_id", data.tracking_id)
          .maybeSingle();
        if (!site) return new Response("Unknown tracking id", { status: 404, headers: CORS });

        // Upsert person scoped to workspace+email
        const { data: existing } = await supabaseAdmin
          .from("people")
          .select("id")
          .eq("workspace_id", site.workspace_id)
          .eq("email", data.email)
          .maybeSingle();

        let personId: string;
        if (existing) {
          personId = existing.id;
        } else {
          const { data: created, error } = await supabaseAdmin
            .from("people")
            .insert({
              workspace_id: site.workspace_id,
              email: data.email,
              name: data.name ?? null,
              consent_source: data.consent.source,
              consent_ts: new Date(data.consent.timestamp).toISOString(),
            })
            .select("id")
            .single();
          if (error || !created) {
            console.error(error);
            return new Response("Insert failed", { status: 500, headers: CORS });
          }
          personId = created.id;
        }

        // Link any prior sessions with this anon_id to the person.
        const { data: sessions } = await supabaseAdmin
          .from("sessions")
          .select("id")
          .eq("site_id", site.id)
          .eq("anon_id", data.anon_id);

        if (sessions && sessions.length > 0) {
          await supabaseAdmin
            .from("sessions")
            .update({ person_id: personId })
            .in("id", sessions.map((s) => s.id));

          await supabaseAdmin.from("identify_events").insert(
            sessions.map((s) => ({
              session_id: s.id,
              person_id: personId,
              source: data.consent.source,
              consent_proof: { timestamp: data.consent.timestamp, proof: data.consent.proof ?? null },
            })),
          );
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...CORS },
        });
      },
    },
  },
});
