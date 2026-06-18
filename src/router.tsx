import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  if (typeof window !== "undefined") {
    router.subscribe("onResolved", (e) => {
      const ids = router.state.matches.map((m) => m.routeId);
      const leaf = ids[ids.length - 1];
      const is404 = !leaf || leaf === "__root__";
      const tag = is404 ? "[Router ❌ 404]" : "[Router ✅]";
      // eslint-disable-next-line no-console
      console.log(`${tag} ${e.toLocation.pathname}`, { matchedRouteIds: ids, leaf });
    });
  }

  return router;
};
