import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	productQueryOptions,
	variantsQueryOptions,
	conversionsQueryOptions,
} from "@/lib/queries";
import { archiveProduct, createConversion } from "@/lib/api-client";
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

export const Route = createFileRoute("/_admin/catalog/products/$productId")({
	loader: async ({ context: { queryClient }, params: { productId } }) => {
		await Promise.all([
			queryClient.ensureQueryData(productQueryOptions(productId)),
			queryClient.ensureQueryData(variantsQueryOptions(productId)),
			queryClient.ensureQueryData(conversionsQueryOptions(productId)),
		]);
	},
	component: ProductDetailPage,
});

const conversionSchema = z.object({
	unit_from: z.string().min(1, "Required"),
	factor: z.number().positive("Must be positive"),
	precision: z.number().int().min(0, "Must be >= 0"),
});

function ProductDetailPage() {
	const { productId } = Route.useParams();
	const router = useRouter();
	const queryClient = useQueryClient();

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
								<TableHead className="text-right">Actions</TableHead>
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
									<TableCell className="text-right">
										<Link
											to="/inventory/variants/$variantId/stock"
											params={{ variantId: variant.id }}
										>
											<Button variant="ghost" size="sm">
												View Stock
											</Button>
										</Link>
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
									</TableRow>
								))}
								{(!conversions || conversions.length === 0) && (
									<TableRow>
										<TableCell colSpan={4} className="h-24 text-center">
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
		</div>
	);
}
