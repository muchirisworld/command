import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/server/auth/auth";
import type {
	InventoryReceipt,
	InventoryReservation,
	Product,
	StockSummary,
	UnitConversion,
	Variant,
} from "./types";

const backendUrl = process.env.BACKEND_URL;

async function requireOrgId(): Promise<string> {
	const { orgId } = await requireAuth();
	if (!orgId) throw new Error("Organization context required");
	return orgId;
}

async function fetchTerminal<T>(
	endpoint: string,
	options: {
		method?: "GET" | "POST" | "PATCH" | "DELETE";
		body?: unknown;
		headers?: HeadersInit;
	} = {},
	orgId: string,
): Promise<T> {
	const { getToken } = await auth();
	const token = await getToken();
	if (!token) throw new Error("Authentication token not available");

	const url = `${backendUrl}${endpoint}`;
	const { method = "GET", body, headers: customHeaders } = options;

	const headers = new Headers(customHeaders);
	headers.set("X-Organization-ID", orgId);
	headers.set("Authorization", `Bearer ${token}`);
	headers.set("Content-Type", "application/json");

	const response = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ message: "Unknown error" }));
		throw new Error(error.message || `API error: ${response.statusText}`);
	}

	if (response.status === 204) {
		return {} as T;
	}

	return response.json();
}

// Products
export const getProducts = createServerFn({ method: "GET" })
	.middleware([])
	.handler(async () => {
		const orgId = await requireOrgId();
		return fetchTerminal<Product[]>("/catalog/products", {}, orgId);
	});

export const getProduct = createServerFn({ method: "GET" })
	.inputValidator((productId: string) => productId)
	.handler(async ({ data: productId }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<Product>(`/catalog/products/${productId}`, {}, orgId);
	});

export const createProduct = createServerFn({ method: "POST" })
	.inputValidator(
		(data: { name: string; description?: string; base_unit: string }) => data,
	)
	.handler(async ({ data }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<Product>(
			"/catalog/products",
			{
				method: "POST",
				body: data,
			},
			orgId,
		);
	});

export const archiveProduct = createServerFn({ method: "POST" })
	.inputValidator((productId: string) => productId)
	.handler(async ({ data: productId }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<void>(
			`/catalog/products/${productId}/archive`,
			{
				method: "POST",
			},
			orgId,
		);
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.inputValidator((productId: string) => productId)
	.handler(async ({ data: productId }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<void>(
			`/catalog/products/${productId}`,
			{
				method: "DELETE",
			},
			orgId,
		);
	});

export const updateProduct = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			id: string;
			name?: string;
			description?: string;
			status?: "active" | "archived";
		}) => data,
	)
	.handler(async ({ data: { id, ...updates } }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<Product>(
			`/catalog/products/${id}`,
			{
				method: "PATCH",
				body: updates,
			},
			orgId,
		);
	});

// Variants
export const createVariant = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			productId: string;
			sku: string;
			barcode?: string;
			price: number;
			cost?: number;
			is_active?: boolean;
		}) => data,
	)
	.handler(async ({ data }) => {
		const orgId = await requireOrgId();
		const { productId, ...variantData } = data;
		return fetchTerminal<Variant>(
			`/catalog/products/${productId}/variants`,
			{
				method: "POST",
				body: variantData,
			},
			orgId,
		);
	});

export const getVariants = createServerFn({ method: "GET" })
	.inputValidator((productId: string) => productId)
	.handler(async ({ data: productId }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<Variant[]>(
			`/catalog/products/${productId}/variants`,
			{},
			orgId,
		);
	});

export const deleteVariant = createServerFn({ method: "POST" })
	.inputValidator((variantId: string) => variantId)
	.handler(async ({ data: variantId }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<void>(
			`/catalog/variants/${variantId}`,
			{
				method: "DELETE",
			},
			orgId,
		);
	});

export const updateVariant = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			id: string;
			sku?: string;
			barcode?: string;
			price?: number;
			cost?: number;
			is_active?: boolean;
		}) => data,
	)
	.handler(async ({ data: { id, ...updates } }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<Variant>(
			`/catalog/variants/${id}`,
			{
				method: "PATCH",
				body: updates,
			},
			orgId,
		);
	});

// Inventory
export const getConversions = createServerFn({ method: "GET" })
	.inputValidator((productId: string) => productId)
	.handler(async ({ data: productId }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<UnitConversion[]>(
			`/inventory/products/${productId}/conversions`,
			{},
			orgId,
		);
	});

export const deleteConversion = createServerFn({ method: "POST" })
	.inputValidator((conversionId: string) => conversionId)
	.handler(async ({ data: conversionId }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<void>(
			`/inventory/conversions/${conversionId}`,
			{
				method: "DELETE",
			},
			orgId,
		);
	});

export const createConversion = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			productId: string;
			unit_from: string;
			factor: number;
			precision: number;
		}) => data,
	)
	.handler(async ({ data }) => {
		const orgId = await requireOrgId();
		const { productId, ...conversionData } = data;
		return fetchTerminal<UnitConversion>(
			`/inventory/products/${productId}/conversions`,
			{
				method: "POST",
				body: conversionData,
			},
			orgId,
		);
	});

export const receiveInventory = createServerFn({ method: "POST" })
	.inputValidator((data: { variantId: string } & InventoryReceipt) => data)
	.handler(async ({ data }) => {
		const orgId = await requireOrgId();
		const { variantId, ...receiptData } = data;
		return fetchTerminal<void>(
			`/inventory/variants/${variantId}/receipt`,
			{
				method: "POST",
				body: receiptData,
			},
			orgId,
		);
	});

export const reserveInventory = createServerFn({ method: "POST" })
	.inputValidator((data: { variantId: string } & InventoryReservation) => data)
	.handler(async ({ data }) => {
		const orgId = await requireOrgId();
		const { variantId, ...reservationData } = data;
		return fetchTerminal<void>(
			`/inventory/variants/${variantId}/reserve`,
			{
				method: "POST",
				body: reservationData,
			},
			orgId,
		);
	});

export const getVariantStock = createServerFn({ method: "GET" })
	.inputValidator((variantId: string) => variantId)
	.handler(async ({ data: variantId }) => {
		const orgId = await requireOrgId();
		return fetchTerminal<StockSummary>(
			`/inventory/variants/${variantId}/stock`,
			{},
			orgId,
		);
	});
