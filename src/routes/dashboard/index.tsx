import {
	ArrowRight01Icon,
	PackageReceiveIcon,
	Plus,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { productsQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(productsQueryOptions());
	},
});

function DashboardComponent() {
	const { data: products } = useSuspenseQuery(productsQueryOptions());

	return (
		<div className="p-6 space-y-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome to your product operating system.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<Button className="w-full justify-start" variant="outline">
							<Link to="/dashboard/catalog/products/new">
								<HugeiconsIcon icon={Plus} className="mr-2 h-4 w-4" />
								Create Product
							</Link>
						</Button>
						<Button className="w-full justify-start" variant="outline">
							<Link to="/dashboard/inventory/receive">
								<HugeiconsIcon
									icon={PackageReceiveIcon}
									className="mr-2 h-4 w-4"
								/>
								Receive Inventory
							</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Recent Products</CardTitle>
						<CardDescription>
							Your latest additions to the catalog.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{products.slice(0, 5).map((product) => (
								<div
									key={product.id}
									className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
								>
									<div>
										<p className="font-medium">{product.name}</p>
										<p className="text-xs text-muted-foreground">
											{product.base_unit} •{" "}
											{new Date(product.created_at).toLocaleDateString()}
										</p>
									</div>
									<Button variant="ghost" size="icon">
										<Link
											to="/dashboard/catalog/products/$productId"
											params={{ productId: product.id }}
										>
											<HugeiconsIcon
												icon={ArrowRight01Icon}
												className="h-4 w-4"
											/>
										</Link>
									</Button>
								</div>
							))}
							{products.length === 0 && (
								<p className="text-sm text-muted-foreground">
									No products found. Create your first product to get started.
								</p>
							)}
							{products.length > 0 && (
								<Button variant="link" className="px-0">
									<Link to="/dashboard/catalog/products">
										View all products
									</Link>
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
