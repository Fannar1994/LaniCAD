import type { ProductList } from "@byko/lib-api-rest";
import type { PriceItem } from "@byko/lib-api-price";

export interface ProductSelection {
  variantId: number;
  quantity: number;
  variantSku: string;
}

export interface Prices {
  [sku: string]: PriceItem;
}

export interface ProductListItem {
  key?: number;
  variantSku: string;
  item: ProductList;
  quantity: number;
}

export interface ProductLineProps {
  product: ProductList;
  variantSku: string | undefined;
  variantPrice: PriceItem | undefined;
  quantity: number;
  handleAddToSelectionList: (product: ProductSelection) => void;
  handleRemoveFromSelectionList: (variantId: number) => void;
}

export interface ProductListBlockProps {
  products: ProductListItem[];
  loading: boolean;
  loadingCart: boolean;
  prices: Prices;
  handleAddToSelectionList: (product: ProductSelection) => void;
  handleRemoveFromSelectionList: (variantId: number) => void;
  handleAddSelectionToCart: () => void;
  selectedProducts: ProductSelection[];
}
