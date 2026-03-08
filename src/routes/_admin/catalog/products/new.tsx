import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/catalog/products/new")({
	component: NewProductPage,
});

const productSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().min(1, "Description is required"),
	base_unit: z.string().min(1, "Base unit is required"),
});

function NewProductPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof productSchema>) => {
			return createProduct({ data });
		},
		onSuccess: (data) => {
			toast.success("Product created successfully");
			queryClient.invalidateQueries({ queryKey: ["products"] });
			navigate({
				to: "/catalog/products/$productId",
				params: { productId: data.id },
			});
		},
		onError: (error) => {
			toast.error(`Failed to create product: ${error.message}`);
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			base_unit: "EA",
		},
		validators: {
			onChange: productSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
		},
	});

	return (
		<div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
				<p className="text-muted-foreground">
					Add a new product to your catalog.
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				<form.Field
					name="name"
					validators={{ onChange: productSchema.shape.name }}
					children={(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Name</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="e.g. Premium Coffee Beans"
							/>
							{field.state.meta.errors.length > 0 &&
							field.state.meta.isTouched
								? field.state.meta.errors.map((e, idx) => (
										<p key={idx} className="text-xs text-destructive">
											{e?.message}
										</p>
									))
								: null}
						</div>
					)}
				/>

				<form.Field
					name="base_unit"
					validators={{ onChange: productSchema.shape.base_unit }}
					children={(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Base Unit</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="e.g. EA, KG, L"
							/>
							{field.state.meta.errors.length > 0 &&
							field.state.meta.isTouched
								? field.state.meta.errors.map((e, idx) => (
										<p key={idx} className="text-xs text-destructive">
											{e?.message}
										</p>
									))
								: null}
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
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Optional description"
								rows={4}
							/>
							{field.state.meta.errors.length > 0 &&
							field.state.meta.isTouched
								? field.state.meta.errors.map((e, idx) => (
										<p key={idx} className="text-xs text-destructive">
											{e?.message}
										</p>
									))
								: null}
						</div>
					)}
				/>

				<div className="flex justify-end gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/catalog/products" })}
					>
						Cancel
					</Button>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => (
							<Button type="submit" disabled={!canSubmit || isSubmitting}>
								{isSubmitting ? "Creating..." : "Create Product"}
							</Button>
						)}
					/>
				</div>
			</form>
		</div>
	);
}
