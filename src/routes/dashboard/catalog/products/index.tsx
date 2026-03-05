import {
	ArrowRight01Icon,
	Plus,
	Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { productsQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/catalog/products/")({
	component: ProductsListComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(productsQueryOptions());
	},
});

function ProductsListComponent() {
	const { data: products } = useSuspenseQuery(productsQueryOptions());
	const [search, setSearch] = useState("");

	const filteredProducts = useMemo(() => {
		return products.filter(
			(p) =>
				p.name.toLowerCase().includes(search.toLowerCase()) ||
				p.base_unit.toLowerCase().includes(search.toLowerCase()),
		);
	}, [products, search]);

	return (
		<div className="p-6 space-y-4 w-full">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Products</h1>
					<p className="text-muted-foreground">Manage your product catalog.</p>
				</div>
				<Button>
					<Link to="/dashboard/catalog/products/new">
						<HugeiconsIcon icon={Plus} className="mr-2 h-4 w-4" />
						New Product
					</Link>
				</Button>
			</div>

			<div className="flex items-center space-x-2">
				<div className="relative w-full max-w-sm">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
					/>
					<Input
						placeholder="Search products..."
						className="pl-8"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			<div className="rounded-md border bg-card">
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
						{filteredProducts.map((product) => (
							<TableRow key={product.id}>
								<TableCell className="font-medium">{product.name}</TableCell>
								<TableCell>{product.base_unit}</TableCell>
								<TableCell>
									<Badge
										variant={
											product.status === "active" ? "default" : "secondary"
										}
									>
										{product.status}
									</Badge>
								</TableCell>
								<TableCell>
									{new Date(product.created_at).toLocaleDateString()}
								</TableCell>
								<TableCell className="text-right">
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
								</TableCell>
							</TableRow>
						))}
						{filteredProducts.length === 0 && (
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
