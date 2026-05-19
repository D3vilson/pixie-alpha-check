import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { bootstrapWorkspace } from "@/lib/workspace.functions";

export function useWorkspace() {
  const bootstrap = useServerFn(bootstrapWorkspace);
  return useQuery({
    queryKey: ["workspace-bootstrap"],
    queryFn: () => bootstrap(),
  });
}
