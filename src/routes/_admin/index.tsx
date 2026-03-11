import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/")({
	component: DashboardHome,
});

function DashboardHome() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Overview of your organization.
				</p>
			</div>
			{/* Overview Widgets can go here */}
		</div>
	);
}
