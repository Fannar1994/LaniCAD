/**
 * Steypuverkfæri (Concrete Formwork Tools) Calculator - Calculation Logic
 * 
 * This module contains all engineering calculations for:
 * - Loftastoðir (Shoring Props): load, prop count, valid props, rental pricing
 * - Undirsláttur (HT-20 Beams): span limits, beam count, valid beams, rental pricing
 * 
 * All calculations follow standard structural engineering practices.
 * Pattern follows hjolapallar and idnadar-girdingar calculators.
 */

import { useMemo } from "react";
import type {
  Loftastod,
  Motabiti,
  LoftastodirConfiguration,
  UndirslatturConfiguration,
  LoftastodirResult,
  UndirslatturResult,
} from "./interface";
import {
  loftastodir,
  motabitar,
  spanLimits,
  ENGINEERING_CONSTANTS,
} from "./configuration";

const { CONCRETE_DENSITY_KN_M3, SAFETY_FACTOR, DAYS_PER_WEEK } = ENGINEERING_CONSTANTS;

// =============================================================================
// SHARED FUNCTIONS
// =============================================================================

/**
 * Calculate number of days between two dates
 * Matches pattern from idnadar-girdingar/fence.tsx with minimum 10 days
 */
export function calculateDaysBetween(
  startDate: string,
  endDate: string
): number {
  if (!startDate || !endDate) return 10;
  
  const start = new Date(startDate);
  const end = new Date(endDate);

  const timeDiff = end.getTime() - start.getTime();
  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return Math.max(10, days); // Minimum 10 days rental
}

// =============================================================================
// LOFTASTOÐIR (SHORING PROPS) CALCULATIONS
// =============================================================================

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
 * Calculate rental cost for loftastodir based on duration
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
 * Matches pattern from hjolapallar/calculator.ts useCalculateProductList
 * 
 * Combines all calculation functions and memoizes the result.
 * Automatically filters valid props based on load.
 * 
 * @param config - User configuration
 * @returns Calculation results and valid props list
 */
export function useCalculateProps(config: LoftastodirConfiguration): {
  result: LoftastodirResult | null;
  validProps: Loftastod[];
} {
  return useMemo(() => {
    const { area_m2, thickness_cm, spacing_m, startDate, endDate, selectedPropId } = config;

    // Calculate rental days from dates
    const rentalDays = calculateDaysBetween(startDate, endDate);

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

    const result: LoftastodirResult = {
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

// =============================================================================
// UNDIRSLÁTTUR (HT-20 BEAMS) CALCULATIONS
// =============================================================================

/**
 * Get maximum allowed span for given thickness and spacing
 * 
 * Uses lookup table to find the maximum span. Returns null if no rule exists.
 * 
 * @param thickness_cm - Concrete thickness in centimeters
 * @param spacing_m - Beam spacing in meters
 * @returns Maximum allowed span in meters, or null if not found
 */
export function getMaxAllowedSpan(thickness_cm: number, spacing_m: number): number | null {
  const limit = spanLimits.find(
    (l) => l.thickness_cm === thickness_cm && l.spacing_m === spacing_m
  );
  return limit?.maxSpan_m ?? null;
}

/**
 * Filter beams that are allowed for given span limit
 * 
 * A beam is valid if: beam.length_m ≤ maxAllowedSpan
 * 
 * @param maxSpan_m - Maximum allowed span in meters (null = no beams allowed)
 * @returns Array of valid beams sorted by length (ascending)
 */
export function getValidBeams(maxSpan_m: number | null): Motabiti[] {
  if (maxSpan_m === null) return [];
  
  return motabitar
    .filter((beam) => beam.length_m <= maxSpan_m)
    .sort((a, b) => a.length_m - b.length_m);
}

/**
 * Calculate total length of beams required
 * 
 * Formula: totalLength = area / spacing
 * 
 * @param area_m2 - Slab area in square meters
 * @param spacing_m - Beam spacing in meters
 * @returns Total beam length required in meters
 */
export function calculateTotalBeamLength(area_m2: number, spacing_m: number): number {
  if (area_m2 <= 0 || spacing_m <= 0) return 0;
  return area_m2 / spacing_m;
}

/**
 * Calculate number of beams required
 * 
 * Formula: beams = ceil(totalLength / beamLength)
 * 
 * @param totalLength_m - Total length of beams required
 * @param beamLength_m - Length of selected beam
 * @returns Number of beams (rounded up)
 */
export function calculateBeamCount(totalLength_m: number, beamLength_m: number): number {
  if (totalLength_m <= 0 || beamLength_m <= 0) return 0;
  return Math.ceil(totalLength_m / beamLength_m);
}

/**
 * Calculate total weight of all beams
 * 
 * @param beam - Selected beam
 * @param quantity - Number of beams
 * @returns Total weight in kg
 */
export function calculateBeamWeight(beam: Motabiti, quantity: number): number {
  return beam.weight_kg * quantity;
}

/**
 * Calculate rental cost for beams based on duration
 * 
 * Pricing rules:
 * - Less than 7 days: dayRate × days × quantity
 * - 7+ days: weekRate × ceil(days/7) × quantity
 * 
 * @param beam - Selected beam with pricing
 * @param days - Rental duration in days
 * @param quantity - Number of beams
 * @returns Total rental cost in ISK and breakdown
 */
export function calculateBeamRentalCost(
  beam: Motabiti,
  days: number,
  quantity: number
): { total: number; breakdown: string } {
  if (days < DAYS_PER_WEEK) {
    const total = beam.dayRate * days * quantity;
    return {
      total,
      breakdown: `${quantity} stk × ${beam.dayRate} kr/dag × ${days} dagar`,
    };
  } else {
    const weeks = Math.ceil(days / DAYS_PER_WEEK);
    const total = beam.weekRate * weeks * quantity;
    return {
      total,
      breakdown: `${quantity} stk × ${beam.weekRate.toFixed(2)} kr/viku × ${weeks} vikur`,
    };
  }
}

/**
 * React hook for calculating beam requirements
 * Matches pattern from hjolapallar/calculator.ts useCalculateProductList
 * 
 * Combines all calculation functions and memoizes the result.
 * Automatically filters valid beams based on span limits.
 * 
 * @param config - User configuration
 * @returns Calculation results and valid beams list
 */
export function useCalculateBeams(config: UndirslatturConfiguration): {
  result: UndirslatturResult | null;
  validBeams: Motabiti[];
} {
  return useMemo(() => {
    const { area_m2, thickness_cm, spacing_m, startDate, endDate, selectedBeamId } = config;

    // Calculate rental days from dates
    const rentalDays = calculateDaysBetween(startDate, endDate);

    // Validate inputs
    if (area_m2 <= 0 || thickness_cm <= 0 || spacing_m <= 0 || rentalDays <= 0) {
      return { result: null, validBeams: [] };
    }

    // Get maximum allowed span for current settings
    const maxAllowedSpan_m = getMaxAllowedSpan(thickness_cm, spacing_m);

    // Get valid beams and calculate required length
    const validBeams = getValidBeams(maxAllowedSpan_m);
    const totalLength_m = calculateTotalBeamLength(area_m2, spacing_m);

    // Find selected beam
    const selectedBeam = selectedBeamId
      ? motabitar.find((b) => b.id === selectedBeamId) ?? null
      : null;

    // Check if selection is valid (beam exists and within span limit)
    const isValid =
      selectedBeam !== null &&
      maxAllowedSpan_m !== null &&
      selectedBeam.length_m <= maxAllowedSpan_m;

    // Calculate counts, costs, and weight if valid
    let beamCount = 0;
    let totalCost = 0;
    let costBreakdown = "";
    let totalWeight_kg = 0;

    if (isValid && selectedBeam) {
      beamCount = calculateBeamCount(totalLength_m, selectedBeam.length_m);
      const costResult = calculateBeamRentalCost(selectedBeam, rentalDays, beamCount);
      totalCost = costResult.total;
      costBreakdown = costResult.breakdown;
      totalWeight_kg = calculateBeamWeight(selectedBeam, beamCount);
    }

    const result: UndirslatturResult = {
      totalLength_m,
      beamCount,
      totalWeight_kg,
      totalCost,
      costBreakdown,
      isValid,
      selectedBeam,
      maxAllowedSpan_m,
    };

    return { result, validBeams };
  }, [config]);
}
