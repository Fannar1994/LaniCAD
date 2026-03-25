/**
 * Loftastoðir (Shoring Props) Calculator - Calculation Logic
 * 
 * This module contains all engineering calculations for determining:
 * - Load per square meter based on concrete thickness
 * - Load per prop based on spacing
 * - Required prop count for given area
 * - Valid props based on load capacity
 * - Rental pricing
 * 
 * All calculations follow standard structural engineering practices.
 */

import { useMemo } from "react";
import type { Loftastod, Configuration, CalculationResult } from "./interface";
import { loftastodir, ENGINEERING_CONSTANTS } from "./configuration";

const { CONCRETE_DENSITY_KN_M3, SAFETY_FACTOR, DAYS_PER_WEEK } = ENGINEERING_CONSTANTS;

/**
 * Calculate load per square meter from concrete thickness
 * 
 * Formula: load = thickness(m) × concrete_density(kN/m³)
 * 
 * @param thickness_cm - Concrete slab thickness in centimeters
 * @returns Load in kN/m²
 */
export function calculateLoadPerM2(thickness_cm: number): number {
  const thickness_m = thickness_cm / 100;
  return thickness_m * CONCRETE_DENSITY_KN_M3;
}

/**
 * Calculate load per prop based on spacing
 * 
 * Each prop supports a square area equal to spacing × spacing.
 * Formula: loadPerProp = loadPerM2 × spacing²
 * 
 * @param loadPerM2_kN - Load per square meter in kN
 * @param spacing_m - Prop spacing in meters
 * @returns Load per prop in kN
 */
export function calculateLoadPerProp(loadPerM2_kN: number, spacing_m: number): number {
  const tributaryArea = spacing_m * spacing_m;
  return loadPerM2_kN * tributaryArea;
}

/**
 * Apply safety factor to load calculation
 * 
 * Safety factor accounts for:
 * - Dynamic loads during pouring
 * - Uneven load distribution
 * - Construction tolerances
 * 
 * @param load_kN - Calculated load in kN
 * @returns Load with safety factor applied
 */
export function applyLoadSafetyFactor(load_kN: number): number {
  return load_kN * SAFETY_FACTOR;
}

/**
 * Calculate number of props required for given area and spacing
 * 
 * Formula: props = ceil(area / spacing²)
 * 
 * @param area_m2 - Total slab area in square meters
 * @param spacing_m - Prop spacing in meters
 * @returns Number of props (rounded up)
 */
export function calculatePropCount(area_m2: number, spacing_m: number): number {
  if (area_m2 <= 0 || spacing_m <= 0) return 0;
  const tributaryArea = spacing_m * spacing_m;
  return Math.ceil(area_m2 / tributaryArea);
}

/**
 * Filter props that can safely carry the required load
 * 
 * A prop is valid if: prop.maxLoad_kN >= loadWithSafety
 * 
 * @param loadWithSafety_kN - Required load including safety factor
 * @returns Array of valid props sorted by maxLoad (ascending)
 */
export function getValidProps(loadWithSafety_kN: number): Loftastod[] {
  return loftastodir
    .filter(prop => prop.maxLoad_kN >= loadWithSafety_kN)
    .sort((a, b) => a.maxLoad_kN - b.maxLoad_kN);
}

/**
 * Calculate rental cost based on duration
 * 
 * Pricing rules:
 * - Less than 7 days: dayRate × days × quantity
 * - 7+ days: weekRate × ceil(days/7) × quantity
 * 
 * @param prop - Selected prop with pricing
 * @param days - Rental duration in days
 * @param quantity - Number of props
 * @returns Total rental cost in ISK
 */
export function calculateRentalCost(
  prop: Loftastod,
  days: number,
  quantity: number
): { total: number; breakdown: string } {
  if (days < DAYS_PER_WEEK) {
    const total = prop.dayRate * days * quantity;
    return {
      total,
      breakdown: `${quantity} stk × ${prop.dayRate} kr/dag × ${days} dagar`,
    };
  } else {
    const weeks = Math.ceil(days / DAYS_PER_WEEK);
    const total = prop.weekRate * weeks * quantity;
    return {
      total,
      breakdown: `${quantity} stk × ${prop.weekRate} kr/viku × ${weeks} vikur`,
    };
  }
}

/**
 * Calculate total weight of all props
 * 
 * @param prop - Selected prop
 * @param quantity - Number of props
 * @returns Total weight in kg
 */
export function calculateTotalWeight(prop: Loftastod, quantity: number): number {
  return prop.weight_kg * quantity;
}

/**
 * React hook for calculating prop requirements
 * 
 * Combines all calculation functions and memoizes the result.
 * Automatically filters valid props based on load.
 * 
 * @param config - User configuration
 * @returns Calculation results and valid props list
 */
export function useCalculateProps(config: Configuration): {
  result: CalculationResult | null;
  validProps: Loftastod[];
} {
  return useMemo(() => {
    const { area_m2, thickness_cm, spacing_m, rentalDays, selectedPropId } = config;

    // Validate inputs
    if (area_m2 <= 0 || thickness_cm <= 0 || spacing_m <= 0 || rentalDays <= 0) {
      return { result: null, validProps: [] };
    }

    // Calculate loads
    const loadPerM2_kN = calculateLoadPerM2(thickness_cm);
    const loadPerProp_kN = calculateLoadPerProp(loadPerM2_kN, spacing_m);
    const loadWithSafety_kN = applyLoadSafetyFactor(loadPerProp_kN);

    // Get valid props and calculate prop count
    const validProps = getValidProps(loadWithSafety_kN);
    const propCount = calculatePropCount(area_m2, spacing_m);

    // Find selected prop
    const selectedProp = selectedPropId
      ? loftastodir.find(p => p.id === selectedPropId) ?? null
      : null;

    // Check if selection is valid
    const isValid = selectedProp !== null && selectedProp.maxLoad_kN >= loadWithSafety_kN;

    // Calculate costs and weight if valid
    let totalCost = 0;
    let costBreakdown = "";
    let totalWeight_kg = 0;

    if (isValid && selectedProp) {
      const costResult = calculateRentalCost(selectedProp, rentalDays, propCount);
      totalCost = costResult.total;
      costBreakdown = costResult.breakdown;
      totalWeight_kg = calculateTotalWeight(selectedProp, propCount);
    }

    const result: CalculationResult = {
      propCount,
      loadPerM2_kN,
      loadPerProp_kN,
      loadWithSafety_kN,
      totalWeight_kg,
      totalCost,
      costBreakdown,
      isValid,
      selectedProp,
    };

    return { result, validProps };
  }, [config]);
}
