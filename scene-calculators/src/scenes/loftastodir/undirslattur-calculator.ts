/**
 * Undirsláttur (Mótabitar HT-20) Calculator - Calculation Logic
 * 
 * This module contains all calculations for determining:
 * - Maximum allowed span based on thickness and spacing
 * - Valid beam lengths based on span limits
 * - Required beam count for given area
 * - Rental pricing
 */

import { useMemo } from "react";
import type { Motabiti, UndirslatturConfiguration, UndirslatturResult } from "./undirslattur-interface";
import { motabitar, spanLimits, BEAM_CONSTANTS } from "./undirslattur-configuration";

const { DAYS_PER_WEEK } = BEAM_CONSTANTS;

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
 * Calculate rental cost based on duration
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
    const { area_m2, thickness_cm, spacing_m, rentalDays, selectedBeamId } = config;

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
