# Integration Notes

## API Endpoints Used

All protected routes assume an implicitly attached session/token and target the `/api` prefix, passing `X-Organization-ID` based on current authentication.

### 1. Catalog Routes

#### Create Product
- **Endpoint**: `POST /api/catalog/products`
- **Request Shape**:
  ```json
  {
    "name": "string",
    "description": "string",
    "base_unit": "string"
  }
  ```
- **Response Shape**:
  ```json
  {
    "id": "uuid",
    "organization_id": "string",
    "name": "string",
    "description": "string",
    "base_unit": "string",
    "status": "active | archived",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

#### List Products
- **Endpoint**: `GET /api/catalog/products`
- **Response Shape**: `Array<Product>`

#### Get Product
- **Endpoint**: `GET /api/catalog/products/{productID}`
- **Response Shape**: `Product`

#### Archive Product
- **Endpoint**: `POST /api/catalog/products/{productID}/archive`
- **Response Shape**: `void` (204 No Content)

#### Create Variant
- **Endpoint**: `POST /api/catalog/products/{productID}/variants`
- **Request Shape**:
  ```json
  {
    "sku": "string",
    "barcode": "string",
    "price": 0.0,
    "cost": 0.0,
    "is_active": true
  }
  ```
- **Response Shape**:
  ```json
  {
    "id": "uuid",
    "organization_id": "string",
    "product_id": "uuid",
    "sku": "string",
    "barcode": "string",
    "price": 0.0,
    "cost": 0.0,
    "is_active": true,
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

#### List Variants
- **Endpoint**: `GET /api/catalog/products/{productID}/variants`
- **Response Shape**: `Array<Variant>`

### 2. Inventory Routes

#### Upsert/Create Conversion
- **Endpoint**: `POST /api/inventory/products/{productID}/conversions`
- **Request Shape**:
  ```json
  {
    "unit_from": "string",
    "unit_to": "string",
    "factor": 0.0,
    "precision": 0
  }
  ```
- **Response Shape**: `UnitConversion`

#### List Conversions
- **Endpoint**: `GET /api/inventory/products/{productID}/conversions`
- **Response Shape**: `Array<UnitConversion>`

#### Create Inventory Receipt
- **Endpoint**: `POST /api/inventory/variants/{variantID}/receipt`
- **Request Shape**:
  ```json
  {
    "quantity": 0,
    "unit": "string",
    "source_id": "uuid",
    "note": "string"
  }
  ```
- **Response Shape**: `void` (204 No Content)

#### Get Variant Stock
- **Endpoint**: `GET /api/inventory/variants/{variantID}/stock`
- **Response Shape**:
  ```json
  {
    "total_stock": 0,
    "reserved_stock": 0,
    "available_stock": 0
  }
  ```

## UI Implementations

- **Tables**: Utilizing Shadcn `Table` components with TanStack Query's suspense loading.
- **Form validation**: Powered by `@tanstack/react-form` and `@tanstack/zod-form-adapter`.
- **Command Palette**: Search interface mapping directly to the `GET /api/catalog/products` results, rendering matching products to skip directly to product details.
- **Architecture**: A file-based routing setup within TanStack Start with route loaders to parallel fetch data elements for fast rendering, avoiding cascading network request waterfalls.