import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { productsQueryOptions, variantsQueryOptions } from "@/lib/queries";
import { receiveInventory } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_admin/inventory/receive")({
	component: ReceiveInventoryPage,
});

const receiptSchema = z.object({
	quantity: z.number().positive("Quantity must be positive"),
	unit: z.string().min(1, "Unit is required"),
	source_type: z.string(),
	note: z.string(),
});

function ReceiveInventoryPage() {
	const navigate = useNavigate();

	const [selectedProductId, setSelectedProductId] = useState<string>("");
	const [selectedVariantId, setSelectedVariantId] = useState<string>("");

	const { data: products } = useQuery(productsQueryOptions());
	const { data: variants } = useQuery({
		...variantsQueryOptions(selectedProductId),
		enabled: !!selectedProductId,
	});

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof receiptSchema>) => {
			if (!selectedVariantId) throw new Error("Please select a variant");
			return receiveInventory({
				data: {
					variantId: selectedVariantId,
					...data,
					note: data.note || undefined,
				},
			});
		},
		onSuccess: () => {
			toast.success("Inventory received successfully");
			navigate({
				to: "/inventory/variants/$variantId/stock",
				params: { variantId: selectedVariantId },
			});
		},
		onError: (error) => {
			toast.error(`Failed to receive inventory: ${error.message}`);
		},
	});

	const form = useForm({
		defaultValues: {
			quantity: 1,
			unit: "EA",
			source_type: "manual",
			note: "",
		},
		validators: {
			onChange: receiptSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
		},
	});

	return (
		<div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Receive Inventory</h1>
				<p className="text-muted-foreground">
					Record new stock arrivals.
				</p>
			</div>

			<div className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
				<div className="space-y-4 pb-6 border-b">
					<div className="space-y-2">
						<Label>Product</Label>
						<select
							className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							value={selectedProductId}
							onChange={(e) => {
								setSelectedProductId(e.target.value);
								setSelectedVariantId(""); // reset variant
							}}
						>
							<option value="" disabled>
								Select a product
							</option>
							{products?.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name} ({p.base_unit})
								</option>
							))}
						</select>
					</div>

					{selectedProductId && (
						<div className="space-y-2">
							<Label>Variant</Label>
							<select
								className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								value={selectedVariantId}
								onChange={(e) => setSelectedVariantId(e.target.value)}
							>
								<option value="" disabled>
									Select a variant
								</option>
								{variants?.map((v) => (
									<option key={v.id} value={v.id}>
										{v.sku} {v.barcode ? `(${v.barcode})` : ""}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-6"
				>
					<div className="grid grid-cols-2 gap-4">
						<form.Field
							name="quantity"
							validators={{ onChange: receiptSchema.shape.quantity }}
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Quantity</Label>
									<Input
										id={field.name}
										type="number"
										step="0.01"
										disabled={!selectedVariantId}
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
							name="unit"
							validators={{ onChange: receiptSchema.shape.unit }}
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Unit</Label>
									<Input
										id={field.name}
										disabled={!selectedVariantId}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g. EA, BOX"
									/>
									{field.state.meta.errors ? (
										<p className="text-sm text-destructive">
											{field.state.meta.errors.join(", ")}
										</p>
									) : null}
								</div>
							)}
						/>
					</div>

					<form.Field
						name="note"
						validators={{ onChange: receiptSchema.shape.note }}
						children={(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Note (Optional)</Label>
								<Textarea
									id={field.name}
									disabled={!selectedVariantId}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g. PO-12345"
								/>
							</div>
						)}
					/>

					<div className="flex justify-end pt-4">
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={!canSubmit || isSubmitting || !selectedVariantId}
								>
									{isSubmitting ? "Receiving..." : "Receive Stock"}
								</Button>
							)}
						/>
					</div>
				</form>
			</div>
		</div>
	);
}
