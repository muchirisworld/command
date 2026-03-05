import { ArchiveIcon, ArrowLeft01Icon, Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { archiveProduct, createConversion } from "@/lib/api-client";
import { productQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/catalog/products/$productId")({
	component: ProductDetailComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			productQueryOptions(params.productId),
		);
	},
});

const conversionSchema = z.object({
	unit_from: z.string().min(1, "Unit from is required (e.g., case)"),
	factor: z.number().positive("Factor must be positive"),
	precision: z.number().min(0),
});

function ProductDetailComponent() {
	const { productId } = Route.useParams();
	const { data: product } = useSuspenseQuery(productQueryOptions(productId));
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const archiveMutation = useMutation({
		mutationFn: (id: string) => archiveProduct({ data: id }),
		onSuccess: () => {
			toast.success("Product archived");
			queryClient.invalidateQueries({ queryKey: ["products"] });
			navigate({ to: "/dashboard/catalog/products" });
		},
		onError: () => {
			toast.error("Failed to archive product");
		},
	});

	const conversionMutation = useMutation({
		mutationFn: (data: {
			productId: string;
			unit_from: string;
			factor: number;
			precision: number;
		}) => createConversion({ data }),
		onSuccess: () => {
			toast.success("Conversion rule added");
			queryClient.invalidateQueries({ queryKey: ["products", productId] });
			conversionForm.reset();
		},
		onError: () => {
			toast.error("Failed to add conversion");
		},
	});

	const handleArchive = async () => {
		if (!confirm("Are you sure you want to archive this product?")) return;
		archiveMutation.mutate(product.id);
	};

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
			conversionMutation.mutate({
				productId: product.id,
				...value,
			});
		},
	});

	return (
		<div className="p-6 space-y-6 w-full">
			<div className="flex items-center space-x-2">
				<Button variant="ghost" size="sm">
					<Link to="/dashboard/catalog/products" className="flex items-center">
						<HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
						Back to Products
					</Link>
				</Button>
			</div>

			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
					<div className="flex items-center gap-2 mt-1">
						<Badge
							variant={product.status === "active" ? "default" : "secondary"}
						>
							{product.status}
						</Badge>
						<span className="text-muted-foreground text-sm">
							Base Unit: {product.base_unit}
						</span>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						variant="destructive"
						onClick={handleArchive}
						disabled={product.status === "archived"}
					>
						<HugeiconsIcon icon={ArchiveIcon} className="mr-2 h-4 w-4" />
						Archive
					</Button>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card className="md:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle>Variants</CardTitle>
							<CardDescription>
								Manage SKUs and pricing for this product.
							</CardDescription>
						</div>
						<Button size="sm">
							<Link
								to="/dashboard/catalog/products/$productId/variants/new"
								params={{ productId: product.id }}
								className="flex items-center"
							>
								<HugeiconsIcon icon={Plus} className="mr-2 h-4 w-4" />
								Add Variant
							</Link>
						</Button>
					</CardHeader>
					<CardContent>
						{/* TODO: Implement GET /catalog/products/{id}/variants to list variants here */}
						<div className="bg-muted/50 rounded-lg p-8 text-center">
							<p className="text-muted-foreground text-sm mb-2">
								Variant listing endpoint (GET /catalog/products/{product.id}
								/variants) not yet implemented.
							</p>
							<Button variant="outline" size="sm">
								<Link
									to="/dashboard/catalog/products/$productId/variants/new"
									params={{ productId: product.id }}
								>
									Create First Variant
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Conversions</CardTitle>
							<CardDescription>
								Define unit conversion rules (e.g. 1 Case = 12 Bottles).
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									conversionForm.handleSubmit();
								}}
								className="space-y-4"
							>
								<conversionForm.Field
									name="unit_from"
									children={(field) => (
										<div className="space-y-1">
											<Label htmlFor={field.name} className="text-xs">
												From Unit (e.g. case)
											</Label>
											<Input
												id={field.name}
												// size="sm"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</div>
									)}
								/>
								<conversionForm.Field
									name="factor"
									children={(field) => (
										<div className="space-y-1">
											<Label htmlFor={field.name} className="text-xs">
												Equals X {product.base_unit}
											</Label>
											<Input
												id={field.name}
												type="number"
												// size="sm"
												value={field.state.value}
												onChange={(e) =>
													field.handleChange(Number(e.target.value))
												}
											/>
										</div>
									)}
								/>
								<conversionForm.Subscribe
									selector={(state) => [state.canSubmit, state.isSubmitting]}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											size="sm"
											className="w-full"
											disabled={!canSubmit || isSubmitting}
										>
											Add Conversion
										</Button>
									)}
								/>
							</form>

							<div className="mt-6 border-t pt-4">
								<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
									Active Rules
								</h4>
								<p className="text-xs text-muted-foreground">
									List conversion rules (TODO: Backend endpoint needed).
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
