/**
 * Loftastoðir (Shoring Props) Calculator - Configuration Data
 * 
 * Contains all product data and configuration options for the calculator.
 * Data sourced from BYKO rental catalog.
 */

import type { Loftastod, ThicknessOption, SpacingOption } from "./interface";

/**
 * Available loftastoðir (shoring props) for rental
 * 
 * Each prop has different load capacities and height ranges.
 * Galvanized (Galv) props generally have higher load capacity.
 * HPE series are heavy-duty props for higher loads.
 */
export const loftastodir: Loftastod[] = [
  {
    id: "01-MÓT-LM51-026",
    articleNumber: "97100026",
    name: "Loftastoðir 2–3,5 m (Málað)",
    minHeight_m: 2.0,
    maxHeight_m: 3.5,
    maxLoad_kN: 18,
    dayRate: 16,
    weekRate: 112,
    weight_kg: 10.26,
  },
  {
    id: "01-MÓT-LM51-027",
    articleNumber: "97100027",
    name: "Loftastoðir 1,6–3,0 m (Málað)",
    minHeight_m: 1.6,
    maxHeight_m: 3.0,
    maxLoad_kN: 18,
    dayRate: 16,
    weekRate: 112,
    weight_kg: 9.75,
  },
  {
    id: "01-MÓT-LM51-028",
    articleNumber: "97100028",
    name: "Loftastoðir 2–3,5 m (Galv)",
    minHeight_m: 2.0,
    maxHeight_m: 3.5,
    maxLoad_kN: 20,
    dayRate: 20,
    weekRate: 140,
    weight_kg: 11,
  },
  {
    id: "01-MÓT-LM51-029",
    articleNumber: "97100029",
    name: "Loftastoðir 1,6–2,9 m (Galv)",
    minHeight_m: 1.6,
    maxHeight_m: 2.9,
    maxLoad_kN: 20,
    dayRate: 20,
    weekRate: 140,
    weight_kg: 11,
  },
  {
    id: "01-MÓT-LM51-031",
    articleNumber: "97100031",
    name: "Loftastoðir B30 178/300 HPE",
    minHeight_m: 1.78,
    maxHeight_m: 3.0,
    maxLoad_kN: 30,
    dayRate: 28,
    weekRate: 196,
    weight_kg: 16.8,
  },
  {
    id: "01-MÓT-LM51-032",
    articleNumber: "97100032",
    name: "Loftastoðir B35 200/350 HPE",
    minHeight_m: 2.0,
    maxHeight_m: 3.5,
    maxLoad_kN: 35,
    dayRate: 28,
    weekRate: 196,
    weight_kg: 17.4,
  },
];

/**
 * Concrete thickness options in centimeters
 * Common slab thicknesses for residential and commercial construction
 */
export const thicknessOptions: ThicknessOption[] = [
  { id: 0, label: "15 cm", value: 15 },
  { id: 1, label: "18 cm", value: 18 },
  { id: 2, label: "20 cm", value: 20 },
  { id: 3, label: "22 cm", value: 22 },
  { id: 4, label: "25 cm", value: 25 },
  { id: 5, label: "30 cm", value: 30 },
];

/**
 * Prop spacing options in meters
 * Standard spacing values for formwork support
 */
export const spacingOptions: SpacingOption[] = [
  { id: 0, label: "1,0 m", value: 1.0 },
  { id: 1, label: "1,2 m", value: 1.2 },
  { id: 2, label: "1,5 m", value: 1.5 },
];

/**
 * Engineering constants
 */
export const ENGINEERING_CONSTANTS = {
  /** Concrete density in kN/m³ (standard reinforced concrete) */
  CONCRETE_DENSITY_KN_M3: 25,
  /** Safety factor for load calculations (1.5 = 50% safety margin) */
  SAFETY_FACTOR: 1.5,
  /** Days per week for rental calculation */
  DAYS_PER_WEEK: 7,
};

/**
 * Product IDs for API integration
 */
export const productIdList = [
  "97100026",
  "97100027",
  "97100028",
  "97100029",
  "97100031",
  "97100032",
];
