// Rental calculator interfaces for fence and scaffold rentals

export type RentalType = "fence-rental" | "scaffold-rental";

export type FenceType = "worksite" | "crowd" | "traffic";
export type ScaffoldType = "narrow" | "wide" | "quicky";

// Pricing tier based on rental duration
export type PricingTier = "1-30" | "30-60" | "60-90" | "90-120" | "120+";

// API response interfaces
export interface InriverProduct {
  sku: string;
  name: string;
  price?: number;
  dailyRate?: number;
  vat?: number;
}

export interface InriverPriceResponse {
  value: Array<{
    Itemno: string;
    DailyRate: number;
  }>;
}

export interface RentalPricingResult {
  rate: number;
  source: "api" | "fallback";
  breakdown?: {
    dailyRate: number;
    days: number;
    tier: PricingTier;
  };
}

// Fence rental configuration
export interface FenceRentalConfig {
  fenceType: FenceType;
  height?: "1.2" | "2.0";
  thickness?: "1.1" | "1.7";
  stoneType?: string;
  totalMeters: number;
  startDate: string;
  endDate: string;
}

export interface FenceItemPricing {
  sku: string;
  name: string;
  pricing: Record<PricingTier, number>;
  unitLength: number;
}

// Scaffold rental configuration
export interface ScaffoldRentalConfig {
  scaffoldType: ScaffoldType;
  height?: string; // "2.5", "3.5", "4.5", etc.
  supportLegs: boolean;
  startDate: string;
  endDate: string;
}

export interface ScaffoldPricingTier {
  "24h": number;
  extra: number; // Per extra day (days 2-6)
  week: number;
  deposit: number;
}

export interface ScaffoldMaterialItem {
  itemno: string;
  name: string;
  qty: number;
}

// Shared rental calculator props
export interface RentalCalculatorProps {
  type: RentalType;
}

export interface RentalResultDisplay {
  totalCost: number;
  dailyRate?: number;
  days: number;
  deposit?: number;
  materials?: ScaffoldMaterialItem[];
  source: "api" | "fallback";
  warning?: string;
}
