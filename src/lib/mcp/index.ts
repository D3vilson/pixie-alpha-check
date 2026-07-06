import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSites from "./tools/list-sites";
import listHotLeads from "./tools/list-hot-leads";
import listCompanies from "./tools/list-companies";
import listTargetAccounts from "./tools/list-target-accounts";
import addTargetAccount from "./tools/add-target-account";
import getWorkspaceStats from "./tools/get-workspace-stats";

// Build the OAuth issuer from the direct Supabase host. The `.lovable.cloud`
// proxy fails RFC 8414 issuer discovery, and only the project ref survives
// publish unchanged. Read the ref via `import.meta.env.VITE_SUPABASE_PROJECT_ID`
// which Vite inlines as a literal at build time. The fallback keeps the issuer
// well-formed during throwaway manifest-extract evals; the published build
// inlines the real ref, and a token never verifies against the sentinel.
const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "pixie-mcp",
  title: "Pixie",
  version: "0.1.0",
  instructions:
    "Read visitor intelligence for the signed-in Pixie workspace: sites, hot leads, detected companies, target accounts, and workspace stats. Use `add_target_account` to mark a domain as a target so future visits raise alerts.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listSites,
    listHotLeads,
    listCompanies,
    listTargetAccounts,
    addTargetAccount,
    getWorkspaceStats,
  ],
});
