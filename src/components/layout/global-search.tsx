import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { productsQueryOptions } from "@/lib/queries";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";

export function GlobalSearch() {
	const [open, setOpen] = React.useState(false);
	const router = useRouter();

	const { data: products } = useQuery({
		...productsQueryOptions(),
		enabled: open, // Only fetch when palette is open
	});

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 border rounded-md hover:bg-muted/80 transition-colors w-full max-w-sm"
			>
				<span className="flex-1 text-left">Search products...</span>
				<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
					<span className="text-xs">⌘</span>K
				</kbd>
			</button>

			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Type a product name..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Products">
						{products?.map((product) => (
							<CommandItem
								key={product.id}
								value={product.name}
								onSelect={() => {
									setOpen(false);
									router.navigate({
										to: "/catalog/products/$productId",
										params: { productId: product.id },
									});
								}}
							>
								<span>{product.name}</span>
								<span className="ml-auto text-xs text-muted-foreground">
									{product.base_unit}
								</span>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}
