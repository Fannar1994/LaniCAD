import { useMemo } from "react";
import type { 
  Configuration, 
  PanelType, 
  WallInput, 
  FacePanelUsage, 
  WallPanelResult 
} from "./interface";
import { ALL_MANTO_PRODUCTS } from "./configuration";

/**
 * Calculate number of days between two dates (inclusive)
 */
export function calculateDaysBetween(
  startDate: string,
  endDate: string
): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");

  const timeDiff = end.getTime() - start.getTime();
  return Math.max(1, Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * Parse panel dimensions from product name
 * E.g., "Flekar 240x300" → { widthM: 2.4, heightM: 3.0 }
 */
export function parsePanelDimensions(panelName: string): { widthM: number; heightM: number } | null {
  // Match patterns like "240x300", "120x300", "75x120"
  const match = panelName.match(/(\d+)x(\d+)/);
  if (!match) return null;
  
  const widthCm = parseInt(match[1], 10);
  const heightCm = parseInt(match[2], 10);
  
  return {
    widthM: widthCm / 100,
    heightM: heightCm / 100,
  };
}

/**
 * Convert MantoProduct to PanelType with parsed dimensions
 */
export function createPanelType(rentalCode: string, name: string, areaM2: number): PanelType | null {
  const dimensions = parsePanelDimensions(name);
  if (!dimensions) return null;
  
  return {
    code: rentalCode,
    widthM: dimensions.widthM,
    heightM: dimensions.heightM,
    areaM2,
  };
}

/**
 * Design panel layout for ONE face of a wall using greedy width-first packing.
 * This function calculates the panels needed to cover one side of a wall.
 * For double-sided walls, this result must be multiplied by 2.
 * 
 * Algorithm:
 * 1. Sort panels by width (largest first) for greedy packing
 * 2. Pack panels horizontally along wall length
 * 3. Calculate number of vertical rows based on wall height
 * 4. Return panel counts for ONE face only
 * 
 * @param wall - Wall dimensions and configuration
 * @param panels - Available panel types sorted by width descending
 * @returns Panel usage for ONE face only
 */
export function designFacePanels(
  wall: WallInput,
  panels: PanelType[]
): FacePanelUsage[] {
  // Validate inputs
  if (wall.lengthM <= 0 || wall.heightM <= 0) {
    throw new Error(`Invalid wall dimensions: ${wall.lengthM}m × ${wall.heightM}m`);
  }
  
  if (panels.length === 0) {
    throw new Error("No panels available for calculation");
  }
  
  // Sort panels by width descending for greedy packing
  const sortedPanels = [...panels].sort((a, b) => b.widthM - a.widthM);
  
  // Step 1: Pack panel widths along wall length (greedy largest-first)
  const widthUsage: Record<string, number> = {};
  let remainingLength = wall.lengthM;
  
  while (remainingLength > 0.01) { // Small tolerance for floating point
    let placed = false;
    
    for (const panel of sortedPanels) {
      if (panel.widthM <= remainingLength + 0.01) {
        // Use this panel
        widthUsage[panel.code] = (widthUsage[panel.code] || 0) + 1;
        remainingLength -= panel.widthM;
        placed = true;
        break;
      }
    }
    
    // If no panel fits, force the smallest panel
    if (!placed) {
      const smallest = sortedPanels[sortedPanels.length - 1];
      widthUsage[smallest.code] = (widthUsage[smallest.code] || 0) + 1;
      remainingLength = 0;
    }
  }
  
  // Step 2: Calculate vertical rows based on panel height
  // Assume all panels have the same height (e.g., 300cm or 120cm)
  const panelHeight = sortedPanels[0].heightM;
  const rowsNeeded = Math.ceil(wall.heightM / panelHeight);
  
  // Step 3: Multiply width pattern by number of rows
  const result: FacePanelUsage[] = [];
  
  for (const panelCode of Object.keys(widthUsage)) {
    const countPerRow = widthUsage[panelCode];
    result.push({
      panelCode,
      countPerFace: countPerRow * rowsNeeded,
    });
  }
  
  return result;
}

/**
 * Compute total panel requirements for a wall, accounting for double-sided formwork.
 * 
 * CRITICAL RULE: For double-sided walls, panels must be calculated per face first,
 * then multiplied by 2. This ensures:
 * - Even panel counts (never odd)
 * - Physical accuracy (mirror image on both sides)
 * - Correct material ordering
 * 
 * @param wall - Wall configuration
 * @param panels - Available panel types
 * @returns Complete panel result with per-face and total counts
 * @throws Error if double-sided wall has odd panel counts (validation failure)
 */
export function computeWallPanels(
  wall: WallInput,
  panels: PanelType[]
): WallPanelResult {
  // Step 1: Design ONE face
  const perFace = designFacePanels(wall, panels);
  
  // Step 2: Determine multiplier (1 for single-sided, 2 for double-sided)
  const sides = wall.doubleSided ? 2 : 1;
  
  // Step 3: Multiply by sides
  const totalForProject: FacePanelUsage[] = perFace.map(usage => ({
    panelCode: usage.panelCode,
    countPerFace: usage.countPerFace * sides,
  }));
  
  // Step 4: Validate - double-sided walls must have even counts
  if (wall.doubleSided) {
    for (const usage of totalForProject) {
      if (usage.countPerFace % 2 !== 0) {
        throw new Error(
          `Validation failed for wall ${wall.id}: Panel ${usage.panelCode} has odd count ${usage.countPerFace} on double-sided wall. ` +
          `This should never happen - check calculation logic.`
        );
      }
    }
  }
  
  return {
    wallId: wall.id,
    perFace,
    totalForProject,
  };
}

/**
 * Calculate required quantities based on square meters and formwork height
 * 
 * TODO: This is a simplified calculation. The actual Excel logic should be
 * reverse-engineered from "Leigutilboð Manto.xlsx" to determine:
 * - How panel quantities are calculated from m² and height
 * - Ratios of different panel sizes
 * - Connector and accessory quantities per m²
 * - Any optimization algorithms for panel selection
 */
export function calculateMantoQuantities(
  squareMeters: number,
  height: number
) {
  // Simplified calculation - replace with actual Excel logic
  const totalPanelArea = squareMeters;
  
  // Basic estimation: use primarily 240x300 panels (7.2 m²)
  // with smaller panels for remaining areas
  const panel240Count = Math.floor(totalPanelArea / 7.2);
  const remainingArea = totalPanelArea - (panel240Count * 7.2);
  
  // Use 120x300 panels for remaining
  const panel120Count = Math.ceil(remainingArea / 3.6);
  
  // Connectors: approximately 4 clamps per panel
  const straightClamps = (panel240Count + panel120Count) * 4;
  
  // Ties: approximately 6 per m² based on typical formwork practice
  const ties = Math.ceil(squareMeters * 6);
  
  // Walers: approximately 1 per 3m of height per linear meter
  const walers = Math.ceil(squareMeters * (height / 3));
  
  return {
    panels: {
      panel_240x300: panel240Count,
      panel_120x300: panel120Count,
    },
    connectors: {
      straight_clamps: straightClamps,
      ties_dw15: ties,
      walers_100cm: walers,
    },
    accessories: {
      // Basic accessories per setup
      working_platform_brackets: Math.ceil(squareMeters / 20),
      braces: Math.ceil(squareMeters / 10),
      crane_hooks: Math.ceil(panel240Count / 5),
    },
  };
}

/**
 * Main calculation hook for Manto formwork rental
 */
export function useCalculateProductList(config: Configuration) {
  return useMemo(() => {
    const squareMeters = parseFloat(config.totalSquareMeters) || 0;
    const height = parseFloat(config.formworkHeight) || 3;
    const rentalDays = calculateDaysBetween(
      config.rentalStartDate,
      config.rentalEndDate
    );

    if (squareMeters === 0 || rentalDays === 0) {
      return {
        items: [],
        totalWeight: 0,
        totalArea: 0,
        dailyTotal: 0,
        totalRental: 0,
      };
    }

    // Calculate quantities (TODO: replace with actual Excel logic)
    const quantities = calculateMantoQuantities(squareMeters, height);

    // Build item list
    const items = ALL_MANTO_PRODUCTS.map((product) => {
      // Determine quantity for this product (simplified)
      let quantity = 0;
      
      // TODO: Replace with actual calculation logic from Excel
      if (product.rentalCode === "01-MÓT-KM01-996") {
        quantity = quantities.panels.panel_240x300;
      } else if (product.rentalCode === "01-MÓT-KM01-780") {
        quantity = quantities.panels.panel_120x300;
      } else if (product.rentalCode === "01-MÓT-KM21-000") {
        quantity = quantities.connectors.straight_clamps;
      } else if (product.rentalCode === "01-MÓT-AH21-332") {
        quantity = quantities.connectors.ties_dw15;
      }

      const dailyPrice = quantity * product.dailyRentalPrice;
      const totalPrice = dailyPrice * rentalDays;

      return {
        ...product,
        quantity,
        dailyPrice,
        totalPrice,
        totalWeight: quantity * product.weight,
        totalArea: quantity * product.area,
      };
    }).filter(item => item.quantity > 0);

    // Calculate totals
    const totalWeight = items.reduce((sum, item) => sum + item.totalWeight, 0);
    const totalArea = items.reduce((sum, item) => sum + item.totalArea, 0);
    const dailyTotal = items.reduce((sum, item) => sum + item.dailyPrice, 0);
    const totalRental = dailyTotal * rentalDays;

    return {
      items,
      totalWeight,
      totalArea,
      dailyTotal,
      totalRental,
      rentalDays,
    };
  }, [config]);
}
