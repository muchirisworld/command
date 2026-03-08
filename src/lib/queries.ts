import { queryOptions } from "@tanstack/react-query";
import {
	getConversions,
	getProduct,
	getProducts,
	getVariants,
	getVariantStock,
} from "./api-client";

export const productsQueryOptions = () =>
	queryOptions({
		queryKey: ["products"],
		queryFn: () => getProducts(),
	});

export const productQueryOptions = (productId: string) =>
	queryOptions({
		queryKey: ["products", productId],
		queryFn: () => getProduct({ data: productId }),
	});

export const variantsQueryOptions = (productId: string) =>
	queryOptions({
		queryKey: ["products", productId, "variants"],
		queryFn: () => getVariants({ data: productId }),
	});

export const conversionsQueryOptions = (productId: string) =>
	queryOptions({
		queryKey: ["products", productId, "conversions"],
		queryFn: () => getConversions({ data: productId }),
	});

export const variantStockQueryOptions = (variantId: string) =>
	queryOptions({
		queryKey: ["variants", variantId, "stock"],
		queryFn: () => getVariantStock({ data: variantId }),
	});
