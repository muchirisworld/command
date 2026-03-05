export interface Product {
	id: string;
	organization_id: string;
	name: string;
	description?: string;
	base_unit: string;
	status: "active" | "archived";
	created_at: string;
	updated_at: string;
}

export interface Variant {
	id: string;
	product_id: string;
	sku: string;
	barcode?: string;
	price: number;
	cost?: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface UnitConversion {
	id: string;
	product_id: string;
	unit_from: string;
	unit_to: string;
	factor: number;
	precision: number;
}

export interface StockSummary {
	variant_id: string;
	total_stock: number;
	reserved_stock: number;
	available_stock: number;
}

export interface InventoryReceipt {
	quantity: number;
	unit: string;
	source_type: string;
	note?: string;
}

export interface InventoryReservation {
	quantity: number;
	expires_at?: string;
}
