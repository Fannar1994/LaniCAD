// Types and interfaces for scaffold calculator

// Input for a single scaffold platform
export interface PallurInput {
  pallurNr: number; // Platform number (1-20)
  einingafjoldi: number; // Number of bays/sections
  fjoldi2mHaeda: number; // Count of 2.0m frame heights
  fjoldi0_7mHaeda: number; // Count of 0.7m frame heights
  haestaStandhaed: number; // Highest standing height in meters
  mestaVinnuhaed: number; // Max working height in meters
  fjoldiEndalokana: number; // Number of end closures/handrails
}

export type EndClosureType = "none" | "one-end" | "both-ends";

// Geometric input for a scaffold side
export interface HlidInput {
  id: string; // e.g., "Hlið 1", "Hlið 2"
  lengthM: number; // Lengd í metrum (wall length)
  workingHeightM: number; // Mesta vinnuhæð (top deck / work level)
  standHeightM: number; // Hæsta standhæð (frame height, below working height)
  endClosure: EndClosureType;
}

// Derived values from Side input
export interface HlidDerivedValues {
  hlidId: string;
  einingafjoldi: number; // Number of bays (calculated from lengthM)
  fjoldi2mHaeda: number; // Number of 2m frame levels (calculated from standHeightM)
  fjoldi0_7mHaeda: number; // Number of 0.7m frame levels (calculated from standHeightM)
  fjoldiEndalokana: number; // Number of end closures (from endClosure)
  lengthM: number; // Original length
  standHeightM: number; // Original stand height
  workingHeightM: number;
}

// Aggregated inputs from all sides
export interface DerivedInputs {
  hlidir: HlidDerivedValues[]; // Individual side calculations
  einingafjoldiTotal: number; // Total bays across all sides
  fjoldi2mHaedaTotal: number; // Total 2m frame levels
  fjoldi0_7mHaedaTotal: number; // Total 0.7m frame levels
  fjoldiEndalokanaTotal: number; // Total end closures
  maxStandHeightM: number; // Maximum stand height across all sides
  maxWorkingHeightM: number;
}

// A single scaffold item with quantities
export interface ScaffoldItem {
  saluvorn: string; // Sales item number (e.g., "97100000")
  leigunumer: string; // Rental code (e.g., "01-PAL-VP01-000")
  heiti: string; // Item description (e.g., "RAMMAR 2,0M")
  quantitiesPerPallur: Record<number, number>; // Platform number -> quantity
  samtals: number; // Total quantity across all platforms
  einVerd: number; // Unit price (daily rental)
  linuSamtals: number; // Line total (quantity * unit price)
  weight?: number; // Weight in kg
  area?: number;
}

// Result for a single platform
export interface PallurResult {
  pallurNr: number;
  fermetrafjoldi: number; // Square meters for this platform
  items: ScaffoldItem[];
}

// Complete calculation result
export interface ScaffoldResult {
  pallar: PallurResult[]; // Results per platform
  totalFermetrar: number; // Total square meters across all platforms
  items: ScaffoldItem[]; // All items with aggregated quantities
  samtalseDaglegaMedVsk: number; // Total daily rental with VAT
  manadarlega30dMedVsk: number; // Monthly rental (30 days) with VAT
  vsk: number;
}

// Component configuration
export interface ScaffoldComponentConfig {
  saluvorn: string;
  leigunumer: string;
  heiti: string;
  einVerd: number;
  weight?: number;
  area?: number;
  calculateQuantity: (input: PallurInput) => number;
}

export enum ComponentCategory {
  FRAMES = "Rammar",
  DECKS = "Gólfborð",
  HANDRAILS = "Handrið",
  SUPPORTS = "Stoðir",
  ACCESSORIES = "Aukahlutir",
}

// Main configuration
export interface VinnupallarConfiguration {
  vsk: number; // VAT rate
  maxPallar: number; // Maximum number of platforms supported
  components: ScaffoldComponentConfig[];
}
