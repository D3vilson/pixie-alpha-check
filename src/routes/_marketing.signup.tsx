import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { AuthShell, Field, Divider, GoogleIcon } from "./_marketing.login";

export const Route = createFileRoute("/_marketing/signup")({
  head: () => ({
    meta: [
      { title: "Create your workspace — VisitorID EU" },
      { name: "description", content: "Start free for 14 days. EU-hosted, GDPR-compliant visitor identification." },
    ],
  }),
  component: SignupPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  workspace: z.string().trim().min(2, "Workspace name is too short").max(80),
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, workspace });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { pending_workspace: parsed.data.workspace },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email to verify your account.");
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (result.error) { setLoading(false); toast.error("Google sign-in failed"); return; }
    if (result.redirected) return;
    navigate({ to: "/app" });
  };

  return (
    <AuthShell title="Create your workspace" subtitle="14 days free. No card needed.">
      <button onClick={google} disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-surface disabled:opacity-50">
        <GoogleIcon /> Sign up with Google
      </button>
      <Divider />
      <form onSubmit={submit} className="space-y-3">
        <Field label="Workspace name" type="text" value={workspace} onChange={setWorkspace} placeholder="Acme GmbH" />
        <Field label="Work email" type="email" value={email} onChange={setEmail} placeholder="you@company.eu" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" />
        <button type="submit" disabled={loading} className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50">
          {loading ? "Creating…" : "Create workspace"}
        </button>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        By signing up you accept our <Link to="/gdpr" className="text-accent hover:underline">DPA & sub-processor terms</Link>.
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Already have one? <Link to="/login" className="text-accent hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}
