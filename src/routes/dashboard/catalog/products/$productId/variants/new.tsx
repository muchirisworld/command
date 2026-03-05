import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVariant, getProduct } from "@/lib/api-client";

export const Route = createFileRoute(
	"/dashboard/catalog/products/$productId/variants/new",
)({
	component: CreateVariantComponent,
	loader: async ({ params }) => {
		return await getProduct({ data: params.productId });
	},
});

const variantSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
	barcode: z.string(), // Use string to match defaultValues: ""
	price: z.number().min(0, "Price must be positive"),
	cost: z.number().min(0), // Use number to match defaultValues: 0
	is_active: z.boolean(),
});

function CreateVariantComponent() {
	const product = Route.useLoaderData();
	const navigate = useNavigate();
	const { productId } = Route.useParams();

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
			try {
				await createVariant({
					data: {
						productId,
						...value,
						barcode: value.barcode || undefined,
						cost: value.cost || undefined,
					},
				});
				toast.success("Variant created successfully");
				navigate({
					to: "/dashboard/catalog/products/$productId",
					params: { productId },
				});
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to create variant",
				);
			}
		},
	});

	return (
		<div className="p-6 max-w-2xl mx-auto w-full">
			<div className="flex items-center space-x-2 mb-6">
				<Button variant="ghost" size="sm">
					<Link
						to="/dashboard/catalog/products/$productId"
						params={{ productId }}
						className="flex items-center"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
						Back to {product.name}
					</Link>
				</Button>
			</div>

			<h1 className="text-3xl font-bold tracking-tight mb-2">New Variant</h1>
			<p className="text-muted-foreground mb-6">
				Add a new SKU for {product.name}.
			</p>

			<Card>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<CardHeader>
						<CardTitle>Variant Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<form.Field
								name="sku"
								children={(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>SKU (Required)</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="e.g. JD-1L-001"
										/>
										{field.state.meta.errors?.length ? (
											<p className="text-xs text-destructive">
												{field.state.meta.errors[0]?.message ??
													String(field.state.meta.errors[0])}
											</p>
										) : null}
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
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="EAN/UPC"
										/>
									</div>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<form.Field
								name="price"
								children={(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Selling Price</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
										/>
									</div>
								)}
							/>
							<form.Field
								name="cost"
								children={(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Cost Price</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
										/>
									</div>
								)}
							/>
						</div>

						<form.Field
							name="is_active"
							children={(field) => (
								<div className="flex items-center space-x-2 pt-2">
									<Checkbox
										id={field.name}
										checked={field.state.value}
										onCheckedChange={(checked) => field.handleChange(!!checked)}
									/>
									<Label htmlFor={field.name}>
										Active and available for sale
									</Label>
								</div>
							)}
						/>
					</CardContent>
					<CardFooter className="flex justify-end space-x-2 border-t pt-4">
						<Button variant="outline" type="button">
							<Link
								to="/dashboard/catalog/products/$productId"
								params={{ productId }}
							>
								Cancel
							</Link>
						</Button>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? "Creating..." : "Create Variant"}
								</Button>
							)}
						/>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
