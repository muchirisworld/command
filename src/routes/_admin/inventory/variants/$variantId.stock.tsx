import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { variantStockQueryOptions } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute(
	"/_admin/inventory/variants/$variantId/stock",
)({
	loader: ({ context: { queryClient }, params: { variantId } }) => {
		return queryClient.ensureQueryData(variantStockQueryOptions(variantId));
	},
	component: StockPage,
});

function StockPage() {
	const { variantId } = Route.useParams();
	const { data: stock } = useSuspenseQuery(variantStockQueryOptions(variantId));

	return (
		<div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Stock Levels</h1>
				<p className="text-muted-foreground">
					Current inventory status for variant <Badge className="ml-2" variant="outline">{variantId}</Badge>
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Stock</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stock.total_stock}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Physical units on hand
						</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Reserved</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-amber-600">{stock.reserved_stock}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Allocated to orders
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Available</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{stock.available_stock}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Free to promise
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
