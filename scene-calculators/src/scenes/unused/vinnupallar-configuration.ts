// Vinnupallar configuration
//
// Fixed constants: Palllengd = 1.8m, Palllag = 2.0m

import type { VinnupallarPricing } from "./vinnupallar-interface";

export const VINNUPALLAR_CONSTANTS = {
  PALLLENGD_M: 1.8,
  PALLLAG_M: 2.0,
};

export const MIN_RENTAL_DAYS = 10;
export const DAYS_PER_WEEK = 7;

export const WALL_TIE_SPACING = {
  HORIZONTAL_M: 3.75,
  VERTICAL_M: 4.0,
};

// Pricing in ISK
export const VINNUPALLAR_PRICING: VinnupallarPricing = {
  rammarDayRate: 19,
  rammarWeekRate: 95,
  golfbordDayRate: 12,
  golfbordWeekRate: 60,
  stigapallarDayRate: 50,
  stigapallarWeekRate: 250,
  stigarDayRate: 17,
  stigarWeekRate: 85,
  lappirDayRate: 6,
  lappirWeekRate: 30,
  handridDayRate: 15,
  handridWeekRate: 75,
  handridastodiDayRate: 7,
  handridastodiWeekRate: 35,
  veggfestingDayRate: 3,
  veggfestingWeekRate: 15,
  endahandridDayRate: 9,
  endahandridWeekRate: 45,
  klemmaDayRate: 3,
  klemmaWeekRate: 15,
  splittiDayRate: 0.5,
  splittiWeekRate: 2.5,
};
