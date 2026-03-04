import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireAuth } from "@/server/auth/auth";
import AppSidebar from "../../components/layout/app-sidebar";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		await requireAuth();
	},
});

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarTrigger />
			<Outlet />
		</SidebarProvider>
	);
}
