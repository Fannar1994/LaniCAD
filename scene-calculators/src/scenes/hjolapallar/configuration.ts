import type {
  ScaffoldTypeConfig,
  HeightConfig,
  HeightOption,
  RentalPricing,
  ScaffoldProduct,
} from "./interface";

export const SCAFFOLD_TYPES: ScaffoldTypeConfig[] = [
  {
    id: "narrow",
    name: "Hjólapallur mjór",
    description: "0.75m breidd",
    width: "0.75m",
  },
  {
    id: "wide",
    name: "Hjólapallur breiður",
    description: "1.35m breidd",
    width: "1.35m",
  },
  {
    id: "quickly",
    name: "Quickly pallur",
    description: "Standhæð/vinnuhæð 2.0/4.0 mtr.",
    width: "Compact",
  },
];

// Height options for narrow and wide scaffolds
export const HEIGHT_OPTIONS: Record<HeightOption, HeightConfig> = {
  "2.5": {
    standHeight: "2.5m",
    workingHeight: "4.5m",
    label: "Standhæð/vinnuhæð 2.5/4.5 mtr.",
  },
  "3.5": {
    standHeight: "3.5m",
    workingHeight: "5.5m",
    label: "Standhæð/vinnuhæð 3.5/5.5 mtr.",
  },
  "4.5": {
    standHeight: "4.5m",
    workingHeight: "6.5m",
    label: "Standhæð/vinnuhæð 4.5/6.5 mtr.",
  },
  "5.5": {
    standHeight: "5.5m",
    workingHeight: "7.5m",
    label: "Standhæð/vinnuhæð 5.5/7.5 mtr.",
  },
  "6.5": {
    standHeight: "6.5m",
    workingHeight: "8.5m",
    label: "Standhæð/vinnuhæð 6.5/8.5 mtr.",
  },
  "7.5": {
    standHeight: "7.5m",
    workingHeight: "9.5m",
    label: "Standhæð/vinnuhæð 7.5/9.5 mtr.",
  },
  "8.5": {
    standHeight: "8.5m",
    workingHeight: "10.5m",
    label: "Standhæð/vinnuhæð 8.5/10.5 mtr.",
  },
  "9.5": {
    standHeight: "9.5m",
    workingHeight: "11.5m",
    label: "Standhæð/vinnuhæð 9.5/11.5 mtr.",
  },
  "10.5": {
    standHeight: "10.5m",
    workingHeight: "12.5m",
    label: "Standhæð/vinnuhæð 10.5/12.5 mtr.",
  },
};

// Rental pricing for narrow scaffold (0.75m)
export const NARROW_SCAFFOLD_PRICING: Record<HeightOption, RentalPricing> = {
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

// Rental pricing for wide scaffold (1.35m)
export const WIDE_SCAFFOLD_PRICING: Record<HeightOption, RentalPricing> = {
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

// Rental pricing for Quickly scaffold
export const QUICKLY_PRICING: RentalPricing = {
  "24h": 4082,
  extra: 2041,
  week: 10206,
  deposit: 10000,
};

// Support legs pricing (separate rental item)
export const SUPPORT_LEGS_PRICING: RentalPricing = {
  "24h": 453,
  extra: 227,
  week: 1134,
  deposit: 0, // No separate deposit for support legs
};

// Scaffold component products
export const SCAFFOLD_PRODUCTS: ScaffoldProduct[] = [
  // Aluminum frames B1 2.1m (varies by height)
  {
    itemno: "01-PAL-HP01-106",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Álrammar B1 2,1m",
    quantities: {
      "2.5": 2,
      "3.5": 4,
      "4.5": 4,
      "5.5": 6,
      "6.5": 6,
      "7.5": 8,
      "8.5": 8,
      "9.5": 10,
      "10.5": 10,
    },
  },
  // Aluminum frames B5 1.05m (varies by height)
  {
    itemno: "01-PAL-HP01-107",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Álrammar B5 1,05m",
    quantities: {
      "2.5": 2,
      "3.5": 0,
      "4.5": 2,
      "5.5": 0,
      "6.5": 2,
      "7.5": 0,
      "8.5": 2,
      "9.5": 0,
      "10.5": 2,
    },
  },
  // Floor board with opening PB25 (varies by height)
  {
    itemno: "01-PAL-HP01-117",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Gólfborð M/Opi PB25",
    quantities: {
      "2.5": 1,
      "3.5": 1,
      "4.5": 2,
      "5.5": 2,
      "6.5": 3,
      "7.5": 3,
      "8.5": 4,
      "9.5": 5,
      "10.5": 5,
    },
  },
  // Handrail H25 (varies by height)
  {
    itemno: "01-PAL-HP01-108",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Handrið H25",
    quantities: {
      "2.5": 4,
      "3.5": 4,
      "4.5": 6,
      "5.5": 6,
      "6.5": 8,
      "7.5": 8,
      "8.5": 10,
      "9.5": 12,
      "10.5": 14,
    },
  },
  // Diagonal brace D25 (varies by height)
  {
    itemno: "01-PAL-HP01-109",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Skástífur D25",
    quantities: {
      "2.5": 4,
      "3.5": 8,
      "4.5": 8,
      "5.5": 12,
      "6.5": 12,
      "7.5": 16,
      "8.5": 16,
      "9.5": 20,
      "10.5": 20,
    },
  },
  // Adjustable foot with wheel (fixed quantity: 4)
  {
    itemno: "01-PAL-HP01-112",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Stillanl.fætur f/hjól",
    quantities: {
      "2.5": 4,
      "3.5": 4,
      "4.5": 4,
      "5.5": 4,
      "6.5": 4,
      "7.5": 4,
      "8.5": 4,
      "9.5": 4,
      "10.5": 4,
    },
  },
  // Wheel 200mm (fixed quantity: 4)
  {
    itemno: "01-PAL-HP01-111",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Hjól 200mm",
    quantities: {
      "2.5": 4,
      "3.5": 4,
      "4.5": 4,
      "5.5": 4,
      "6.5": 4,
      "7.5": 4,
      "8.5": 4,
      "9.5": 4,
      "10.5": 4,
    },
  },
  // Adjustable aluminum legs (for heights 4.5m and above)
  {
    itemno: "01-PAL-HP01-115",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Álstífur Stillanlegar",
    quantities: {
      "2.5": 0,
      "3.5": 0,
      "4.5": 2,
      "5.5": 2,
      "6.5": 2,
      "7.5": 2,
      "8.5": 2,
      "9.5": 2,
      "10.5": 2,
    },
  },
  // Support legs (optional add-on, fixed quantity: 2)
  {
    itemno: "01-PAL-HP01-116",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Stuðningsfætur",
    fixedQty: 2,
  },
];

// Quicky scaffold components (fixed configuration)
export const QUICKLY_COMPONENTS: ScaffoldProduct[] = [
  {
    itemno: "01-PAL-HP01-127",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Quickly Grunneining Án Hjóla",
    fixedQty: 1,
  },
  {
    itemno: "01-PAL-HP01-126",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Gólfborð M/Opi PB20",
    fixedQty: 1,
  },
  {
    itemno: "01-PAL-HP01-124",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Handrið H20",
    fixedQty: 2,
  },
  {
    itemno: "01-PAL-HP01-107",
    id: 0, // TODO: Map to BYKO internal ID
    name: "Álrammar B5 1,05m",
    fixedQty: 2,
  },
];

// Minimum rental period (days)
export const MIN_RENTAL_DAYS = 1;

// Product IDs for API queries
export const productIdList = [
  "01-PAL-HP01-106",
  "01-PAL-HP01-107",
  "01-PAL-HP01-117",
  "01-PAL-HP01-108",
  "01-PAL-HP01-109",
  "01-PAL-HP01-112",
  "01-PAL-HP01-111",
  "01-PAL-HP01-115",
  "01-PAL-HP01-116",
  "01-PAL-HP01-127",
  "01-PAL-HP01-126",
  "01-PAL-HP01-124",
];
