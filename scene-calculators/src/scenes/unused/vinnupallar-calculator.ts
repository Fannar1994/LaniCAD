// Vinnupallar (Frame Scaffolding) Calculator
// Based on Excel: "Vinnupallatafla með forsendum (Tvöföld handrið)"
//
// Key formulas:
//   RAMMAR = (bays+1) × levels
//   GÓLFBORÐ = levels × 2 × bays - stigapallar
//   HANDRIÐ = (levels+1) × bays
//   VEGGFESTINGAR = ceil(length/3.75) × ceil(height/4.0)

import { useMemo } from "react";
import type { VinnupallarConfiguration, VinnupallarResult } from "./vinnupallar-interface";
import { VINNUPALLAR_CONSTANTS, VINNUPALLAR_PRICING, DAYS_PER_WEEK, MIN_RENTAL_DAYS, WALL_TIE_SPACING } from "./vinnupallar-configuration";

const { PALLLENGD_M, PALLLAG_M } = VINNUPALLAR_CONSTANTS;

// Rental days between dates (minimum 10 days)
export function calculateDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return MIN_RENTAL_DAYS;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const timeDiff = end.getTime() - start.getTime();
  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  return Math.max(MIN_RENTAL_DAYS, days);
}

// bays = ceil(length / 1.8)
export function calculateBays(totalLength_m: number): number {
  if (totalLength_m <= 0) return 0;
  return Math.ceil(totalLength_m / PALLLENGD_M);
}

// levels = ceil(height / 2.0)
export function calculateLevels(height_m: number): number {
  if (height_m <= 0) return 0;
  return Math.ceil(height_m / PALLLAG_M);
}

// (bays + 1) × levels
export function calculateRammar(bays: number, levels: number): number {
  if (bays <= 0 || levels <= 0) return 0;
  return (bays + 1) * levels;
}

// levels × 2 × bays - stigapallar
export function calculateGolfbord(bays: number, levels: number, stigapallar: number): number {
  if (bays <= 0 || levels <= 0) return 0;
  return levels * 2 * bays - stigapallar;
}

// Constant: 2 for entry/exit
export function calculateStigapallar(): number {
  return 2;
}

// 1 ladder per level
export function calculateStigar(levels: number): number {
  return levels;
}

// (bays + 1) × 2
export function calculateLappir(bays: number): number {
  if (bays <= 0) return 0;
  return (bays + 1) * 2;
}

// (levels + 1) × bays
export function calculateHandrid(bays: number, levels: number): number {
  if (bays <= 0 || levels <= 0) return 0;
  return (levels + 1) * bays;
}

// bays + 1 + endalokana
export function calculateHandridastodir(bays: number, endalokana: number): number {
  if (bays <= 0) return 0;
  return bays + 1 + endalokana;
}

// ceil(length / 3.75) × ceil(height / 4.0)
export function calculateVeggfestingar(totalLength_m: number, height_m: number): number {
  if (totalLength_m <= 0 || height_m <= 0) return 0;
  
  const horizontalTies = Math.ceil(totalLength_m / WALL_TIE_SPACING.HORIZONTAL_M);
  const verticalTies = Math.ceil(height_m / WALL_TIE_SPACING.VERTICAL_M);
  
  return horizontalTies * verticalTies;
}

// endalokana × levels × 2
export function calculateEndahandrid(endalokana: number, levels: number): number {
  if (levels <= 0) return 0;
  return endalokana * levels * 2;
}

// Same as veggfestingar
export function calculateKlemmur(veggfestingar: number): number {
  return veggfestingar;
}

// rammar × 2
export function calculateSplitti(rammar: number): number {
  return rammar * 2;
}

export function calculateTotalDayRate(
  rammarCount: number,
  golfbordCount: number,
  stigapallarCount: number,
  stigarCount: number,
  lappirCount: number,
  handridCount: number,
  handridastodir: number,
  veggfestingar: number,
  endahandridCount: number,
  klemmur: number,
  splittiCount: number
): number {
  const p = VINNUPALLAR_PRICING;
  return (
    rammarCount * p.rammarDayRate +
    golfbordCount * p.golfbordDayRate +
    stigapallarCount * p.stigapallarDayRate +
    stigarCount * p.stigarDayRate +
    lappirCount * p.lappirDayRate +
    handridCount * p.handridDayRate +
    handridastodir * p.handridastodiDayRate +
    veggfestingar * p.veggfestingDayRate +
    endahandridCount * p.endahandridDayRate +
    klemmur * p.klemmaDayRate +
    splittiCount * p.splittiDayRate
  );
}

export function calculateTotalWeekRate(
  rammarCount: number,
  golfbordCount: number,
  stigapallarCount: number,
  stigarCount: number,
  lappirCount: number,
  handridCount: number,
  handridastodir: number,
  veggfestingar: number,
  endahandridCount: number,
  klemmur: number,
  splittiCount: number
): number {
  const p = VINNUPALLAR_PRICING;
  return (
    rammarCount * p.rammarWeekRate +
    golfbordCount * p.golfbordWeekRate +
    stigapallarCount * p.stigapallarWeekRate +
    stigarCount * p.stigarWeekRate +
    lappirCount * p.lappirWeekRate +
    handridCount * p.handridWeekRate +
    handridastodir * p.handridastodiWeekRate +
    veggfestingar * p.veggfestingWeekRate +
    endahandridCount * p.endahandridWeekRate +
    klemmur * p.klemmaWeekRate +
    splittiCount * p.splittiWeekRate
  );
}

// Main calculation hook
export function useCalculateVinnupallar(config: VinnupallarConfiguration): VinnupallarResult | null {
  return useMemo(() => {
    const { totalLength_m, corners: endalokana, height_m, startDate, endDate } = config;

    // Validate inputs
    if (totalLength_m <= 0 || height_m <= 0) {
      return null;
    }

    // Calculate rental days from dates (minimum 10 days)
    const rentalDays = calculateDaysBetween(startDate, endDate);

    // Calculate derived values
    const bays = calculateBays(totalLength_m);
    const levels = calculateLevels(height_m);

    // Calculate component quantities using exact Excel formulas
    const rammarCount = calculateRammar(bays, levels);
    const stigapallarCount = calculateStigapallar();
    const stigarCount = calculateStigar(levels);
    const golfbordCount = calculateGolfbord(bays, levels, stigapallarCount);
    const lappirCount = calculateLappir(bays);
    const handridCount = calculateHandrid(bays, levels);
    const handridastodir = calculateHandridastodir(bays, endalokana);
    const veggfestingar = calculateVeggfestingar(totalLength_m, height_m);
    const endahandridCount = calculateEndahandrid(endalokana, levels);
    const klemmur = calculateKlemmur(veggfestingar);
    const splittiCount = calculateSplitti(rammarCount);

    // Calculate rates
    const totalDayRate = calculateTotalDayRate(
      rammarCount, golfbordCount, stigapallarCount, stigarCount,
      lappirCount, handridCount, handridastodir, veggfestingar,
      endahandridCount, klemmur, splittiCount
    );
    const totalWeekRate = calculateTotalWeekRate(
      rammarCount, golfbordCount, stigapallarCount, stigarCount,
      lappirCount, handridCount, handridastodir, veggfestingar,
      endahandridCount, klemmur, splittiCount
    );

    // Calculate total cost based on rental duration
    // < 7 dagar → dagverð × dagar
    // ≥ 7 dagar → vikulegt verð × ceil(dagar / 7)
    let totalCost: number;
    let costBreakdown: string;

    if (rentalDays < DAYS_PER_WEEK) {
      totalCost = totalDayRate * rentalDays;
      costBreakdown = `${totalDayRate.toLocaleString("is-IS")} kr/dag × ${rentalDays} dagar`;
    } else {
      const weeks = Math.ceil(rentalDays / DAYS_PER_WEEK);
      totalCost = totalWeekRate * weeks;
      costBreakdown = `${totalWeekRate.toLocaleString("is-IS")} kr/viku × ${weeks} vikur`;
    }

    return {
      rentalDays,
      bays,
      levels,
      rammarCount,
      golfbordCount,
      stigapallarCount,
      stigarCount,
      lappirCount,
      handridCount,
      handridastodir,
      veggfestingar,
      endahandridCount,
      klemmur,
      splittiCount,
      totalDayRate,
      totalWeekRate,
      totalCost,
      costBreakdown,
    };
  }, [config]);
}
