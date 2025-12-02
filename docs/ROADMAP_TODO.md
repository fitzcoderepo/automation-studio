# Roadmap / TODO
*Last updated: 2025-12-02*

High-level plan for expanding Automation Studio.

## 1. Automations
**Core Enhancements**
- Add PDF parser
- Add XLSX parser
- Add CSV → Inventory importer automation
- Add run detail page (`/automation/runs/[id]`)
- Add `AutomationConfig` for custom prompt templates
- Add automation execution logs (tokens, runtime, model, cost)

**Inventory-integrated Automations**
- Automation: Generate product descriptions from attributes
- Automation: Vendor price list → Update `VendorProduct` (SKU, barcode, cost, active state)
- Automation: Bulk enrichment (add COLOR/SIZE from text blobs)

## 2. Chatbot
**Intelligence / Integration**
- Let chatbot trigger automations (API → `AutomationRun`)
- Auto-title conversations based on context
- Summaries for long threads
- Attach uploaded files to conversation context (persistent per convo)

**Better Storage & UX**
- Add message search
- Allow renaming conversations
- Allow deleting individual messages
- Add “Pinned messages” per conversation

## 3. Inventory System
**Core Models & Services**
- Vendor + `VendorProduct` service layer
- Additional `ProductBarcodeService` (for UPC/EAN external codes)
- Stock system:
  - `StockLevel` model
  - `StockMovement` model
  - `StockService` (adjustment validation, move creation)

**UI**
- Product detail page:
  - Attributes table
  - Vendor mappings
  - All barcodes
  - Stock levels + adjustment modal
- Product search
- `AttributeDefinition` manager (CRUD)

**Advanced**
- Product variations system (e.g., T-Shirt → color-size grid)
- Image upload (product photos)
- Bulk import UI for inventory

## 4. UI/UX (Global)
- Syntax highlighting in automation run output
- Automation run filtering (status/date/type)
- Deep-linking (`?automationId=`)
- Global loading & skeleton states
- Toast notifications (success/error)
- Responsive sidebar
- Global search field
- Dark mode polish (contrast, border consistency)

## 5. Home Dashboard
**Add live stats**
- Count of products
- Count of runs today
- Recent conversations

**Add “Recent activity” feed**
- New product created
- Automation run finished
- File uploaded

**Add quick actions**
- New product
- New automation run
- New chat conversation

## 6. Developer Experience
- Add `docs/` folder linking all markdown documentation
- Add Prettier + ESLint configs
- Add environment schema (Zod or Valibot)
- Add domain layer test suite (Jest / Vitest)
- Add seed script for inventory demo data
- Add script to regenerate OpenAPI or API reference

## 7. Future Ideas
**Automation Platform**
- Automation chaining (multi-step workflows)
- User-created automations with custom schema definitions
- Automation templates marketplace

**Multi-user System**
- Add authentication (Clerk / NextAuth / custom)
- Role-based access control
- Per-user or per-organization data isolation

**Scheduling + Agents**
- Scheduled automations (cron-style)
- Background agents for:
  - Inventory monitoring
  - Price updates
  - File inbox watchers
