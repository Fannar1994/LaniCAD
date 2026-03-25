/**
 * Test file for double-sided wall panel calculation
 * 
 * Run this test to verify:
 * 1. Greedy packing works correctly
 * 2. Double-sided walls always have even panel counts
 * 3. Panel layout matches physical requirements
 */

import type { PanelType, WallInput, WallPanelResult } from "./interface";
import { 
  parsePanelDimensions, 
  createPanelType, 
  designFacePanels, 
  computeWallPanels 
} from "./calculator";

// Test panel types (300cm height)
const TEST_PANELS_300: PanelType[] = [
  { code: "240x300", widthM: 2.4, heightM: 3.0, areaM2: 7.2 },
  { code: "120x300", widthM: 1.2, heightM: 3.0, areaM2: 3.6 },
  { code: "90x300", widthM: 0.9, heightM: 3.0, areaM2: 2.7 },
  { code: "60x300", widthM: 0.6, heightM: 3.0, areaM2: 1.8 },
  { code: "30x300", widthM: 0.3, heightM: 3.0, areaM2: 0.9 },
];

// Test 1: Parse panel dimensions from names
console.log("=== Test 1: Panel Dimension Parsing ===");
const testNames = [
  "Flekar 240x300",
  "Flekar 120x300",
  "Flekar 75x120",
  "Innhorn 35x120",
];

for (const name of testNames) {
  const dims = parsePanelDimensions(name);
  console.log(`${name} → ${dims ? `${dims.widthM}m × ${dims.heightM}m` : "FAILED"}`);
}
console.log();

// Test 2: Single-sided wall (10m × 3m)
console.log("=== Test 2: Single-Sided Wall (10m × 3m) ===");
const singleWall: WallInput = {
  id: "wall-1",
  lengthM: 10.0,
  heightM: 3.0,
  doubleSided: false,
};

const singleResult = computeWallPanels(singleWall, TEST_PANELS_300);
console.log(`Wall: ${singleWall.lengthM}m × ${singleWall.heightM}m (single-sided)`);
console.log("\nPer-face panel layout:");
for (const usage of singleResult.perFace) {
  console.log(`  ${usage.panelCode}: ${usage.countPerFace} panels`);
}
console.log("\nTotal for project:");
for (const usage of singleResult.totalForProject) {
  console.log(`  ${usage.panelCode}: ${usage.countPerFace} panels`);
}

// Verify total width
const totalWidthSingle = singleResult.perFace.reduce((sum, usage) => {
  const panel = TEST_PANELS_300.find(p => p.code === usage.panelCode);
  return sum + (panel!.widthM * usage.countPerFace);
}, 0);
console.log(`\nVerification: Total width = ${totalWidthSingle}m (expected: ${singleWall.lengthM}m)`);
console.log();

// Test 3: Double-sided wall (10m × 3m)
console.log("=== Test 3: Double-Sided Wall (10m × 3m) ===");
const doubleWall: WallInput = {
  id: "wall-2",
  lengthM: 10.0,
  heightM: 3.0,
  doubleSided: true,
};

const doubleResult = computeWallPanels(doubleWall, TEST_PANELS_300);
console.log(`Wall: ${doubleWall.lengthM}m × ${doubleWall.heightM}m (double-sided)`);
console.log("\nPer-face panel layout:");
for (const usage of doubleResult.perFace) {
  console.log(`  ${usage.panelCode}: ${usage.countPerFace} panels`);
}
console.log("\nTotal for project (both sides):");
for (const usage of doubleResult.totalForProject) {
  console.log(`  ${usage.panelCode}: ${usage.countPerFace} panels`);
}

// Verify all counts are even
console.log("\nValidation: Checking for even counts on double-sided wall...");
let allEven = true;
for (const usage of doubleResult.totalForProject) {
  const isEven = usage.countPerFace % 2 === 0;
  console.log(`  ${usage.panelCode}: ${usage.countPerFace} panels → ${isEven ? "✓ EVEN" : "✗ ODD (ERROR!)"}`);
  if (!isEven) allEven = false;
}
console.log(`\nResult: ${allEven ? "✓ ALL EVEN - PASSED" : "✗ HAS ODD COUNTS - FAILED"}`);
console.log();

// Test 4: Wall with height requiring multiple rows (10m × 6m)
console.log("=== Test 4: Tall Wall (10m × 6m, double-sided) ===");
const tallWall: WallInput = {
  id: "wall-3",
  lengthM: 10.0,
  heightM: 6.0,
  doubleSided: true,
};

const tallResult = computeWallPanels(tallWall, TEST_PANELS_300);
console.log(`Wall: ${tallWall.lengthM}m × ${tallWall.heightM}m (double-sided)`);
console.log("Note: 6m height requires 2 rows of 3m panels");
console.log("\nPer-face panel layout:");
for (const usage of tallResult.perFace) {
  console.log(`  ${usage.panelCode}: ${usage.countPerFace} panels`);
}
console.log("\nTotal for project (both sides, 2 rows):");
for (const usage of tallResult.totalForProject) {
  console.log(`  ${usage.panelCode}: ${usage.countPerFace} panels`);
  
  // Verify even
  if (usage.countPerFace % 2 !== 0) {
    console.log(`    ✗ ERROR: Odd count on double-sided wall!`);
  }
}
console.log();

// Test 5: Awkward length (7.5m × 3m, double-sided)
console.log("=== Test 5: Awkward Length (7.5m × 3m, double-sided) ===");
const awkwardWall: WallInput = {
  id: "wall-4",
  lengthM: 7.5,
  heightM: 3.0,
  doubleSided: true,
};

const awkwardResult = computeWallPanels(awkwardWall, TEST_PANELS_300);
console.log(`Wall: ${awkwardWall.lengthM}m × ${awkwardWall.heightM}m (double-sided)`);
console.log("\nPer-face panel layout:");
for (const usage of awkwardResult.perFace) {
  const panel = TEST_PANELS_300.find(p => p.code === usage.panelCode);
  console.log(`  ${usage.panelCode} (${panel!.widthM}m): ${usage.countPerFace} panels`);
}
console.log("\nTotal for project (both sides):");
for (const usage of awkwardResult.totalForProject) {
  const isEven = usage.countPerFace % 2 === 0;
  console.log(`  ${usage.panelCode}: ${usage.countPerFace} panels → ${isEven ? "✓" : "✗ ODD!"}`);
}

// Calculate actual length covered
const coveredLength = awkwardResult.perFace.reduce((sum, usage) => {
  const panel = TEST_PANELS_300.find(p => p.code === usage.panelCode);
  return sum + (panel!.widthM * usage.countPerFace);
}, 0);
console.log(`\nActual length covered: ${coveredLength}m (requested: ${awkwardWall.lengthM}m)`);
console.log();

console.log("=== Tests Complete ===");
