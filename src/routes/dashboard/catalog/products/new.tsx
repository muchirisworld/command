import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent, 
    CardFooter 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createProduct } from "@/lib/api-client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/catalog/products/new")({
    component: CreateProductComponent,
});

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string(), // Use string to match defaultValues: ""
    base_unit: z.string().min(1, "Base unit is required (e.g., bottle, unit, case)"),
});

function CreateProductComponent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const createProductMutation = useMutation({
        mutationFn: (data: { name: string; description?: string; base_unit: string }) => 
            createProduct({ data }),
        onSuccess: (product) => {
            toast.success("Product created successfully");
            queryClient.invalidateQueries({ queryKey: ['products'] });
            navigate({ 
                to: "/dashboard/catalog/products/$productId", 
                params: { productId: product.id } 
            });
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to create product");
        },
    });

    const form = useForm({
        defaultValues: {
            name: "",
            description: "",
            base_unit: "",
        },
        validators: {
            onChange: productSchema,
        },
        onSubmit: async ({ value }) => {
            createProductMutation.mutate(value);
        },
    });

    return (
        <div className="p-6 max-w-2xl mx-auto w-full">
            <h1 className="text-3xl font-bold tracking-tight mb-6">New Product</h1>

            <Card>
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form.Field
                            name="name"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Name</Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="e.g. Jack Daniels 1L"
                                    />
                                    {field.state.meta.errors.length > 0 && field.state.meta.isTouched ? (
                                        field.state.meta.errors.map((e, idx) => (
                                            <p key={idx} className="text-xs text-destructive">
                                                {e?.message}
                                            </p>
                                        ))
                                    ) : null}
                                </div>
                            )}
                        />

                        <form.Field
                            name="description"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Description</Label>
                                    <Textarea
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="Optional product description"
                                    />
                                    {field.state.meta.errors.length > 0 && field.state.meta.isTouched ? (
                                        field.state.meta.errors.map((e, idx) => (
                                            <p key={idx} className="text-xs text-destructive">
                                                {e?.message}
                                            </p>
                                        ))
                                    ) : null}
                                </div>
                            )}
                        />

                        <form.Field
                            name="base_unit"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Base Unit</Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="e.g. bottle"
                                    />
                                    <p className="text-xs text-muted-foreground">The smallest unit of measure for this product.</p>
                                    {field.state.meta.errors.length > 0 && field.state.meta.isTouched ? (
                                        field.state.meta.errors.map((e, idx) => (
                                            <p key={idx} className="text-xs text-destructive">
                                                {e?.message}
                                            </p>
                                        ))
                                    ) : null}
                                </div>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                        <Button variant="outline" type="button" onClick={() => window.history.back()}>
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
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
