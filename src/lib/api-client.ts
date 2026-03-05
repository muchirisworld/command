import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/server/auth/auth";
import type { 
    Product, 
    Variant, 
    UnitConversion, 
    StockSummary, 
    InventoryReceipt, 
    InventoryReservation 
} from "./types";
import { auth } from "@clerk/tanstack-react-start/server";

const backendUrl = process.env.BACKEND_URL

async function fetchTerminal<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    orgId: string
): Promise<T> {
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) throw new Error("Authentication token not available");
    
    const url = `${backendUrl}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set("X-Organization-ID", orgId);

    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
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
        const { orgId } = await requireAuth();
        if (!orgId) throw new Error("Organization context required");
        return fetchTerminal<Product[]>("/catalog/products", {}, orgId);
    });

export const getProduct = createServerFn({ method: "GET" })
    .inputValidator((productId: string) => productId)
    .handler(async ({ data: productId }) => {
        const { orgId } = await requireAuth();
        if (!orgId) throw new Error("Organization context required");
        return fetchTerminal<Product>(`/catalog/products/${productId}`, {}, orgId);
    });

export const createProduct = createServerFn({ method: "POST" })
    .inputValidator((data: { name: string; description?: string; base_unit: string }) => data)
    .handler(async ({ data }) => {
        const { orgId } = await requireAuth();
        if (!orgId) throw new Error("Organization context required");
        return fetchTerminal<Product>("/catalog/products", {
            method: "POST",
            body: JSON.stringify(data),
        }, orgId);
    });

export const archiveProduct = createServerFn({ method: "POST" })
    .inputValidator((productId: string) => productId)
    .handler(async ({ data: productId }) => {
        const { orgId } = await requireAuth();
        if (!orgId) throw new Error("Organization context required");
        return fetchTerminal<void>(`/catalog/products/${productId}/archive`, {
            method: "POST",
        }, orgId);
    });

// Variants
export const createVariant = createServerFn({ method: "POST" })
    .inputValidator((data: { productId: string; sku: string; barcode?: string; price: number; cost?: number; is_active?: boolean }) => data)
    .handler(async ({ data }) => {
        const { orgId } = await requireAuth();
        if (!orgId) throw new Error("Organization context required");
        const { productId, ...variantData } = data;
        return fetchTerminal<Variant>(`/catalog/products/${productId}/variants`, {
            method: "POST",
            body: JSON.stringify(variantData),
        }, orgId);
    });

// Missing: GET /catalog/products/{id}/variants - UI will have TODO for this as per requirement

// Inventory
export const createConversion = createServerFn({ method: "POST" })
    .inputValidator((data: { productId: string; unit_from: string; factor: number; precision: number }) => data)
    .handler(async ({ data }) => {
        const { orgId } = await requireAuth();
        if (!orgId) throw new Error("Organization context required");
        const { productId, ...conversionData } = data;
        return fetchTerminal<UnitConversion>(`/inventory/products/${productId}/conversions`, {
            method: "POST",
            body: JSON.stringify(conversionData),
        }, orgId);
    });

export const receiveInventory = createServerFn({ method: "POST" })
    .inputValidator((data: { variantId: string } & InventoryReceipt) => data)
    .handler(async ({ data }) => {
        const { orgId } = await requireAuth();
        if (!orgId) throw new Error("Organization context required");
        const { variantId, ...receiptData } = data;
        return fetchTerminal<void>(`/inventory/variants/${variantId}/receipt`, {
            method: "POST",
            body: JSON.stringify(receiptData),
        }, orgId);
    });

export const reserveInventory = createServerFn({ method: "POST" })
    .inputValidator((data: { variantId: string } & InventoryReservation) => data)
    .handler(async ({ data }) => {
        const { orgId } = await requireAuth();
        if (!orgId) throw new Error("Organization context required");
        const { variantId, ...reservationData } = data;
        return fetchTerminal<void>(`/inventory/variants/${variantId}/reserve`, {
            method: "POST",
            body: JSON.stringify(reservationData),
        }, orgId);
    });

export const getVariantStock = createServerFn({ method: "GET" })
    .inputValidator((variantId: string) => variantId)
    .handler(async ({ data: variantId }) => {
        const { orgId } = await requireAuth();
        if (!orgId) throw new Error("Organization context required");
        return fetchTerminal<StockSummary>(`/inventory/variants/${variantId}/stock`, {}, orgId);
    });
