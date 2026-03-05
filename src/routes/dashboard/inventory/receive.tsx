import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getProducts, receiveInventory } from "@/lib/api-client";

export const Route = createFileRoute("/dashboard/inventory/receive")({
	component: ReceiveInventoryComponent,
	loader: async () => {
		return await getProducts();
	},
});

const receiveSchema = z.object({
	productId: z.string().min(1, "Product is required"),
	variantId: z.string().min(1, "Variant is required (Use SKU/ID)"),
	quantity: z.number().positive("Quantity must be positive"),
	unit: z.string().min(1, "Unit is required"),
	note: z.string(), // Use string to match defaultValues: ""
});

function ReceiveInventoryComponent() {
	const products = Route.useLoaderData();
	const navigate = useNavigate();
	const [selectedProductId, setSelectedProductId] = useState<string>("");

	const selectedProduct = useMemo(
		() => products.find((p) => p.id === selectedProductId),
		[products, selectedProductId],
	);

	const form = useForm({
		defaultValues: {
			productId: "",
			variantId: "",
			quantity: 0,
			unit: "",
			note: "",
		},
		validators: {
			onChange: receiveSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const { productId, ...receiptData } = value;
				await receiveInventory({
					data: {
						...receiptData,
						source_type: "receipt",
						note: receiptData.note || undefined,
					},
				});
				toast.success("Inventory received successfully");
				navigate({
					to: "/dashboard/inventory/variants/$variantId/stock",
					params: { variantId: value.variantId },
				});
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to receive inventory",
				);
			}
		},
	});

	return (
		<div className="p-6 max-w-2xl mx-auto w-full">
			<h1 className="text-3xl font-bold tracking-tight mb-2">Receive Stock</h1>
			<p className="text-muted-foreground mb-6">Inbound inventory workflow.</p>

			<Card>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<CardHeader>
						<CardTitle>Receipt Details</CardTitle>
						<CardDescription>
							Enter the details of the incoming stock.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<form.Field
							name="productId"
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Product</Label>
									<Select
										value={field.state.value}
										onValueChange={(val) => {
											field.handleChange(val);
											setSelectedProductId(val);
											// Auto-set unit to base_unit if available
											const p = products.find((x) => x.id === val);
											if (p) form.setFieldValue("unit", p.base_unit);
										}}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a product" />
										</SelectTrigger>
										<SelectContent>
											{products.map((p) => (
												<SelectItem key={p.id} value={p.id}>
													{p.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						/>

						<form.Field
							name="variantId"
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Variant ID / SKU</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter variant ID or SKU"
									/>
									<p className="text-[10px] text-muted-foreground italic">
										TODO: Replace with searchable variant list when GET
										/catalog/products/{"{id}"}/variants is available.
									</p>
								</div>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<form.Field
								name="quantity"
								children={(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Quantity</Label>
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
								name="unit"
								children={(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Unit</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder={selectedProduct?.base_unit || "unit/case"}
										/>
										<p className="text-[10px] text-muted-foreground">
											Defaults to base unit (
											{selectedProduct?.base_unit || "..."}). Use "case" if
											conversion exists.
										</p>
									</div>
								)}
							/>
						</div>

						<form.Field
							name="note"
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Note (Optional)</Label>
									<Textarea
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Reason for receipt, source, etc."
									/>
								</div>
							)}
						/>
					</CardContent>
					<CardFooter className="flex justify-end space-x-2 border-t pt-4">
						<Button
							variant="outline"
							type="button"
							onClick={() => window.history.back()}
						>
							Cancel
						</Button>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? "Processing..." : "Receive Stock"}
								</Button>
							)}
						/>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
