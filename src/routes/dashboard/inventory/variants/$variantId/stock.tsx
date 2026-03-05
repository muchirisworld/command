import {
	ArrowLeft01Icon,
	Calendar03Icon,
	PackageIcon,
	SentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { getVariantStock, reserveInventory } from "@/lib/api-client";

export const Route = createFileRoute(
	"/dashboard/inventory/variants/$variantId/stock",
)({
	component: VariantStockComponent,
	loader: async ({ params }) => {
		return await getVariantStock({ data: params.variantId });
	},
});

const reserveSchema = z.object({
	quantity: z.number().positive("Quantity must be positive"),
	expires_at: z.string(), // Use string to match defaultValues: ""
});

function VariantStockComponent() {
	const stock = Route.useLoaderData();
	const { variantId } = Route.useParams();

	const reserveForm = useForm({
		defaultValues: {
			quantity: 0,
			expires_at: "",
		},
		validators: {
			onChange: reserveSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await reserveInventory({
					data: {
						variantId,
						...value,
						expires_at: value.expires_at || undefined,
					},
				});
				toast.success("Inventory reserved successfully");
				reserveForm.reset();
				// TODO: Refresh stock data
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to reserve inventory",
				);
			}
		},
	});

	return (
		<div className="p-6 space-y-6 w-full">
			<div className="flex items-center space-x-2">
				<Button variant="ghost" size="sm">
					<Link to="/dashboard/inventory/receive" className="flex items-center">
						<HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
						Back to Receive Stock
					</Link>
				</Button>
			</div>

			<h1 className="text-3xl font-bold tracking-tight">Stock View</h1>
			<p className="text-muted-foreground italic text-sm">
				Variant: {variantId}
			</p>

			<div className="grid gap-6 md:grid-cols-3">
				<Card className="bg-primary/5 border-primary/20">
					<CardHeader className="pb-2">
						<CardDescription className="text-primary font-medium">
							Available Stock
						</CardDescription>
						<CardTitle className="text-4xl">{stock.available_stock}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-xs text-muted-foreground">
							Ready for fulfillment
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Stock</CardDescription>
						<CardTitle className="text-4xl">{stock.total_stock}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-xs text-muted-foreground">On-hand inventory</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Reserved</CardDescription>
						<CardTitle className="text-4xl">{stock.reserved_stock}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-xs text-muted-foreground">
							Allocated to pending orders
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Reserve Inventory</CardTitle>
						<CardDescription>
							Hold stock for a specific purpose or order.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								reserveForm.handleSubmit();
							}}
							className="space-y-4"
						>
							<reserveForm.Field
								name="quantity"
								children={(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Quantity to Reserve</Label>
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
							<reserveForm.Field
								name="expires_at"
								children={(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Expiry (Optional)</Label>
										<div className="relative">
											<HugeiconsIcon
												icon={Calendar03Icon}
												className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
											/>
											<Input
												id={field.name}
												type="date"
												className="pl-8"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</div>
									</div>
								)}
							/>
							<reserveForm.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
								children={([canSubmit, isSubmitting]) => (
									<Button
										type="submit"
										className="w-full"
										disabled={!canSubmit || isSubmitting}
									>
										<HugeiconsIcon icon={SentIcon} className="mr-2 h-4 w-4" />
										{isSubmitting ? "Reserving..." : "Reserve Stock"}
									</Button>
								)}
							/>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Inventory Ledger</CardTitle>
						<CardDescription>Recent stock movements.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="bg-muted rounded-md h-32 flex items-center justify-center">
							<p className="text-xs text-muted-foreground italic">
								TODO: GET /inventory/ledger endpoint not yet available.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
