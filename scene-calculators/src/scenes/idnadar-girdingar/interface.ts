import type { PaginatedProductListList } from "@byko/lib-api-rest";

export interface Configuration {
  selectedFenceTypeId: number;
  selectedHeightId: number;
  selectedThicknessId: number;
  selectedStoneTypeId: number;
  totalMeters: string;
  startDate: string;
  endDate: string;
}

export interface CalculatedProductListProps {
  config: Configuration;
  products: PaginatedProductListList | undefined;
  selectedFenceType: FenceType | undefined;
  selectedHeight: HeightOption | undefined;
  selectedThickness: ThicknessOption | undefined;
  selectedStoneType: StoneType | undefined;
  rentalDays: number;
}

export interface FenceType {
  id: number;
  label: string;
  value: "worksite" | "crowd" | "traffic";
  unitLength: number;
}

export interface HeightOption {
  id: number;
  label: string;
  value: number;
}

export interface ThicknessOption {
  id: number;
  label: string;
  value: number;
}

export interface StoneType {
  id: number;
  vnr: string;
  productId: number;
  label: string;
  value: string;
}

export type ProductType =
  | "fence_panel"
  | "stones"
  | "clamps"
  | "crowd_barrier"
  | "traffic_barrier_red"
  | "traffic_barrier_white";
