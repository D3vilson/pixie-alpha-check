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

// ASN format: "AS" + 1..10 digits (np. AS197226)
const ASN_RE = /^AS\d{1,10}$/;
const DOMAIN_RE = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

function normalize(input: {
  asn: string;
  company_name: string;
  company_domain: string;
  country?: string | null;
  notes?: string | null;
}) {
  const asn = input.asn.trim().toUpperCase();
  const company_name = input.company_name.trim();
  const company_domain = input.company_domain.trim().toLowerCase();
  const country = input.country?.trim().toUpperCase() || null;
  const notes = input.notes?.trim() || null;

  if (!ASN_RE.test(asn)) throw new Error("ASN musi mieć format AS<numer>, np. AS197226");
  if (!company_name || company_name.length > 200) throw new Error("Nazwa firmy jest wymagana (max 200 znaków)");
  if (!DOMAIN_RE.test(company_domain)) throw new Error("Nieprawidłowa domena (np. allegro.pl)");
  if (country && !/^[A-Z]{2}$/.test(country)) throw new Error("Kraj musi być 2-literowym kodem ISO (np. PL)");
  if (notes && notes.length > 500) throw new Error("Notatki max 500 znaków");

  return { asn, company_name, company_domain, country, notes };
}

export const listAsnCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("asn_companies")
      .select("id, asn, company_name, company_domain, country, notes, created_at, updated_at")
      .order("asn", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const upsertAsnCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id?: string;
    asn: string;
    company_name: string;
    company_domain: string;
    country?: string | null;
    notes?: string | null;
  }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload = normalize(data);
    if (data.id) {
      const { error } = await context.supabase
        .from("asn_companies")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", data.id);
      if (error) throw error;
      return { ok: true, id: data.id };
    }
    const { data: inserted, error } = await context.supabase
      .from("asn_companies")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, id: inserted.id };
  });

export const deleteAsnCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("asn_companies")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
