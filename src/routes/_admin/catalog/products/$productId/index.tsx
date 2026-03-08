import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	productQueryOptions,
	variantsQueryOptions,
	conversionsQueryOptions,
} from "@/lib/queries";
import {
	archiveProduct,
	createConversion,
	deleteVariant,
	deleteConversion,
	updateVariant,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	MoreHorizontal,
	ViewIcon,
	Edit01Icon,
	Delete01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import type { Variant } from "@/lib/types";

export const Route = createFileRoute("/_admin/catalog/products/$productId/")({
	loader: async ({ context: { queryClient }, params: { productId } }) => {
		await Promise.all([
			queryClient.ensureQueryData(productQueryOptions(productId)),
			queryClient.ensureQueryData(variantsQueryOptions(productId)),
			queryClient.ensureQueryData(conversionsQueryOptions(productId)),
		]);
	},
	component: ProductDetailPage,
});

const variantSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
	barcode: z.string(),
	price: z.number().min(0, "Price must be >= 0"),
	cost: z.number().min(0, "Cost must be >= 0"),
	is_active: z.boolean(),
});

function EditVariantDialog({
	variant,
	productId,
	open,
	onOpenChange,
}: {
	variant: Variant | null;
	productId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: z.infer<typeof variantSchema>) => {
			if (!variant) throw new Error("No variant selected");
			return updateVariant({
				data: {
					id: variant.id,
					...data,
					barcode: data.barcode || undefined,
				},
			});
		},
		onSuccess: () => {
			toast.success("Variant updated");
			queryClient.invalidateQueries({
				queryKey: ["products", productId, "variants"],
			});
			onOpenChange(false);
		},
		onError: (error) => toast.error(`Failed to update: ${error.message}`),
	});

	const form = useForm({
		defaultValues: {
			sku: variant?.sku ?? "",
			barcode: variant?.barcode ?? "",
			price: variant?.price ?? 0,
			cost: variant?.cost ?? 0,
			is_active: variant?.is_active ?? true,
		},
		validators: {
			onChange: variantSchema
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Variant</DialogTitle>
					<DialogDescription>
						Update SKU, pricing, and availability.
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
						name="sku"
						validators={{ onChange: variantSchema.shape.sku }}
						children={(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>SKU</Label>
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
						name="barcode"
						children={(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Barcode</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					/>
					<div className="grid grid-cols-2 gap-4">
						<form.Field
							name="price"
							validators={{ onChange: variantSchema.shape.price }}
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Price</Label>
									<Input
										id={field.name}
										type="number"
										step="0.01"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(Number.parseFloat(e.target.value) || 0)
										}
									/>
								</div>
							)}
						/>
						<form.Field
							name="cost"
							validators={{ onChange: variantSchema.shape.cost }}
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Cost</Label>
									<Input
										id={field.name}
										type="number"
										step="0.01"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(Number.parseFloat(e.target.value) || 0)
										}
									/>
								</div>
							)}
						/>
					</div>
					<form.Field
						name="is_active"
						children={(field) => (
							<div className="flex items-center space-x-2 py-2">
								<Checkbox
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) =>
										field.handleChange(checked === true)
									}
								/>
								<Label htmlFor={field.name}>Active</Label>
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

const conversionSchema = z.object({
	unit_from: z.string().min(1, "Required"),
	factor: z.number().positive("Must be positive"),
	precision: z.number().int().min(0, "Must be >= 0"),
});

function ProductDetailPage() {
	const { productId } = Route.useParams();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

	const { data: product } = useSuspenseQuery(productQueryOptions(productId));
	const { data: variants } = useSuspenseQuery(variantsQueryOptions(productId));
	const { data: conversions } = useSuspenseQuery(
		conversionsQueryOptions(productId),
	);

	const archiveMutation = useMutation({
		mutationFn: () => archiveProduct({ data: productId }),
		onSuccess: () => {
			toast.success("Product archived");
			queryClient.invalidateQueries({ queryKey: ["products"] });
			router.invalidate();
		},
		onError: (error) => toast.error(`Failed to archive: ${error.message}`),
	});

	const conversionMutation = useMutation({
		mutationFn: (data: z.infer<typeof conversionSchema>) =>
			createConversion({
				data: {
					productId,
					...data,
				},
			}),
		onSuccess: () => {
			toast.success("Conversion added");
			queryClient.invalidateQueries({
				queryKey: ["products", productId, "conversions"],
			});
			conversionForm.reset();
		},
		onError: (error) =>
			toast.error(`Failed to add conversion: ${error.message}`),
	});

	const deleteVariantMutation = useMutation({
		mutationFn: (variantId: string) => deleteVariant({ data: variantId }),
		onSuccess: () => {
			toast.success("Variant deleted");
			queryClient.invalidateQueries({
				queryKey: ["products", productId, "variants"],
			});
		},
		onError: (error) =>
			toast.error(`Failed to delete variant: ${error.message}`),
	});

	const deleteConversionMutation = useMutation({
		mutationFn: (conversionId: string) =>
			deleteConversion({ data: conversionId }),
		onSuccess: () => {
			toast.success("Conversion deleted");
			queryClient.invalidateQueries({
				queryKey: ["products", productId, "conversions"],
			});
		},
		onError: (error) =>
			toast.error(`Failed to delete conversion: ${error.message}`),
	});

	const conversionForm = useForm({
		defaultValues: {
			unit_from: "",
			factor: 1,
			precision: 0,
		},
		validators: {
			onChange: conversionSchema,
		},
		onSubmit: async ({ value }) => {
			await conversionMutation.mutateAsync(value);
		},
	});

	return (
		<div className="flex flex-col gap-8">
			{/* Header Section */}
			<div className="flex items-start justify-between bg-card p-6 rounded-lg border shadow-sm">
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<h1 className="text-3xl font-bold tracking-tight">
							{product.name}
						</h1>
						<Badge
							variant={product.status === "active" ? "default" : "secondary"}
						>
							{product.status}
						</Badge>
					</div>
					<p className="text-muted-foreground">{product.description}</p>
					<div className="text-sm font-medium">
						Base Unit: <Badge variant="outline">{product.base_unit}</Badge>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						variant="destructive"
						onClick={() => archiveMutation.mutate()}
						disabled={product.status === "archived" || archiveMutation.isPending}
					>
						Archive Product
					</Button>
				</div>
			</div>

			{/* Variants Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Variants</h2>
					<Link
						to="/catalog/products/$productId/variants/new"
						params={{ productId }}
					>
						<Button size="sm">Add Variant</Button>
					</Link>
				</div>
				<div className="rounded-md border bg-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>SKU</TableHead>
								<TableHead>Barcode</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Cost</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="w-20"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{variants?.map((variant) => (
								<TableRow key={variant.id}>
									<TableCell className="font-medium">{variant.sku}</TableCell>
									<TableCell>{variant.barcode || "-"}</TableCell>
									<TableCell>${variant.price.toFixed(2)}</TableCell>
									<TableCell>${(variant.cost || 0).toFixed(2)}</TableCell>
									<TableCell>
										<Badge
											variant={variant.is_active ? "default" : "secondary"}
										>
											{variant.is_active ? "Active" : "Inactive"}
										</Badge>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<span className="sr-only">Open menu</span>
													<HugeiconsIcon icon={MoreHorizontal} size={16} />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<Link
													to="/inventory/variants/$variantId/stock"
													params={{ variantId: variant.id }}
												>
													<DropdownMenuItem className="cursor-pointer">
														<HugeiconsIcon
															icon={ViewIcon}
															size={14}
															className="mr-2"
														/>
														View Stock
													</DropdownMenuItem>
												</Link>
												<DropdownMenuItem
													className="cursor-pointer"
													onClick={() => setEditingVariant(variant)}
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
													onClick={() => {
														if (
															confirm(
																"Are you sure you want to delete this variant?",
															)
														) {
															deleteVariantMutation.mutate(variant.id);
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
							{(!variants || variants.length === 0) && (
								<TableRow>
									<TableCell colSpan={6} className="h-24 text-center">
										No variants found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Conversions Section */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Unit Conversions</h2>
				<div className="grid gap-6 md:grid-cols-2">
					<div className="rounded-md border bg-card">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>From Unit</TableHead>
									<TableHead>To Unit</TableHead>
									<TableHead>Factor</TableHead>
									<TableHead>Precision</TableHead>
									<TableHead className="w-20">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{conversions?.map((conv) => (
									<TableRow key={conv.id}>
										<TableCell className="font-medium">
											{conv.unit_from}
										</TableCell>
										<TableCell>{conv.unit_to}</TableCell>
										<TableCell>{conv.factor}</TableCell>
										<TableCell>{conv.precision}</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<span className="sr-only">Open menu</span>
														<HugeiconsIcon icon={MoreHorizontal} size={16} />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														className="cursor-pointer text-destructive focus:text-destructive"
														onClick={() => {
															if (
																confirm(
																	"Are you sure you want to delete this conversion?",
																)
															) {
																deleteConversionMutation.mutate(conv.id);
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
								{(!conversions || conversions.length === 0) && (
									<TableRow>
										<TableCell colSpan={5} className="h-24 text-center">
											No conversions defined.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{/* Add Conversion Form */}
					<div className="bg-card p-4 rounded-md border shadow-sm">
						<h3 className="text-lg font-medium mb-4">Add Conversion</h3>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								conversionForm.handleSubmit();
							}}
							className="space-y-4"
						>
							<div className="grid grid-cols-2 gap-4">
								<conversionForm.Field
									name="unit_from"
									validators={{ onChange: conversionSchema.shape.unit_from }}
									children={(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>From Unit</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="e.g. BOX"
											/>
										</div>
									)}
								/>
								<div className="space-y-2">
									<Label>To Unit</Label>
									<Input value={product.base_unit} disabled />
									<p className="text-xs text-muted-foreground">
										Target is always base unit
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<conversionForm.Field
									name="factor"
									validators={{ onChange: conversionSchema.shape.factor }}
									children={(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Factor</Label>
											<Input
												id={field.name}
												type="number"
												step="0.001"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(Number.parseFloat(e.target.value))
												}
											/>
										</div>
									)}
								/>
								<conversionForm.Field
									name="precision"
									validators={{ onChange: conversionSchema.shape.precision }}
									children={(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Precision</Label>
											<Input
												id={field.name}
												type="number"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(Number.parseInt(e.target.value, 10))
												}
											/>
										</div>
									)}
								/>
							</div>

							<conversionForm.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
								children={([canSubmit, isSubmitting]) => (
									<Button
										type="submit"
										disabled={!canSubmit || isSubmitting}
										className="w-full"
									>
										{isSubmitting ? "Adding..." : "Add Conversion"}
									</Button>
								)}
							/>
						</form>
					</div>
				</div>
			</div>

			<EditVariantDialog
				variant={editingVariant}
				productId={productId}
				open={!!editingVariant}
				onOpenChange={(open) => !open && setEditingVariant(null)}
			/>
		</div>
	);
}
