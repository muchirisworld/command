import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/middleware/authMiddleware";

export const authFunction = createServerFn().middleware([authMiddleware]);

export const checkAuth = authFunction.handler(({ context }) => {
	return {
		isAuthenticated: context.auth.isAuthenticated,
	};
});

export const requireAuth = authFunction.handler(async ({ context }) => {
	if (!context.auth.isAuthenticated) {
		throw redirect({
			to: "/auth/sign-in",
		});
	}

	const token = await context.auth.getToken();

	return {
		userId: context.auth.userId,
		orgId: context.auth.orgId,
		permissions: context.auth.orgPermissions,
		sessionId: context.auth.sessionId,
		token,
	};
});
