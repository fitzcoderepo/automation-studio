-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('RAW_MATERIAL', 'SUB_COMPONENT', 'FINISHED_GOOD', 'MAINTENANCE', 'REPAIR', 'OPERATIONS', 'PACKAGING', 'CONSUMABLE', 'TOOLING');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productCategory" "ProductCategory";
