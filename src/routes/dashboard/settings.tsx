import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/settings")({
    component: SettingsComponent,
});

function SettingsComponent() {
    return (
        <div className="p-6 space-y-6 w-full">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your organization preferences.</p>

            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Basic organization configuration.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground italic">Settings module is currently under development.</p>
                </CardContent>
            </Card>
        </div>
    );
}
