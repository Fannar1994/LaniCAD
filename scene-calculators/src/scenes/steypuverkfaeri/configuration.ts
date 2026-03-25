/**
 * Steypuverkfæri (Concrete Formwork Tools) Calculator - Configuration Data
 * 
 * Contains all product data and configuration options for:
 * - Loftastoðir (Shoring Props)
 * - Undirsláttur (HT-20 Formwork Beams / Mótabitar)
 * 
 * Data sourced from BYKO rental catalog.
 */

import type {
  Loftastod,
  Motabiti,
  ThicknessOption,
  SpacingOption,
  BeamSpacingOption,
  SpanLimit,
} from "./interface";

// =============================================================================
// ENGINEERING CONSTANTS
// =============================================================================

/** Engineering constants for all calculations */
export const ENGINEERING_CONSTANTS = {
  /** Concrete density in kN/m³ (standard reinforced concrete) */
  CONCRETE_DENSITY_KN_M3: 25,
  /** Safety factor for load calculations (1.5 = 50% safety margin) */
  SAFETY_FACTOR: 1.5,
  /** Days per week for rental calculation */
  DAYS_PER_WEEK: 7,
  /** Minimum rental days */
  MIN_RENTAL_DAYS: 1,
};

// =============================================================================
// LOFTASTOÐIR (SHORING PROPS) CONFIGURATION
// =============================================================================

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
 * Product IDs for loftastodir API integration
 */
export const loftastodirProductIdList = [
  "97100026",
  "97100027",
  "97100028",
  "97100029",
  "97100031",
  "97100032",
];

// =============================================================================
// UNDIRSLÁTTUR (HT-20 FORMWORK BEAMS) CONFIGURATION
// =============================================================================

/**
 * Available Mótabitar HT-20 beams for rental
 * 
 * HT-20 are secondary formwork beams used for concrete slab support.
 * Different lengths available for various span requirements.
 */
export const motabitar: Motabiti[] = [
  {
    id: "01-MÓT-LM71-924",
    articleNumber: "0153924",
    name: "HT-20 2,45 m",
    length_m: 2.45,
    dayRate: 17,
    weekRate: 119,
    weight_kg: 11.27,
  },
  {
    id: "01-MÓT-LM71-926",
    articleNumber: "0153926",
    name: "HT-20 2,65 m",
    length_m: 2.65,
    dayRate: 19,
    weekRate: 133,
    weight_kg: 12.19,
  },
  {
    id: "01-MÓT-LM71-929",
    articleNumber: "0153929",
    name: "HT-20 2,9 m",
    length_m: 2.9,
    dayRate: 20,
    weekRate: 140,
    weight_kg: 13.34,
  },
  {
    id: "01-MÓT-LM71-933",
    articleNumber: "0153933",
    name: "HT-20 3,3 m",
    length_m: 3.3,
    dayRate: 20.69,
    weekRate: 144.83,
    weight_kg: 13.34,
  },
  {
    id: "01-MÓT-LM71-936",
    articleNumber: "0153936",
    name: "HT-20 3,6 m",
    length_m: 3.6,
    dayRate: 25,
    weekRate: 175,
    weight_kg: 16.56,
  },
  {
    id: "01-MÓT-LM71-939",
    articleNumber: "0153939",
    name: "HT-20 3,9 m",
    length_m: 3.9,
    dayRate: 27,
    weekRate: 189,
    weight_kg: 17.94,
  },
  {
    id: "01-MÓT-LM71-949",
    articleNumber: "0153949",
    name: "HT-20 4,9 m",
    length_m: 4.9,
    dayRate: 34,
    weekRate: 238,
    weight_kg: 22.54,
  },
];

/**
 * Span limit lookup table for HT-20 beams
 * 
 * Conservative values based on concrete thickness and beam spacing.
 * A beam is allowed only if: selectedLength ≤ maxAllowedSpan
 */
export const spanLimits: SpanLimit[] = [
  { thickness_cm: 18, spacing_m: 0.5, maxSpan_m: 2.9 },
  { thickness_cm: 20, spacing_m: 0.5, maxSpan_m: 2.7 },
  { thickness_cm: 22, spacing_m: 0.5, maxSpan_m: 2.5 },

  { thickness_cm: 18, spacing_m: 0.6, maxSpan_m: 2.6 },
  { thickness_cm: 20, spacing_m: 0.6, maxSpan_m: 2.4 },
  { thickness_cm: 22, spacing_m: 0.6, maxSpan_m: 2.2 },

  { thickness_cm: 20, spacing_m: 0.75, maxSpan_m: 2.1 },
];

/**
 * Concrete thickness options for undirsláttur
 * Common slab thicknesses for HT-20 beam applications
 */
export const undirslatturThicknessOptions: ThicknessOption[] = [
  { id: 0, label: "15 cm", value: 15 },
  { id: 1, label: "18 cm", value: 18 },
  { id: 2, label: "20 cm", value: 20 },
  { id: 3, label: "22 cm", value: 22 },
  { id: 4, label: "25 cm", value: 25 },
  { id: 5, label: "30 cm", value: 30 },
];

/**
 * Beam spacing options in meters
 * Standard spacing values for HT-20 secondary beams
 */
export const beamSpacingOptions: BeamSpacingOption[] = [
  { id: 0, label: "0,5 m", value: 0.5 },
  { id: 1, label: "0,6 m", value: 0.6 },
  { id: 2, label: "0,75 m", value: 0.75 },
];

/**
 * Product IDs for undirsláttur API integration
 */
export const motabitarProductIdList = [
  "0153924",
  "0153926",
  "0153929",
  "0153933",
  "0153936",
  "0153939",
  "0153949",
];

// =============================================================================
// COMBINED PRODUCT LIST
// =============================================================================

/**
 * All product IDs for API integration
 */
export const productIdList = [
  ...loftastodirProductIdList,
  ...motabitarProductIdList,
];

/**
 * Calculator type configuration
 */
export const CALCULATOR_TYPES = [
  {
    id: "loftastodir" as const,
    name: "Loftastoðir",
    description: "Lóðréttar stoðir fyrir steypu plötur",
  },
  {
    id: "undirslattur" as const,
    name: "Undirsláttur (HT-20)",
    description: "Láréttir mótabitar fyrir steypu plötur",
  },
];
