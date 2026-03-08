import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ViewIcon, Edit01Icon, ArchiveIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { archiveProduct } from "@/lib/api-client";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/catalog/products/")({
	loader: ({ context: { queryClient } }) => {
		return queryClient.ensureQueryData(productsQueryOptions());
	},
	component: ProductsIndexPage,
});

function ProductsIndexPage() {
	const { data: products } = useSuspenseQuery(productsQueryOptions());
	const queryClient = useQueryClient();
	const router = useRouter();

	const archiveMutation = useMutation({
		mutationFn: (productId: string) => archiveProduct({ data: productId }),
		onSuccess: () => {
			toast.success("Product archived");
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (error) => toast.error(`Failed to archive: ${error.message}`),
	});

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
							<TableHead className="w-20">Actions</TableHead>
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
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger
											render={
												<Button variant="ghost" className="h-8 w-8 p-0">
													<span className="sr-only">Open menu</span>
													<HugeiconsIcon icon={MoreHorizontal} size={16} />
												</Button>
											}
										/>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												className="cursor-pointer"
												onSelect={() => router.navigate({
													to: "/catalog/products/$productId",
													params: { productId: product.id },
												})}
												render={
													<Link
														to="/catalog/products/$productId"
														params={{ productId: product.id }}
														>
														<HugeiconsIcon icon={ViewIcon} size={14} className="mr-2" />
														View Details
													</Link>
												}
											/>
											<DropdownMenuItem
												className="cursor-pointer"
												onClick={() => toast.info("Edit Product TODO: Needs PATCH /catalog/products/{id} UI")}
											>
												<HugeiconsIcon icon={Edit01Icon} size={14} className="mr-2" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="cursor-pointer text-destructive focus:text-destructive"
												disabled={product.status === "archived"}
												onClick={() => archiveMutation.mutate(product.id)}
											>
												<HugeiconsIcon icon={ArchiveIcon} size={14} className="mr-2" />
												Archive
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
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
	)
}
