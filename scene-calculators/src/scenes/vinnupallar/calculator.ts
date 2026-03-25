import { PallurInput, ScaffoldResult, ScaffoldItem, PallurResult, HlidInput, DerivedInputs, HlidDerivedValues, EndClosureType } from "./interface";
import { VINNUPALLAR_CONFIG } from "./configuration";

// Fastar
export const BAY_LENGTH_M = 1.8;  // Working table length
const LEVEL_HEIGHT_M = 2.0;       // Frame height

// Calculations from sides
export function deriveInputsFromHlid(hlidir: HlidInput[], bayLengthM: number = BAY_LENGTH_M): DerivedInputs {
  const derivedHlidir: HlidDerivedValues[] = [];
  let einingafjoldiTotal = 0;
  let fjoldi2mHaedaTotal = 0;
  let fjoldi0_7mHaedaTotal = 0;
  let fjoldiEndalokanaTotal = 0;
  let maxStandHeightM = 0;
  let maxWorkingHeightM = 0;

  for (let i = 0; i < hlidir.length; i++) {
    const hlid = hlidir[i];
    
    // working table length: ceil(length / 1.8)
    const einingafjoldi = Math.ceil(hlid.lengthM / bayLengthM);
    
    // Frame levels: 2.0m primary, one 0.7m if needed
    const full2mLevels = Math.floor(hlid.standHeightM / LEVEL_HEIGHT_M);
    const remaining = hlid.standHeightM - (full2mLevels * LEVEL_HEIGHT_M);
    const use0_7m = remaining > 0.01 ? 1 : 0;
    
    // Each side gets 2 end closures (safety requirement)
    const fjoldiEndalokana = 2;
    
    const derived: HlidDerivedValues = {
      hlidId: hlid.id,
      einingafjoldi,
      fjoldi2mHaeda: full2mLevels,
      fjoldi0_7mHaeda: use0_7m,
      fjoldiEndalokana,
      lengthM: hlid.lengthM,
      standHeightM: hlid.standHeightM,
      workingHeightM: hlid.workingHeightM,
    };
    
    derivedHlidir.push(derived);
    
    // Aggregate totals
    einingafjoldiTotal += einingafjoldi;
    fjoldi2mHaedaTotal += full2mLevels;
    fjoldi0_7mHaedaTotal += use0_7m;
    fjoldiEndalokanaTotal += fjoldiEndalokana;
    maxStandHeightM = Math.max(maxStandHeightM, hlid.standHeightM);
    maxWorkingHeightM = Math.max(maxWorkingHeightM, hlid.workingHeightM);
  }
  
  return {
    hlidir: derivedHlidir,
    einingafjoldiTotal,
    fjoldi2mHaedaTotal,
    fjoldi0_7mHaedaTotal,
    fjoldiEndalokanaTotal,
    maxStandHeightM,
    maxWorkingHeightM,
  };
}

/** m2 = einingafjoldi × bayLength_m × (fjoldi2mHaeda + fjoldi0_7mHaeda) × 3 */
export function calculateFermetrafjoldi(input: PallurInput): number {
  const totalLevels = input.fjoldi2mHaeda + input.fjoldi0_7mHaeda;
  if (totalLevels === 0) return 0;
  return Math.round(input.einingafjoldi * BAY_LENGTH_M * totalLevels * 3);
}

// calculations for each component

/** Frame 2,0m */
function calculateRammar2m(bays: number, fullLevels: number): number {
  if (bays <= 0 || fullLevels <= 0) return 0;
  return (bays + 1) * fullLevels;
}

/** Frame 0,7m */
function calculateRammar07m(bays: number, extra07: number): number {
  if (bays <= 0 || extra07 <= 0) return 0;
  return (bays + 1) * extra07;
}

/** Working table 1,8m */
function calculateGolfbord(bays: number, levels: number, stigapallar: number): number {
  if (bays <= 0 || levels <= 0) return 0;
  return levels * 2 * bays - stigapallar;
}

/** Working table a hatch 1,8m */
function calculateStigapallar(levels: number): number {
  return levels > 0 ? levels : 0;
}

/** Feet */
function calculateLappir(bays: number): number {
  if (bays <= 0) return 0;
  return (bays + 1) * 2;
}

/** Double guard rail */
function calculateHandrid(bays: number, levels: number): number {
  if (bays <= 0 || levels <= 0) return 0;
  return (levels + 1) * bays;
}

/** Guardrail supports */
function calculateHandridastodir(bays: number, endalokana: number): number {
  if (bays <= 0) return 0;
  return bays + 1 + endalokana;
}

/** Wallmounting - 4 per side */
function calculateVeggfestingar(): number {
  return 4;
}

/** End guardrail */
function calculateEndahandrid(endalokana: number, levels: number): number {
  if (levels <= 0) return 0;
  return endalokana * levels * 2;
}

/** Clamps - 4 per side */
function calculateKlemmur(): number {
  return 4;
}

/** Splitti */
function calculateSplitti(rammar: number): number {
  return rammar * 2;
}

/** Racks */
function calculateRekkar(totalItems: number, packSize: number): number {
  if (totalItems <= 0) return 0;
  return Math.ceil(totalItems / packSize);
}

// Productlist
const ITEM_CATALOG: Record<string, { leigunumer: string; heiti: string; einVerd: number; weight?: number }> = {
  "97100000": { leigunumer: "01-PAL-VP01-000", heiti: "RAMMAR 2,0M", einVerd: 19.0, weight: 18.6 },
  "97100001": { leigunumer: "01-PAL-VP01-001", heiti: "RAMMAR 0,7M", einVerd: 15.0, weight: 7.52 },
  "97100002": { leigunumer: "01-PAL-VP01-002", heiti: "GÓLFBORÐ 1,8M", einVerd: 12.0, weight: 13.9 },
  "97100003": { leigunumer: "01-PAL-VP01-003", heiti: "STIGAPALLAR 1,8M", einVerd: 50.0, weight: 17 },
  "97100004": { leigunumer: "01-PAL-VP01-004", heiti: "STIGAR 2,0M", einVerd: 17.0, weight: 8 },
  "97100005": { leigunumer: "01-PAL-VP01-005", heiti: "STIGAR 2,7M", einVerd: 25.0, weight: 11.5 },
  "97100006": { leigunumer: "01-PAL-VP01-006", heiti: "LAPPIR 50CM", einVerd: 6.0, weight: 3.1 },
  "97100007": { leigunumer: "01-PAL-VP01-007", heiti: "LAPPIR 100CM", einVerd: 8.0, weight: 4.5 },
  "971000101": { leigunumer: "01-PAL-VP01-0101", heiti: "TVÖFÖLD HANDRIÐ", einVerd: 15.0, weight: 8.8 },
  "97100011": { leigunumer: "01-PAL-VP01-011", heiti: "HANDRIÐASTOÐIR", einVerd: 7.0, weight: 3.4 },
  "97100012": { leigunumer: "01-PAL-VP01-012", heiti: "VEGGFESTINGAR 50CM", einVerd: 3.0, weight: 2.3 },
  "971000121": { leigunumer: "01-PAL-VP01-047", heiti: "VEGGFESTINGAR 80CM", einVerd: 6.0, weight: 2.3 },
  "97100015": { leigunumer: "01-PAL-VP01-015", heiti: "KLEMMUR", einVerd: 3.0, weight: 1.3 },
  "97100017": { leigunumer: "01-PAL-VP01-017", heiti: "ENDAHANDRIÐ 1MM", einVerd: 9.0, weight: 4 },
  "97100020": { leigunumer: "01-PAL-VP01-020", heiti: "SPLITTI F/RAMMA", einVerd: 0.5, weight: 0.08 },
  "971000212": { leigunumer: "01-PAL-VP01-0212", heiti: "REKKAR FYRIR RAMMA GALV.", einVerd: 81.0, weight: 65 },
  "97100077": { leigunumer: "01-PAL-VP01-077", heiti: "REKKAR FYRIR GÓLF", einVerd: 64.0, weight: 43 },
  "971000109": { leigunumer: "01-PAL-VP01-0109", heiti: "REKKAR F/TVÖF.HANDRIÐ", einVerd: 64.0, weight: 20 },
  "HA548480": { leigunumer: "01-MÓT-AH21-480", heiti: "FYLGIHLUTAGRIND", einVerd: 100.0, weight: 30 },
};

const REKKAR_PACK_SIZES = {
  rammar: 50,
  golf: 40,
  handrid: 40,
};

/** Main calculation */
export function calculateVinnupallarFromDerived(
  derived: DerivedInputs, 
  vatRate: number = 0.24,
  rentalDays: number = 1
): ScaffoldResult {
  const hlidarCount = derived.hlidir.length;
  
  // Aggregate totals across all hliðar
  const totals = {
    rammar2m: 0,
    rammar07m: 0,
    golfbord: 0,
    stigapallar: 0,
    lappir: 0,
    handrid: 0,
    handridastodir: 0,
    veggfestingar: 0,
    endahandrid: 0,
    klemmur: 0,
    splitti: 0,
  };

  // Track if any hlið has 0.7m frames (for stigar type)
  let maxFullLevels = 0;
  let hasAny07mLevel = false;

  // Calculate per-hlið (like Excel P1, P2, P3...)
  for (let i = 0; i < derived.hlidir.length; i++) {
    const hlid = derived.hlidir[i];
    const bays = hlid.einingafjoldi;
    const fullLevels = hlid.fjoldi2mHaeda;
    const extra07 = hlid.fjoldi0_7mHaeda;
    const totalLevels = fullLevels + extra07;
    const endalokana = 2; // Each hlið gets 2 end closures (safety)
    const isFirstHlid = i === 0;

    // Component quantities for this hlið
    const rammar2m = calculateRammar2m(bays, fullLevels);
    const rammar07m = calculateRammar07m(bays, extra07);
    const stigapallar = isFirstHlid ? calculateStigapallar(totalLevels) : 0;
    const golfbord = calculateGolfbord(bays, totalLevels, stigapallar);
    const lappir = calculateLappir(bays);
    const handrid = calculateHandrid(bays, totalLevels);
    const handridastodir = calculateHandridastodir(bays, endalokana);
    const veggfestingar = calculateVeggfestingar();
    const endahandrid = calculateEndahandrid(endalokana, totalLevels);
    const klemmur = calculateKlemmur();
    const splitti = calculateSplitti(rammar2m + rammar07m);

    // Add to totals
    totals.rammar2m += rammar2m;
    totals.rammar07m += rammar07m;
    totals.golfbord += golfbord;
    totals.stigapallar += stigapallar;
    totals.lappir += lappir;
    totals.handrid += handrid;
    totals.handridastodir += handridastodir;
    totals.veggfestingar += veggfestingar;
    totals.endahandrid += endahandrid;
    totals.klemmur += klemmur;
    totals.splitti += splitti;

    maxFullLevels = Math.max(maxFullLevels, fullLevels);
    if (extra07 > 0) hasAny07mLevel = true;
  }

  // Stigar: 2.0m for each 2m level, minus 1 if 2.7m exists (replaces one 2m)
  const stigar27m = hasAny07mLevel ? 1 : 0;
  const stigar2m = Math.max(0, maxFullLevels - stigar27m);

  // Build quantities map
  const quantities: Record<string, number> = {
    "97100000": totals.rammar2m,
    "97100001": totals.rammar07m,
    "97100002": totals.golfbord,
    "97100003": totals.stigapallar,
    "97100004": stigar2m,
    "97100005": stigar27m,
    "97100006": totals.lappir,
    "971000101": totals.handrid,
    "97100011": totals.handridastodir,
    "97100012": totals.veggfestingar,
    "97100015": totals.klemmur,
    "97100017": totals.endahandrid,
    "97100020": totals.splitti,
    // Racks
    "971000212": calculateRekkar(totals.rammar2m + totals.rammar07m, REKKAR_PACK_SIZES.rammar),
    "97100077": calculateRekkar(totals.golfbord + totals.stigapallar, REKKAR_PACK_SIZES.golf),
    "971000109": calculateRekkar(totals.handrid, REKKAR_PACK_SIZES.handrid),
  };

  // Build items list
  const items: ScaffoldItem[] = [];
  let dailyTotalExVat = 0;

  for (const saluvorn in quantities) {
    const qty = quantities[saluvorn];
    const catalog = ITEM_CATALOG[saluvorn];
    
    if (catalog && qty > 0) {
      const linuSamtals = qty * catalog.einVerd;
      dailyTotalExVat += linuSamtals;
      
      items.push({
        saluvorn,
        leigunumer: catalog.leigunumer,
        heiti: catalog.heiti,
        quantitiesPerPallur: {},
        samtals: qty,
        einVerd: catalog.einVerd,
        linuSamtals,
      });
    }
  }

  // Calculate totals with VAT
  const dailyTotalWithVat = dailyTotalExVat * (1 + vatRate);
  const monthlyTotalWithVat = dailyTotalWithVat * 30;

  // Calculate total area
  let totalFermetrar = 0;
  for (const hlid of derived.hlidir) {
    const totalLevels = hlid.fjoldi2mHaeda + hlid.fjoldi0_7mHaeda;
    if (totalLevels > 0) {
      totalFermetrar += hlid.einingafjoldi * BAY_LENGTH_M * totalLevels * 3;
    }
  }

  return {
    pallar: [],
    totalFermetrar: Math.round(totalFermetrar),
    items,
    samtalseDaglegaMedVsk: Math.round(dailyTotalWithVat),
    manadarlega30dMedVsk: Math.round(monthlyTotalWithVat),
    vsk: vatRate,
  };
}

/** Calculations for P1/P2 */
export function calculateVinnupallar(pallar: PallurInput[]): ScaffoldResult {
  const config = VINNUPALLAR_CONFIG;
  const pallurResults: PallurResult[] = [];
  
  // Aggregate totals
  const totals = {
    rammar2m: 0,
    rammar07m: 0,
    golfbord: 0,
    stigapallar: 0,
    lappir: 0,
    handrid: 0,
    handridastodir: 0,
    veggfestingar: 0,
    endahandrid: 0,
    klemmur: 0,
    splitti: 0,
  };

  let totalFermetrar = 0;
  let maxFullLevels = 0;
  let hasAny07mLevel = false;

  for (let i = 0; i < pallar.length; i++) {
    const input = pallar[i];
    const bays = input.einingafjoldi;
    const fullLevels = input.fjoldi2mHaeda;
    const extra07 = input.fjoldi0_7mHaeda;
    const totalLevels = fullLevels + extra07;
    const endalokana = 2; // Each platform gets 2 end closures
    const isFirstPallur = i === 0;

    // Calculate area
    const fermetrafjoldi = calculateFermetrafjoldi(input);
    totalFermetrar += fermetrafjoldi;

    // Component quantities
    const rammar2m = calculateRammar2m(bays, fullLevels);
    const rammar07m = calculateRammar07m(bays, extra07);
    const stigapallar = isFirstPallur ? calculateStigapallar(totalLevels) : 0;
    const golfbord = calculateGolfbord(bays, totalLevels, stigapallar);
    const lappir = calculateLappir(bays);
    const handrid = calculateHandrid(bays, totalLevels);
    const handridastodir = calculateHandridastodir(bays, endalokana);
    const veggfestingar = calculateVeggfestingar();
    const endahandrid = calculateEndahandrid(endalokana, totalLevels);
    const klemmur = calculateKlemmur();
    const splitti = calculateSplitti(rammar2m + rammar07m);

    // Add to totals
    totals.rammar2m += rammar2m;
    totals.rammar07m += rammar07m;
    totals.golfbord += golfbord;
    totals.stigapallar += stigapallar;
    totals.lappir += lappir;
    totals.handrid += handrid;
    totals.handridastodir += handridastodir;
    totals.veggfestingar += veggfestingar;
    totals.endahandrid += endahandrid;
    totals.klemmur += klemmur;
    totals.splitti += splitti;

    maxFullLevels = Math.max(maxFullLevels, fullLevels);
    if (extra07 > 0) hasAny07mLevel = true;

    pallurResults.push({
      pallurNr: input.pallurNr,
      fermetrafjoldi,
      items: [],
    });
  }

  // ladder calculation
  const stigar27m = hasAny07mLevel ? 1 : 0;
  const stigar2m = Math.max(0, maxFullLevels - stigar27m);

  // Build quantities map
  const quantities: Record<string, number> = {
    "97100000": totals.rammar2m,
    "97100001": totals.rammar07m,
    "97100002": totals.golfbord,
    "97100003": totals.stigapallar,
    "97100004": stigar2m,
    "97100005": stigar27m,
    "97100006": totals.lappir,
    "971000101": totals.handrid,
    "97100011": totals.handridastodir,
    "97100012": totals.veggfestingar,
    "97100015": totals.klemmur,
    "97100017": totals.endahandrid,
    "97100020": totals.splitti,
    "971000212": calculateRekkar(totals.rammar2m + totals.rammar07m, REKKAR_PACK_SIZES.rammar),
    "97100077": calculateRekkar(totals.golfbord + totals.stigapallar, REKKAR_PACK_SIZES.golf),
    "971000109": calculateRekkar(totals.handrid, REKKAR_PACK_SIZES.handrid),
  };

  // Build items list
  const items: ScaffoldItem[] = [];
  let dailyTotalExVat = 0;

  for (const saluvorn in quantities) {
    const qty = quantities[saluvorn];
    const catalog = ITEM_CATALOG[saluvorn];
    
    if (catalog && qty > 0) {
      const linuSamtals = qty * catalog.einVerd;
      dailyTotalExVat += linuSamtals;
      
      items.push({
        saluvorn,
        leigunumer: catalog.leigunumer,
        heiti: catalog.heiti,
        quantitiesPerPallur: {},
        samtals: qty,
        einVerd: catalog.einVerd,
        linuSamtals,
      });
    }
  }

  const dailyTotalWithVat = dailyTotalExVat * (1 + config.vsk);
  const monthlyTotalWithVat = dailyTotalWithVat * 30;

  return {
    pallar: pallurResults,
    totalFermetrar,
    items,
    samtalseDaglegaMedVsk: Math.round(dailyTotalWithVat),
    manadarlega30dMedVsk: Math.round(monthlyTotalWithVat),
    vsk: config.vsk,
  };
}
