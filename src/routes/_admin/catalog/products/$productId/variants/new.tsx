import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVariant } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute(
	"/_admin/catalog/products/$productId/variants/new",
)({
	component: NewVariantPage,
});

const variantSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
	barcode: z.string(),
	price: z.number().min(0, "Price must be >= 0"),
	cost: z.number().min(0, "Cost must be >= 0"),
	is_active: z.boolean(),
});

function NewVariantPage() {
	const { productId } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof variantSchema>) => {
			return createVariant({
				data: {
					productId,
					...data,
					barcode: data.barcode || undefined,
					cost: data.cost || undefined,
				},
			});
		},
		onSuccess: () => {
			toast.success("Variant created successfully");
			queryClient.invalidateQueries({
				queryKey: ["products", productId, "variants"],
			});
			navigate({
				to: "/catalog/products/$productId",
				params: { productId },
			});
		},
		onError: (error) => {
			toast.error(`Failed to create variant: ${error.message}`);
		},
	});

	const form = useForm({
		defaultValues: {
			sku: "",
			barcode: "",
			price: 0,
			cost: 0,
			is_active: true,
		},
		validators: {
			onChange: variantSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
		},
	});

	return (
		<div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Add Variant</h1>
				<p className="text-muted-foreground">
					Create a new variant for this product.
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6 bg-card p-6 rounded-lg border shadow-sm"
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
								placeholder="e.g. BEANS-1KG"
							/>
							{field.state.meta.errors ? (
								<p className="text-sm text-destructive">
									{field.state.meta.errors.join(", ")}
								</p>
							) : null}
						</div>
					)}
				/>

				<form.Field
					name="barcode"
					validators={{ onChange: variantSchema.shape.barcode }}
					children={(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Barcode (Optional)</Label>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="e.g. 123456789012"
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
								<Label htmlFor={field.name}>Selling Price</Label>
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
								{field.state.meta.errors ? (
									<p className="text-sm text-destructive">
										{field.state.meta.errors.join(", ")}
									</p>
								) : null}
							</div>
						)}
					/>

					<form.Field
						name="cost"
						validators={{ onChange: variantSchema.shape.cost }}
						children={(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Unit Cost</Label>
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
					validators={{ onChange: variantSchema.shape.is_active }}
					children={(field) => (
						<div className="flex items-center space-x-2 pt-2">
							<Checkbox
								id={field.name}
								checked={field.state.value}
								onCheckedChange={(checked) =>
									field.handleChange(checked === true)
								}
							/>
							<Label htmlFor={field.name} className="font-normal cursor-pointer">
								Active variant (available for sale/inventory)
							</Label>
						</div>
					)}
				/>

				<div className="flex justify-end gap-4 pt-4 border-t">
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/catalog/products/$productId", params: { productId } })}
					>
						Cancel
					</Button>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => (
							<Button type="submit" disabled={!canSubmit || isSubmitting}>
								{isSubmitting ? "Saving..." : "Save Variant"}
							</Button>
						)}
					/>
				</div>
			</form>
		</div>
	);
}
