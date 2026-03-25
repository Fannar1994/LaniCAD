/**
 * Loftastoðir (Shoring Props) Calculator - Type Definitions
 * 
 * This module defines the types for the shoring props rental calculator.
 * Used for calculating prop quantities and validating load capacity.
 */

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

/** User configuration for the calculator */
export interface Configuration {
  /** Slab area in square meters */
  area_m2: number;
  /** Concrete thickness in centimeters */
  thickness_cm: number;
  /** Prop spacing in meters */
  spacing_m: number;
  /** Rental duration in days */
  rentalDays: number;
  /** Selected loftastoð ID (null if none selected) */
  selectedPropId: string | null;
}

/** Calculation result for display */
export interface CalculationResult {
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
export interface ThicknessOption {
  id: number;
  label: string;
  value: number; // cm
}

/** Dropdown option for spacing selection */
export interface SpacingOption {
  id: number;
  label: string;
  value: number; // m
}
