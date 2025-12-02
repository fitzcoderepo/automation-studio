# Inventory Domain Layer

## Product Domain Model

Located at: `src/lib/domain/inventory/Product.ts`

### Responsibilities
- Wraps Prisma product records into a rich domain object.
- Provides business logic:
  - `isManufactured()`
  - `isPurchased()`
  - `label()`
  - Attribute lookups
  - Stock adjustment validation
- Provides `.toDTO()` for frontend-safe serialization.

### RawProduct Shape
Includes:
- ProductRecord
- Attributes with AttributeDefinition
- Barcodes
- VendorProducts

### Notes
- Uses explicit getter return types to avoid implicit-any issues.
- All domain logic stays out of controllers and UI.
