/**
 * Steypuverkfæri (Concrete Formwork Tools) Calculator Exports
 * 
 * Combined calculator for:
 * - Loftastoðir (Shoring Props)
 * - Undirsláttur (HT-20 Formwork Beams)
 */

export { Steypuverkfaeri } from "./steypuverkfaeri";
export { useCalculateProps, useCalculateBeams } from "./calculator";
export {
  loftastodir,
  motabitar,
  thicknessOptions,
  spacingOptions,
  undirslatturThicknessOptions,
  beamSpacingOptions,
  spanLimits,
  ENGINEERING_CONSTANTS,
  CALCULATOR_TYPES,
} from "./configuration";
export type {
  CalculatorType,
  Loftastod,
  Motabiti,
  LoftastodirConfiguration,
  UndirslatturConfiguration,
  LoftastodirResult,
  UndirslatturResult,
} from "./interface";
