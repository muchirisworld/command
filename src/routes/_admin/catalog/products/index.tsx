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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, ViewIcon, Edit01Icon, ArchiveIcon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { archiveProduct, deleteProduct, updateProduct } from "@/lib/api-client";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/_admin/catalog/products/")({
	loader: ({ context: { queryClient } }) => {
		return queryClient.ensureQueryData(productsQueryOptions());
	},
	component: ProductsIndexPage,
});

const productSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string(),
	status: z.enum(["active", "archived"]),
});

function EditProductDialog({
	product,
	open,
	onOpenChange,
}: {
	product: Product | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: z.infer<typeof productSchema>) => {
			if (!product) throw new Error("No product selected");
			return updateProduct({
				data: {
					id: product.id,
					...data,
				},
			});
		},
		onSuccess: () => {
			toast.success("Product updated");
			queryClient.invalidateQueries({ queryKey: ["products"] });
			onOpenChange(false);
		},
		onError: (error) => toast.error(`Failed to update: ${error.message}`),
	});

	const form = useForm({
		defaultValues: {
			name: product?.name ?? "",
			description: product?.description ?? "",
			status: product?.status ?? "active",
		},
		validators: {
			onChange: productSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Product</DialogTitle>
					<DialogDescription>
						Update the product details below.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4 py-4"
				>
					<form.Field
						name="name"
						validators={{ onChange: productSchema.shape.name }}
						children={(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Name</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					/>
					<form.Field
						name="description"
						validators={{ onChange: productSchema.shape.description }}
						children={(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Description</Label>
								<Textarea
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					/>
					<form.Field
						name="status"
						children={(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Status</Label>
								<select
									id={field.name}
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value as any)}
								>
									<option value="active">Active</option>
									<option value="archived">Archived</option>
								</select>
							</div>
						)}
					/>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							)}
						/>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function ProductsIndexPage() {
	const { data: products } = useSuspenseQuery(productsQueryOptions());
	const queryClient = useQueryClient();
	const router = useRouter();

	const [editingProduct, setEditingProduct] = useState<Product | null>(null);

	const archiveMutation = useMutation({
		mutationFn: (productId: string) => archiveProduct({ data: productId }),
		onSuccess: () => {
			toast.success("Product archived");
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (error) => toast.error(`Failed to archive: ${error.message}`),
	});

	const deleteMutation = useMutation({
		mutationFn: (productId: string) => deleteProduct({ data: productId }),
		onSuccess: () => {
			toast.success("Product deleted");
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (error) => toast.error(`Failed to delete: ${error.message}`),
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
												onSelect={() =>
													router.navigate({
														to: "/catalog/products/$productId",
														params: { productId: product.id },
													})
												}
												render={
													<Link
														to="/catalog/products/$productId"
														params={{ productId: product.id }}
													>
														<HugeiconsIcon
															icon={ViewIcon}
															size={14}
															className="mr-2"
														/>
														View Details
													</Link>
												}
											/>
											<DropdownMenuItem
												className="cursor-pointer"
												onClick={() => setEditingProduct(product)}
											>
												<HugeiconsIcon
													icon={Edit01Icon}
													size={14}
													className="mr-2"
												/>
												Edit
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="cursor-pointer text-destructive focus:text-destructive"
												disabled={product.status === "archived"}
												onClick={() => archiveMutation.mutate(product.id)}
											>
												<HugeiconsIcon
													icon={ArchiveIcon}
													size={14}
													className="mr-2"
												/>
												Archive
											</DropdownMenuItem>
											<DropdownMenuItem
												className="cursor-pointer text-destructive focus:text-destructive"
												onClick={() => {
													if (
														confirm(
															"Are you sure you want to delete this product? This action cannot be undone.",
														)
													) {
														deleteMutation.mutate(product.id);
													}
												}}
											>
												<HugeiconsIcon
													icon={Delete01Icon}
													size={14}
													className="mr-2"
												/>
												Delete
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

			<EditProductDialog
				product={editingProduct}
				open={!!editingProduct}
				onOpenChange={(open) => !open && setEditingProduct(null)}
			/>
		</div>
	);
}
