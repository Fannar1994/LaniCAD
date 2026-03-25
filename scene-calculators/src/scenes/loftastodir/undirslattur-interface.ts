/**
 * Undirsláttur (Mótabitar HT-20) Calculator - Type Definitions
 * 
 * This module defines the types for the HT-20 beam rental calculator.
 * Used for calculating beam quantities and validating span limits.
 */

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

/** User configuration for the calculator */
export interface UndirslatturConfiguration {
  /** Slab area in square meters */
  area_m2: number;
  /** Concrete thickness in centimeters */
  thickness_cm: number;
  /** Beam spacing in meters */
  spacing_m: number;
  /** Rental duration in days */
  rentalDays: number;
  /** Selected mótabiti ID (null if none selected) */
  selectedBeamId: string | null;
}

/** Calculation result for display */
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

/** Dropdown option for thickness selection */
export interface ThicknessOption {
  id: number;
  label: string;
  value: number; // cm
}

/** Dropdown option for spacing selection */
export interface BeamSpacingOption {
  id: number;
  label: string;
  value: number; // m
}
