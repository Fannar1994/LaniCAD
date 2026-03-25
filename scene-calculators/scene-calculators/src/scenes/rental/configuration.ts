import type { FenceItemPricing, ScaffoldPricingTier, PricingTier } from "./interface";

// Minimum rental days
export const MIN_RENTAL_DAYS = 10;

// Fence rental configurations
export const FENCE_DIMENSION_MAPPING: Record<string, string> = {
  "3.5_2.0_1.1": "01-BAT-GI01-015",
  "3.5_2.0_1.7": "01-BAT-GI01-053",
  "3.5_1.2_1.1": "01-BAT-GI01-052",
};

export const FENCE_PRICING: Record<string, Record<PricingTier, number>> = {
  // Worksite fences
  "01-BAT-GI01-015": { // 3500X2000X1.1mm
    "1-30": 90,
    "30-60": 45,
    "60-90": 22,
    "90-120": 11,
    "120+": 11,
  },
  "01-BAT-GI01-052": { // 3500X1200X1.1mm
    "1-30": 72,
    "30-60": 36,
    "60-90": 18,
    "90-120": 9,
    "120+": 9,
  },
  "01-BAT-GI01-053": { // 3500X2000X1.7mm
    "1-30": 90,
    "30-60": 45,
    "60-90": 22,
    "90-120": 11,
    "120+": 11,
  },
  "01-BAT-GI01-0541": { // PVC Stones
    "1-30": 40,
    "30-60": 20,
    "60-90": 10,
    "90-120": 5,
    "120+": 5,
  },
  "01-BAT-GI01-054": { // Concrete Stones
    "1-30": 16,
    "30-60": 8,
    "60-90": 4,
    "90-120": 2,
    "120+": 2,
  },
  "01-BAT-GI01-097": { // Fence Clamps
    "1-30": 1,
    "30-60": 1,
    "60-90": 0,
    "90-120": 0,
    "120+": 0,
  },
  // Crowd control fences
  "01-BAT-GI01-050": { // 2500x1200mm
    "1-30": 120,
    "30-60": 60,
    "60-90": 30,
    "90-120": 15,
    "120+": 15,
  },
  // Traffic barriers
  "01-BAT-VE01-265": { // Red
    "1-30": 180,
    "30-60": 90,
    "60-90": 45,
    "90-120": 22,
    "120+": 22,
  },
  "01-BAT-VE01-260": { // White
    "1-30": 180,
    "30-60": 90,
    "60-90": 45,
    "90-120": 22,
    "120+": 22,
  },
};

// Scaffold rental configurations - Narrow scaffolds (0.75m)
export const NARROW_SCAFFOLD_PRICING: Record<string, ScaffoldPricingTier> = {
  "2.5": { "24h": 4717, extra: 2359, week: 11794, deposit: 10000 },
  "3.5": { "24h": 5942, extra: 2971, week: 14855, deposit: 12000 },
  "4.5": { "24h": 7620, extra: 3810, week: 19051, deposit: 15000 },
  "5.5": { "24h": 8845, extra: 4423, week: 22113, deposit: 16500 },
  "6.5": { "24h": 10524, extra: 5262, week: 26309, deposit: 19500 },
  "7.5": { "24h": 11748, extra: 5874, week: 29371, deposit: 21000 },
  "8.5": { "24h": 13427, extra: 6713, week: 33566, deposit: 24000 },
  "9.5": { "24h": 15649, extra: 7825, week: 39123, deposit: 25000 },
  "10.5": { "24h": 16647, extra: 8324, week: 41618, deposit: 28000 },
};

// Scaffold rental configurations - Wide scaffolds (1.35m)
export const WIDE_SCAFFOLD_PRICING: Record<string, ScaffoldPricingTier> = {
  "2.5": { "24h": 5443, extra: 2722, week: 13608, deposit: 12000 },
  "3.5": { "24h": 6713, extra: 3357, week: 16783, deposit: 14000 },
  "4.5": { "24h": 8346, extra: 4173, week: 20866, deposit: 17000 },
  "5.5": { "24h": 9616, extra: 4808, week: 24041, deposit: 19000 },
  "6.5": { "24h": 11249, extra: 5625, week: 28123, deposit: 22000 },
  "7.5": { "24h": 12519, extra: 6260, week: 31298, deposit: 24000 },
  "8.5": { "24h": 14152, extra: 7076, week: 35381, deposit: 27000 },
  "9.5": { "24h": 16330, extra: 8165, week: 40824, deposit: 28000 },
  "10.5": { "24h": 17373, extra: 8686, week: 43432, deposit: 31000 },
};

// Quicky scaffold pricing
export const QUICKY_PRICING: ScaffoldPricingTier = {
  "24h": 4082,
  extra: 2041,
  week: 10206,
  deposit: 10000,
};

// Support legs pricing
export const SUPPORT_LEGS_PRICING: ScaffoldPricingTier = {
  "24h": 453,
  extra: 227,
  week: 1134,
  deposit: 0,
};

// Scaffold material quantities by height
export const SCAFFOLD_MATERIALS: Record<string, Record<string, number>> = {
  "01-PAL-HP01-106": { // Álrammar B1 2,1M
    "2.5": 2, "3.5": 4, "4.5": 4, "5.5": 6, "6.5": 6, "7.5": 8, "8.5": 8, "9.5": 10, "10.5": 10,
  },
  "01-PAL-HP01-107": { // Álrammar B5 1,05M
    "2.5": 2, "3.5": 0, "4.5": 2, "5.5": 0, "6.5": 2, "7.5": 0, "8.5": 2, "9.5": 0, "10.5": 2,
  },
  "01-PAL-HP01-117": { // Gólfborð M/Opi PB25
    "2.5": 1, "3.5": 1, "4.5": 2, "5.5": 2, "6.5": 3, "7.5": 3, "8.5": 4, "9.5": 5, "10.5": 5,
  },
  "01-PAL-HP01-108": { // Handrið H25
    "2.5": 4, "3.5": 4, "4.5": 6, "5.5": 6, "6.5": 8, "7.5": 8, "8.5": 10, "9.5": 12, "10.5": 14,
  },
  "01-PAL-HP01-109": { // Skástífur D25
    "2.5": 4, "3.5": 8, "4.5": 8, "5.5": 12, "6.5": 12, "7.5": 16, "8.5": 16, "9.5": 20, "10.5": 20,
  },
  "01-PAL-HP01-111": { // Hjól 200MM
    "2.5": 4, "3.5": 4, "4.5": 4, "5.5": 4, "6.5": 4, "7.5": 4, "8.5": 4, "9.5": 4, "10.5": 4,
  },
  "01-PAL-HP01-115": { // Álstífur Stillanlegar (only for heights 4.5m+)
    "4.5": 2, "5.5": 2, "6.5": 2, "7.5": 2, "8.5": 2, "9.5": 2, "10.5": 2,
  },
};

// Quicky scaffold materials
export const QUICKY_MATERIALS = [
  { itemno: "01-PAL-HP01-127", name: "Quickly Grunneining Án Hjóla", qty: 1 },
  { itemno: "01-PAL-HP01-126", name: "Gólfborð M/Opi PB20", qty: 1 },
  { itemno: "01-PAL-HP01-124", name: "Handrið H20", qty: 2 },
  { itemno: "01-PAL-HP01-107", name: "Álrammar B5 1,05M", qty: 2 },
];

// Material names for SKUs
export const MATERIAL_NAMES: Record<string, string> = {
  "01-PAL-HP01-106": "Álrammar B1 2,1M",
  "01-PAL-HP01-107": "Álrammar B5 1,05M",
  "01-PAL-HP01-117": "Gólfborð M/Opi PB25",
  "01-PAL-HP01-108": "Handrið H25",
  "01-PAL-HP01-109": "Skástífur D25",
  "01-PAL-HP01-111": "Hjól 200MM",
  "01-PAL-HP01-115": "Stuðningsfætur Stillanlegar",
  "01-PAL-HP01-127": "Quickly Grunneining Án Hjóla",
  "01-PAL-HP01-126": "Gólfborð M/Opi PB20",
  "01-PAL-HP01-124": "Handrið H20",
};
