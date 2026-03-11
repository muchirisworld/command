import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your organization settings.
				</p>
			</div>
			{/* Settings forms can go here */}
		</div>
	);
}
