// Vinnupallar types
//
// Frame scaffolding: straight runs only, no bends.
// Fixed constants: Palllengd = 1.8m, Palllag = 2.0m

export interface VinnupallarConfiguration {
  totalLength_m: number;
  corners: number;
  height_m: number;
  startDate: string;
  endDate: string;
}

export interface VinnupallarResult {
  rentalDays: number;
  bays: number;
  levels: number;
  rammarCount: number;
  golfbordCount: number;
  stigapallarCount: number;
  stigarCount: number;
  lappirCount: number;
  handridCount: number;
  handridastodir: number;
  veggfestingar: number;
  endahandridCount: number;
  klemmur: number;
  splittiCount: number;
  totalDayRate: number;
  totalWeekRate: number;
  totalCost: number;
  costBreakdown: string;
}

export interface VinnupallarPricing {
  rammarDayRate: number;
  rammarWeekRate: number;
  golfbordDayRate: number;
  golfbordWeekRate: number;
  stigapallarDayRate: number;
  stigapallarWeekRate: number;
  stigarDayRate: number;
  stigarWeekRate: number;
  lappirDayRate: number;
  lappirWeekRate: number;
  handridDayRate: number;
  handridWeekRate: number;
  handridastodiDayRate: number;
  handridastodiWeekRate: number;
  veggfestingDayRate: number;
  veggfestingWeekRate: number;
  endahandridDayRate: number;
  endahandridWeekRate: number;
  klemmaDayRate: number;
  klemmaWeekRate: number;
  splittiDayRate: number;
  splittiWeekRate: number;
}
