import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productsQueryOptions } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_admin/catalog/products/")({
	loader: ({ context: { queryClient } }) => {
		return queryClient.ensureQueryData(productsQueryOptions());
	},
	component: ProductsIndexPage,
});

function ProductsIndexPage() {
	const { data: products } = useSuspenseQuery(productsQueryOptions());

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Products</h1>
					<p className="text-muted-foreground">
						Manage your product catalog.
					</p>
				</div>
				<Link to="/catalog/products/new">
					<Button>Create Product</Button>
				</Link>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Base Unit</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products?.map((product) => (
							<TableRow key={product.id}>
								<TableCell className="font-medium">
									<Link
										to="/catalog/products/$productId"
										params={{ productId: product.id }}
										className="hover:underline"
									>
										{product.name}
									</Link>
								</TableCell>
								<TableCell>{product.base_unit}</TableCell>
								<TableCell>
									<Badge
										variant={product.status === "active" ? "default" : "secondary"}
									>
										{product.status}
									</Badge>
								</TableCell>
								<TableCell>
									{new Date(product.created_at).toLocaleDateString()}
								</TableCell>
								<TableCell className="text-right">
									<Link
										to="/catalog/products/$productId"
										params={{ productId: product.id }}
									>
										<Button variant="ghost" size="sm">
											View
										</Button>
									</Link>
								</TableCell>
							</TableRow>
						))}
						{(!products || products.length === 0) && (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center">
									No products found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
