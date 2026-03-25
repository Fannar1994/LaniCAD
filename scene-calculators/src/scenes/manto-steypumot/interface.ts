/**
 * Manto Formwork Calculator TypeScript Interfaces
 * Based on Manto steypumót (wall formwork) rental system
 */

import type { PaginatedProductListList } from "@byko/lib-api-rest";

export interface Configuration {
  totalSquareMeters: string;
  formworkHeight: string; // Height of formwork in meters
  rentalStartDate: string;
  rentalEndDate: string;
}

export interface CalculatedProductListProps {
  config: Configuration;
  products: PaginatedProductListList | undefined;
  rentalDays: number;
}

export interface MantoProduct {
  rentalCode: string; // e.g., "01-MÓT-KM01-996"
  externalCode: string; // e.g., "HM453996"
  name: string; // e.g., "Flekar 240x300"
  weight: number; // kg per unit
  area: number; // m² per unit
  dailyRentalPrice: number; // Daily rental price with VAT
  category: ProductCategory;
}

export type ProductCategory = 
  | "base_units" // Grunneiningar - panels, corners
  | "connectors" // Samtengihlutir - clamps, ties, walers
  | "accessories"; // Aukahlutir - braces, scaffolding brackets, etc.

export type ProductType =
  // Base units (Grunneiningar)
  | "panel_240x300"
  | "panel_120x300"
  | "panel_105x300"
  | "panel_90x300"
  | "panel_75x300"
  | "panel_70x300"
  | "panel_60x300"
  | "panel_55x300"
  | "panel_45x300"
  | "panel_30x300"
  | "inner_corner_35_300"
  | "swing_corner_35_300"
  | "panel_75x120"
  | "panel_90x120"
  | "panel_60x120"
  | "panel_70x120"
  | "panel_120x120"
  | "inner_corner_35x120"
  | "corner_adjuster_5x300"
  // Connectors (Samtengihlutir)
  | "straight_clamp"
  | "outer_corner_clamp"
  | "adjustable_straight_clamp"
  | "panel_clamp"
  | "formwork_tie_dw15"
  | "tie_rod_75cm"
  | "tie_rod_100cm"
  | "tie_rod_175cm"
  | "manto_tie_dw15"
  | "waler_130x230"
  // Accessories (Aukahlutir)
  | "waler_tie_long_50cm"
  | "waler_100cm"
  | "waler_tie_30cm"
  | "corner_waler_170"
  | "working_platform_bracket"
  | "tk_handrail_post"
  | "large_brace_fastener"
  | "hook_fastener"
  | "italian_brace"
  | "simple_brace"
  | "end_stop_mr"
  | "crane_hook"
  | "scroll"
  | "fish_box"
  | "hex_rod"
  | "base_shoe"
  | "inner_wall_shoe";

/**
 * Panel type with parsed dimensions for geometric calculation
 */
export type PanelType = {
  code: string; // e.g., "panel_240x300" or rental code
  widthM: number; // Panel width in meters (e.g., 2.4)
  heightM: number; // Panel height in meters (e.g., 3.0)
  areaM2: number; // Panel area in square meters (e.g., 7.2)
};

/**
 * Wall input for geometric panel calculation
 */
export type WallInput = {
  id: string; // Wall identifier (e.g., "wall-1", "wall-2")
  lengthM: number; // Wall length in meters
  heightM: number; // Wall height in meters
  doubleSided: boolean; // True if formwork needed on both sides
};

/**
 * Panel usage per face (before multiplying by sides)
 */
export type FacePanelUsage = {
  panelCode: string; // Panel identifier (matches PanelType.code)
  countPerFace: number; // Number of panels needed for ONE face
};

/**
 * Complete wall panel calculation result
 */
export type WallPanelResult = {
  wallId: string; // Matches WallInput.id
  perFace: FacePanelUsage[]; // Panel counts for one face
  totalForProject: FacePanelUsage[]; // Panel counts multiplied by sides (1 or 2)
};
