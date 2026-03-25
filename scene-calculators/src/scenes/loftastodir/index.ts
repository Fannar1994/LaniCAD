/**
 * Loftastoðir (Shoring Props) Calculator - Exports
 */

export { Loftastodir } from "./loftastodir";
export { loftastodir, thicknessOptions, spacingOptions, productIdList, ENGINEERING_CONSTANTS } from "./configuration";
export { useCalculateProps, getValidProps, calculateRentalCost } from "./calculator";
export type { Loftastod, Configuration, CalculationResult, ThicknessOption, SpacingOption } from "./interface";

/**
 * Undirsláttur (Mótabitar HT-20) Calculator - Exports
 */

export { Undirslattur } from "./undirslattur";
export { motabitar, undirslatturThicknessOptions, beamSpacingOptions, spanLimits, motabitarProductIdList, BEAM_CONSTANTS } from "./undirslattur-configuration";
export { useCalculateBeams, getValidBeams, getMaxAllowedSpan, calculateBeamRentalCost } from "./undirslattur-calculator";
export type { Motabiti, SpanLimit, UndirslatturConfiguration, UndirslatturResult, BeamSpacingOption } from "./undirslattur-interface";
