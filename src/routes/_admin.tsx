import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireAuth } from "@/server/auth/auth";
import AppSidebar from "@/components/layout/app-sidebar";
import { GlobalSearch } from "@/components/layout/global-search";

export const Route = createFileRoute("/_admin")({
	component: RouteComponent,
	beforeLoad: async () => {
		await requireAuth();
	},
});

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="flex-1 overflow-auto flex flex-col">
				<header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
					<SidebarTrigger />
					<div className="w-full flex-1">
						<GlobalSearch />
					</div>
				</header>
				<div className="flex-1 p-6">
					<Outlet />
				</div>
			</main>
		</SidebarProvider>
	);
}
