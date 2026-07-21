import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  listAsnCompanies,
  upsertAsnCompany,
  deleteAsnCompany,
} from "@/lib/asn-companies.functions";

export const Route = createFileRoute("/app/admin/asn")({
  head: () => ({ meta: [{ title: "Admin · Mapa ASN — Pixie" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AsnAdminPage,
});

type Row = {
  id: string;
  asn: string;
  company_name: string;
  company_domain: string;
  country: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type FormState = {
  id?: string;
  asn: string;
  company_name: string;
  company_domain: string;
  country: string;
  notes: string;
};

const empty: FormState = {
  asn: "",
  company_name: "",
  company_domain: "",
  country: "",
  notes: "",
};

function AsnAdminPage() {
  const qc = useQueryClient();
  const list = useServerFn(listAsnCompanies);
  const upsert = useServerFn(upsertAsnCompany);
  const remove = useServerFn(deleteAsnCompany);

  const [form, setForm] = useState<FormState | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["asn-companies"],
    queryFn: () => list(),
  });

  const saveMut = useMutation({
    mutationFn: (payload: FormState) =>
      upsert({
        data: {
          id: payload.id,
          asn: payload.asn,
          company_name: payload.company_name,
          company_domain: payload.company_domain,
          country: payload.country || null,
          notes: payload.notes || null,
        },
      }),
    onSuccess: () => {
      toast.success("Zapisano");
      setForm(null);
      qc.invalidateQueries({ queryKey: ["asn-companies"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Usunięto");
      qc.invalidateQueries({ queryKey: ["asn-companies"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows: Row[] = (data ?? []) as Row[];
  const q = search.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (r) =>
          r.asn.toLowerCase().includes(q) ||
          r.company_name.toLowerCase().includes(q) ||
          r.company_domain.toLowerCase().includes(q),
      )
    : rows;

  return (
    <div className="mx-auto max-w-6xl p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/app/admin"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:bg-surface"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-display">Mapa ASN → Firma</h1>
            <p className="text-sm text-muted-foreground">
              Kuratorowana baza mapowania numerów ASN na konkretne firmy.
            </p>
          </div>
        </div>
        <button
          onClick={() => setForm({ ...empty })}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Dodaj wpis
        </button>
      </div>

      <input
        type="text"
        placeholder="Szukaj po ASN, nazwie lub domenie…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border border-border/60 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
      />

      {isLoading && <p className="text-sm text-muted-foreground">Ładuję…</p>}
      {error && (
        <p className="text-sm text-destructive">
          Błąd: {(error as Error).message}
        </p>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ASN</th>
                <th className="px-4 py-3">Firma</th>
                <th className="px-4 py-3">Domena</th>
                <th className="px-4 py-3">Kraj</th>
                <th className="px-4 py-3">Notatki</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {rows.length === 0
                      ? "Brak wpisów. Dodaj pierwszy."
                      : "Brak wyników dla filtra."}
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-mono text-xs">{r.asn}</td>
                  <td className="px-4 py-3">{r.company_name}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.company_domain}
                  </td>
                  <td className="px-4 py-3 text-xs">{r.country ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[280px] truncate">
                    {r.notes ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() =>
                          setForm({
                            id: r.id,
                            asn: r.asn,
                            company_name: r.company_name,
                            company_domain: r.company_domain,
                            country: r.country ?? "",
                            notes: r.notes ?? "",
                          })
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
                        aria-label="Edytuj"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(`Usunąć wpis dla ${r.asn} (${r.company_name})?`)
                          ) {
                            delMut.mutate(r.id);
                          }
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Usuń"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setForm(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border/60 bg-surface p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                {form.id ? "Edytuj wpis" : "Nowy wpis"}
              </h2>
              <button
                onClick={() => setForm(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMut.mutate(form);
              }}
              className="space-y-3"
            >
              <Field label="ASN (np. AS197226)">
                <input
                  required
                  value={form.asn}
                  onChange={(e) => setForm({ ...form, asn: e.target.value })}
                  placeholder="AS197226"
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                />
              </Field>
              <Field label="Nazwa firmy">
                <input
                  required
                  value={form.company_name}
                  onChange={(e) =>
                    setForm({ ...form, company_name: e.target.value })
                  }
                  placeholder="Allegro.pl"
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field label="Domena">
                <input
                  required
                  value={form.company_domain}
                  onChange={(e) =>
                    setForm({ ...form, company_domain: e.target.value })
                  }
                  placeholder="allegro.pl"
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                />
              </Field>
              <Field label="Kraj (ISO 2, opcjonalnie)">
                <input
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value.toUpperCase() })
                  }
                  placeholder="PL"
                  maxLength={2}
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm font-mono uppercase outline-none focus:border-primary"
                />
              </Field>
              <Field label="Notatki (opcjonalnie)">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-background"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={saveMut.isPending}
                  className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {saveMut.isPending ? "Zapisuję…" : "Zapisz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
