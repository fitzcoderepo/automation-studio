# Inventory API Endpoints

## GET /api/inventory/products
Returns serialized Product DTOs:
- id, name, sku, barcode
- productType
- attributes
- vendors

## POST /api/inventory/products
Body:
```
{
  "name": string,
  "categoryCode": string,
  "productType": "MANUFACTURED" | "PURCHASED" | "BOTH",
  "attributes": [{ code, value }]
}
```

Creates product using ProductService:
- Generates SKU + barcode
- Upserts attributes
- Returns DTO

