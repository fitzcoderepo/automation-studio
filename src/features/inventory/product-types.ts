export type ProductAttributeDTO = { id: number; code: string; name: string; value: string };

export type ProductTagDTO = { id: number; name: string; color: string };

export type ProductVendorDTO = {
  id: number;
  vendorId: number;
  vendorSku: string | null;
  vendorBarcode: string | null;
  active: boolean;
};

export type ProductDTO = {
  id: number;
  name: string;
  sku: string;
  productType: string;
  productCategory: string;
  sellable: boolean;
  uom: string | null;
  onHand: number;
  barcode: string;
  dateCreated: string;
  dateUpdated: string;
  isManufactured: boolean;
  isPurchased: boolean;
  label: string;
  attributes: ProductAttributeDTO[];
  tags: ProductTagDTO[];
  vendors: ProductVendorDTO[];
};

export type TagOption = Pick<ProductTagDTO, "name" | "color">;
