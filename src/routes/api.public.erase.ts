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
  email: z.string().email().max(255),
});

/**
 * GDPR Article 17 — Right to erasure.
 *
 * Public endpoint. The customer's site is responsible for verifying the
 * requester's identity (typically via a signed email link) before calling.
 * Once called, we erase the person record and unlink sessions in the
 * workspace bound to the tracking_id.
 */
export const Route = createFileRoute("/api/public/erase")({
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
        const { tracking_id, email } = parsed.data;

        const { data: site } = await supabaseAdmin
          .from("sites")
          .select("id, workspace_id")
          .eq("tracking_id", tracking_id)
          .maybeSingle();
        if (!site) {
          return new Response(JSON.stringify({ ok: true, erased: 0 }), {
            status: 200, headers: { "Content-Type": "application/json", ...CORS },
          });
        }

        // Find person scoped to workspace + email
        const { data: people } = await supabaseAdmin
          .from("people")
          .select("id")
          .eq("workspace_id", site.workspace_id)
          .eq("email", email);

        let erased = 0;
        for (const p of people ?? []) {
          // Unlink sessions (preserve anonymized analytics) then delete person.
          await supabaseAdmin.from("sessions").update({ person_id: null }).eq("person_id", p.id);
          const { error } = await supabaseAdmin.from("people").delete().eq("id", p.id);
          if (!error) erased += 1;
        }

        return new Response(JSON.stringify({ ok: true, erased }), {
          status: 200, headers: { "Content-Type": "application/json", ...CORS },
        });
      },
    },
  },
});
