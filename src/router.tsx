import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createQueryClient } from "./queryClient";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import type { QueryClient } from "@tanstack/react-query";

export interface RouterContext {
	queryClient: QueryClient;
	auth?: {
		isAuthenticated: boolean;
		userId?: string | null;
		orgId?: string | null;
	};
}

// Create a new router instance
export const getRouter = () => {
	const queryClient = createQueryClient();
	const router = createRouter({
		routeTree,
		context: {
			queryClient,
		},
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
};

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
