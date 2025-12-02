# Inventory UI

Location:
- `src/app/inventory/page.tsx`
- `src/app/inventory/product-client.tsx`

## Features
- Form to create products
- Color + size attribute shortcuts
- Type selection (MANUFACTURED / PURCHASED / BOTH)
- Products table
- Refresh button

Uses:
- `GET /api/inventory/products`
- `POST /api/inventory/products`

## State
- name, categoryCode
- color, size
- loading, error
- local products list
