/**
 * Steypuverkfæri (Concrete Formwork Tools) Calculator - Type Definitions
 * 
 * This module defines types for:
 * - Loftastoðir (Shoring Props) - vertical supports for concrete slabs
 * - Undirsláttur (HT-20 Formwork Beams / Mótabitar) - horizontal support beams
 * 
 * Combined calculator following the pattern of hjolapallar and idnadar-girdingar.
 */

// =============================================================================
// SHARED TYPES
// =============================================================================

/** Common dropdown option structure */
export interface SelectOption {
  id: number;
  label: string;
  value: number;
}

/** Calculator type selection */
export type CalculatorType = "loftastodir" | "undirslattur";

/** Rental pricing structure */
export interface RentalPricing {
  dayRate: number;
  weekRate: number;
}

// =============================================================================
// LOFTASTOÐIR (SHORING PROPS)
// =============================================================================

/** Loftastoð (shoring prop) product definition */
export interface Loftastod {
  /** Internal rental ID */
  id: string;
  /** BYKO article number for sales/inventory */
  articleNumber: string;
  /** Display name in Icelandic */
  name: string;
  /** Minimum adjustable height in meters */
  minHeight_m: number;
  /** Maximum adjustable height in meters */
  maxHeight_m: number;
  /** Maximum load capacity in kilonewtons */
  maxLoad_kN: number;
  /** Daily rental rate in ISK */
  dayRate: number;
  /** Weekly rental rate in ISK */
  weekRate: number;
  /** Weight per unit in kilograms */
  weight_kg: number;
}

/** User configuration for loftastodir calculator */
export interface LoftastodirConfiguration {
  /** Slab area in square meters */
  area_m2: number;
  /** Concrete thickness in centimeters */
  thickness_cm: number;
  /** Prop spacing in meters */
  spacing_m: number;
  /** Rental start date (ISO string) */
  startDate: string;
  /** Rental end date (ISO string) */
  endDate: string;
  /** Selected loftastoð ID (null if none selected) */
  selectedPropId: string | null;
}

/** Calculation result for loftastodir */
export interface LoftastodirResult {
  /** Number of props required */
  propCount: number;
  /** Load per square meter in kN/m² */
  loadPerM2_kN: number;
  /** Load per prop in kN */
  loadPerProp_kN: number;
  /** Load per prop with safety factor in kN */
  loadWithSafety_kN: number;
  /** Total weight of all props in kg */
  totalWeight_kg: number;
  /** Total rental cost in ISK */
  totalCost: number;
  /** Cost breakdown description */
  costBreakdown: string;
  /** Whether selection is valid */
  isValid: boolean;
  /** Selected prop details (if valid) */
  selectedProp: Loftastod | null;
}

/** Dropdown option for thickness selection */
export interface ThicknessOption extends SelectOption {
  value: number; // cm
}

/** Dropdown option for spacing selection */
export interface SpacingOption extends SelectOption {
  value: number; // m
}

// =============================================================================
// UNDIRSLÁTTUR (HT-20 FORMWORK BEAMS)
// =============================================================================

/** Mótabiti (HT-20 beam) product definition */
export interface Motabiti {
  /** Internal rental ID */
  id: string;
  /** BYKO article number for sales/inventory */
  articleNumber: string;
  /** Display name in Icelandic */
  name: string;
  /** Beam length in meters */
  length_m: number;
  /** Daily rental rate in ISK */
  dayRate: number;
  /** Weekly rental rate in ISK */
  weekRate: number;
  /** Weight per unit in kilograms */
  weight_kg: number;
}

/** Span limit lookup entry */
export interface SpanLimit {
  /** Concrete thickness in cm */
  thickness_cm: number;
  /** Beam spacing in meters */
  spacing_m: number;
  /** Maximum allowed span in meters */
  maxSpan_m: number;
}

/** User configuration for undirslattur calculator */
export interface UndirslatturConfiguration {
  /** Slab area in square meters */
  area_m2: number;
  /** Concrete thickness in centimeters */
  thickness_cm: number;
  /** Beam spacing in meters */
  spacing_m: number;
  /** Rental start date (ISO string) */
  startDate: string;
  /** Rental end date (ISO string) */
  endDate: string;
  /** Selected mótabiti ID (null if none selected) */
  selectedBeamId: string | null;
}

/** Calculation result for undirslattur */
export interface UndirslatturResult {
  /** Total length of beams required in meters */
  totalLength_m: number;
  /** Number of beams required */
  beamCount: number;
  /** Total weight of all beams in kg */
  totalWeight_kg: number;
  /** Total rental cost in ISK */
  totalCost: number;
  /** Cost breakdown description */
  costBreakdown: string;
  /** Whether selection is valid */
  isValid: boolean;
  /** Selected beam details (if valid) */
  selectedBeam: Motabiti | null;
  /** Maximum allowed span for current settings */
  maxAllowedSpan_m: number | null;
}

/** Dropdown option for beam spacing selection */
export interface BeamSpacingOption extends SelectOption {
  value: number; // m
}

// =============================================================================
// COMBINED CONFIGURATION
// =============================================================================

/** Main configuration with selected calculator type */
export interface SteypuverkfaeriConfiguration {
  calculatorType: CalculatorType;
  loftastodir: LoftastodirConfiguration;
  undirslattur: UndirslatturConfiguration;
}
