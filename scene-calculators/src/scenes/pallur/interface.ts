import type { PaginatedProductListList } from "@byko/lib-api-rest";
import type { ExtraValue, Material, PallarVariation } from "../interface";

export interface Configuration {
  selectedVariationId: number;
  selectedMaterialId: number;
  selectedCylinderSizeId: number;
  selectedWidth: string;
  selectedLength: string;
  showExtraValues: boolean;
}

export interface CalculatedProductListProps {
  config: Configuration;
  products: PaginatedProductListList | undefined;
  selectedMaterial: Material | undefined;
  activeVariation: PallarVariation | undefined;
  activeCylinderSize: ExtraValue | undefined;
}

export type ProductType =
  | "klaedning"
  | "burdur"
  | "dregari"
  | "skrufur"
  | "kambSkrufa"
  | "sankerRight"
  | "sankerLeft"
  | "blikkholkar"
  | "staurafesting"
  | "staurasteypa"
  | "tClips"
  | "endaClips"
  | "clipsMedSkrufum"
  | "bordabolti"
  | "ferkantSkinna"
  | "roHeitgalv";
