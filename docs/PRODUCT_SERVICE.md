# ProductService

Location: `src/lib/services/inventory/ProductService.ts`

## Responsibilities
- SKU generation
- Barcode generation (crypto-based)
- Attribute upsert (inside transaction)
- Product creation
- Listing and fetching products

## Key Mechanics

### SKU Generation
Based on:
- categoryCode
- name
- attributes (COLOR, SIZE)
Ensures uniqueness via incremental suffix.

### Barcode Generation
Uses crypto(UUID) → internal unique ID:
```
I + <10-char token>
```

### Attribute Upsert
Accepts the Prisma TransactionClient (`tx`) to avoid FK violations.

### Create Product Flow
1. Validate input
2. Generate SKU + barcode
3. Transaction:
   - Create product
   - Upsert attributes
   - Return full product with relations
4. Returns Product domain object

