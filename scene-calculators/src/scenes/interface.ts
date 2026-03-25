import type { PriceItem } from "@byko/lib-api-price";

export interface Prices {
  [sku: string]: PriceItem;
}
export interface SortingOption {
  label: string;
  value: string;
  active?: boolean;
  id: number;
}

export interface PallarVariation {
  id: number;
  label: string;
  value: "langsum" | "thversum";
  image: string;
}

export interface GirdingVariation {
  id: number;
  label: string;
  value: "lodrett-milli-staura" | "larett-milli-staura" | "larett-yfir-staura";
  image: string;
}

export type MaterialType = "wood" | "plastic" | "thermowood";

export interface Material {
  id: number;
  vnr: string;
  productId: number;
  label: string;
  value: string;
  materialType?: MaterialType;
  materialWidth?: number;
  materialLengthInMeters?: number;
  variantId?: string;
}

export interface Cladding {
  id: number;
  label: string;
  value: string;
}

export interface Stakes {
  label: string;
  value: number;
}

export interface Width {
  label: string;
  value: number;
}

export interface Height {
  label: string;
  value: number;
  maxValue?: number;
}

export interface ExtraValue {
  id: number;
  label: string;
  value: string;
}

export interface ShowExtraValues {
  label: string;
  value: boolean;
}
