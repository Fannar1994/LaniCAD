import type { ProductIdentifier } from "@byko/lib-api-rest";



export interface Configuration {
  scaffoldType: ScaffoldType;
  height?: HeightOption; // Optional because Quickly doesn't need height selection
  includeSupportLegs: boolean;
  rentalStartDate: string;
  rentalEndDate: string;
}

export type ScaffoldType = "0,75m" | "1,3m" | "quickly";

export type HeightOption =
  | "2.5"
  | "3.5"
  | "4.5"
  | "5.5"
  | "6.5"
  | "7.5"
  | "8.5"
  | "9.5"
  | "10.5";

export interface ScaffoldTypeConfig {
  id: ScaffoldType;
  name: string;
  description: string;
  width: string;
}

export interface HeightConfig {
  standHeight: string; // Standhæð
  workingHeight: string; // Vinnuhæð
  label: string;
}

export interface RentalPricing {
  "24h": number; // 24 hour rate
  extra: number; // Additional day rate
  week: number; // Weekly rate
  deposit: number; // Deposit/insurance
}

export interface ComponentQuantity {
  itemno: string; // Rental item number (01-PAL-HP01-XXX)
  productId: number; // BYKO internal product ID
  name: string;
  qty: number;
}

export interface ScaffoldProduct extends ProductIdentifier {
  itemno: string;
  name: string;
  // For items with varying quantities based on height
  quantities?: Record<HeightOption, number>;
  // For fixed quantity items (like Quicky components)
  fixedQty?: number;
}

export type ProductType =
  | "frame_b1_2.1m"
  | "frame_b5_1.05m"
  | "floor_board_pb25"
  | "floor_board_pb20"
  | "handrail_h25"
  | "handrail_h20"
  | "diagonal_brace_d25"
  | "adjustable_foot"
  | "wheel_200mm"
  | "adjustable_leg"
  | "support_leg"
  | "quickly_base_unit";
