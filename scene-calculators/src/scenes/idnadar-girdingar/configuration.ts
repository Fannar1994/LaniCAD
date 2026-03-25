import type { FenceType, HeightOption, ThicknessOption, StoneType } from "./interface";
import type { ProductIdentifier } from "../shared";

export const configuration: {
  fenceTypes: {
    label: string;
    items: FenceType[];
  };
  heights: {
    label: string;
    items: HeightOption[];
  };
  thickness: {
    label: string;
    items: ThicknessOption[];
  };
  stoneTypes: {
    label: string;
    items: StoneType[];
  };
  rental: {
    minDays: number;
  };
} = {
  fenceTypes: {
    label: "Veldu tegund af girðingu",
    items: [
      {
        id: 0,
        label: "Vinnustaðagirðingar",
        value: "worksite",
        unitLength: 3.5,
      },
      {
        id: 1,
        label: "Biðraðagirðingar",
        value: "crowd",
        unitLength: 2.5,
      },
      {
        id: 2,
        label: "Vegatálmi",
        value: "traffic",
        unitLength: 1.5,
      },
    ],
  },
  heights: {
    label: "Hæð í metrum",
    items: [
      {
        id: 0,
        label: "2,0 m",
        value: 2.0,
      },
      {
        id: 1,
        label: "1,2 m",
        value: 1.2,
      },
    ],
  },
  thickness: {
    label: "Þykkt á túbu (mm)",
    items: [
      {
        id: 0,
        label: "1,1 mm",
        value: 1.1,
      },
      {
        id: 1,
        label: "1,7 mm",
        value: 1.7,
      },
    ],
  },
  stoneTypes: {
    label: "Steinar",
    items: [
      {
        id: 0,
        vnr: "0295320",
        productId: 0, // TODO: Map to BYKO internal ID
        label: "Steyptir steinar",
        value: "01-BAT-GI01-054",
      },
      {
        id: 1,
        vnr: "0295325",
        productId: 0, // TODO: Map to BYKO internal ID
        label: "PVC steinar",
        value: "01-BAT-GI01-0541",
      },
    ],
  },
  rental: {
    minDays: 10,
  },
};

// Product article numbers from rental catalog - Idnadar-girdingar
export const productIdList = [
  "0295300",   // Girðingar 3.500x2.000x1,1mm
  "0295317",   // Girðingar 2000x3500x1,7mm
  "0295290",   // Girðingar 1200x3500x1,1mm
  "0295320",   // Steinar f/Girðingar (Leiga)
  "97100100",  // Rekki f/girðingar (25stk)
  "97100096",  // Gönguhlið
  "97100099",  // Hjól f/girðingar
  "97100098",  // Efri Læsing f/Hlið
  "97100052",  // Biðraðagirðingar 3500X1100mm (Leiga)
  "971000529", // Rekki f/biðraðagirðingar (15stk)
  "97100097",  // Klemmur f/girðingar
  "0295401",   // Rennihlíð 3,5m (5 hlutir)
  "0295403",   // Gönguhlíð með karmi og lás (sett)
  "0295325",   // PVC Steinn 23kg f/girðingu
];

export const productsList: Record<string, ProductIdentifier[]> = {
  // Worksite fence panels
  fence_panel_3_5_2_0_1_1: [{ vnr: "0295300", id: 0 }], // 3.5m x 2.0m x 1.1mm
  fence_panel_3_5_2_0_1_7: [{ vnr: "0295317", id: 0 }], // 3.5m x 2.0m x 1.7mm
  fence_panel_3_5_1_2_1_1: [{ vnr: "0295290", id: 0 }], // 3.5m x 1.2m x 1.1mm

  // Plastic fence
  fence_plastic: [{ vnr: "01-BAT-GI01-043", id: 0 }], // Girðing plast 2100x1100mm RA2

  // Stones/Weights
  stones_concrete: [{ vnr: "0295320", id: 0 }], // Steinar f/Girðingar (Leiga)
  stones_pvc: [{ vnr: "0295325", id: 0 }], // PVC Steinn 23kg f/girðingu

  // Accessories
  clamps: [{ vnr: "97100097", id: 0 }], // Klemmur f/girðingar
  clips_25: [{ vnr: "97100100", id: 0 }], // Rekki f/girðingar (25stk)
  gate_walking: [{ vnr: "97100096", id: 0 }], // Gönguhlið
  wheels: [{ vnr: "97100099", id: 0 }], // Hjól f/girðingar
  gate_lock_upper: [{ vnr: "97100098", id: 0 }], // Efri Læsing f/Hlið
  gate_shield: [{ vnr: "01-BAT-GI01-045", id: 0 }], // Gátaskjöldur 1300mm x 310mm

  // Crowd barriers
  crowd_barrier: [{ vnr: "97100052", id: 0 }], // Biðraðagirðingar 3500X1100mm
  crowd_clips_15: [{ vnr: "971000529", id: 0 }], // Rekki f/biðraðagirðingar (15stk)

  // Sales items (not rental)
  sliding_gate: [{ vnr: "0295401", id: 0 }], // Rennihlíð 3,5m (5 hlutir)
  walking_gate_with_frame: [{ vnr: "0295403", id: 0 }], // Gönguhlíð með karmi og lás (sett)
};

// Dimension mapping for fence panel selection
export const dimensionMapping: Record<string, string> = {
  "3.5_2.0_1.1": "fence_panel_3_5_2_0_1_1",
  "3.5_2.0_1.7": "fence_panel_3_5_2_0_1_7",
  "3.5_1.2_1.1": "fence_panel_3_5_1_2_1_1",
};

// Pricing tiers based on rental duration (days)
export const getPriceTier = (days: number): string => {
  if (days <= 30) return "1-30";
  if (days <= 60) return "30-60";
  if (days <= 90) return "60-90";
  if (days <= 120) return "90-120";
  if (days <= 150) return "120-150";
  if (days <= 180) return "150-180";
  if (days <= 210) return "180-210";
  if (days <= 240) return "210-240";
  if (days <= 270) return "240-270";
  if (days <= 300) return "270-300";
  if (days <= 330) return "300-330";
  if (days <= 360) return "330-360";
  return "330-360"; // Max tier
};

// Rental pricing structure from Excel data (ISK with VAT)
export const rentalPricing: Record<string, Record<string, number>> = {
  "01-BAT-GI01-015": {
    // Girðingar 3.500x2.000x1,1mm
    "1-30": 88,
    "30-60": 44,
    "60-90": 22,
    "90-120": 11,
    "120-150": 11,
    "150-180": 11,
    "180-210": 11,
    "210-240": 11,
    "240-270": 11,
    "270-300": 11,
    "300-330": 11,
    "330-360": 11,
  },
  "01-BAT-GI01-053": {
    // Girðingar 2000x3500x1,7mm
    "1-30": 88,
    "30-60": 44,
    "60-90": 22,
    "90-120": 11,
    "120-150": 11,
    "150-180": 11,
    "180-210": 11,
    "210-240": 11,
    "240-270": 11,
    "270-300": 11,
    "300-330": 11,
    "330-360": 11,
  },
  "01-BAT-GI01-052": {
    // Girðingar 1200x3500x1,1mm
    "1-30": 70,
    "30-60": 35,
    "60-90": 18,
    "90-120": 9,
    "120-150": 9,
    "150-180": 9,
    "180-210": 9,
    "210-240": 9,
    "240-270": 9,
    "270-300": 9,
    "300-330": 9,
    "330-360": 9,
  },
  "01-BAT-GI01-043": {
    // Girðing plast 2100x1100mm RA2
    "1-30": 88,
    "30-60": 44,
    "60-90": 22,
    "90-120": 11,
    "120-150": 11,
    "150-180": 11,
    "180-210": 11,
    "210-240": 11,
    "240-270": 11,
    "270-300": 11,
    "300-330": 11,
    "330-360": 11,
  },
  "01-BAT-GI01-054": {
    // Steinar f/Girðingar (Leiga)
    "1-30": 16,
    "30-60": 8,
    "60-90": 4,
    "90-120": 2,
    "120-150": 2,
    "150-180": 2,
    "180-210": 2,
    "210-240": 2,
    "240-270": 2,
    "270-300": 2,
    "300-330": 2,
    "330-360": 2,
  },
  "01-BAT-GI01-100": {
    // Rekki f/girðingar (25stk)
    "1-30": 100,
    "30-60": 100,
    "60-90": 100,
    "90-120": 100,
    "120-150": 100,
    "150-180": 100,
    "180-210": 100,
    "210-240": 100,
    "240-270": 100,
    "270-300": 100,
    "300-330": 100,
    "330-360": 100,
  },
  "01-BAT-GI01-096": {
    // Gönguhlið
    "1-30": 88,
    "30-60": 44,
    "60-90": 22,
    "90-120": 11,
    "120-150": 11,
    "150-180": 11,
    "180-210": 11,
    "210-240": 11,
    "240-270": 11,
    "270-300": 11,
    "300-330": 11,
    "330-360": 11,
  },
  "01-BAT-GI01-099": {
    // Hjól f/girðingar
    "1-30": 100,
    "30-60": 50,
    "60-90": 25,
    "90-120": 13,
    "120-150": 13,
    "150-180": 13,
    "180-210": 13,
    "210-240": 13,
    "240-270": 13,
    "270-300": 13,
    "300-330": 13,
    "330-360": 13,
  },
  "01-BAT-GI01-098": {
    // Efri Læsing f/Hlið
    "1-30": 40,
    "30-60": 20,
    "60-90": 10,
    "90-120": 5,
    "120-150": 5,
    "150-180": 5,
    "180-210": 5,
    "210-240": 5,
    "240-270": 5,
    "270-300": 5,
    "300-330": 5,
    "330-360": 5,
  },
  "01-BAT-GI01-050": {
    // Biðraðagirðingar 3500X1100mm (Leiga)
    "1-30": 120,
    "30-60": 60,
    "60-90": 30,
    "90-120": 15,
    "120-150": 15,
    "150-180": 15,
    "180-210": 15,
    "210-240": 15,
    "240-270": 15,
    "270-300": 15,
    "300-330": 15,
    "330-360": 15,
  },
  "01-BAT-GI01-051": {
    // Rekki f/biðraðagirðingar (15stk)
    "1-30": 64,
    "30-60": 64,
    "60-90": 64,
    "90-120": 64,
    "120-150": 64,
    "150-180": 64,
    "180-210": 64,
    "210-240": 64,
    "240-270": 64,
    "270-300": 64,
    "300-330": 64,
    "330-360": 64,
  },
  "01-BAT-GI01-045": {
    // Gátaskjöldur 1300mm x 310mm
    "1-30": 35,
    "30-60": 17,
    "60-90": 9,
    "90-120": 4,
    "120-150": 4,
    "150-180": 4,
    "180-210": 4,
    "210-240": 4,
    "240-270": 4,
    "270-300": 4,
    "300-330": 4,
    "330-360": 4,
  },
  "01-BAT-GI01-097": {
    // Klemmur f/girðingar
    "1-30": 1,
    "30-60": 1,
    "60-90": 1,
    "90-120": 1,
    "120-150": 1,
    "150-180": 1,
    "180-210": 1,
    "210-240": 1,
    "240-270": 1,
    "270-300": 1,
    "300-330": 1,
    "330-360": 1,
  },
  "01-BAT-GI01-0541": {
    // PVC Steinn 23kg f/girðingu
    "1-30": 0,
    "30-60": 0,
    "60-90": 0,
    "90-120": 0,
    "120-150": 0,
    "150-180": 0,
    "180-210": 0,
    "210-240": 0,
    "240-270": 0,
    "270-300": 0,
    "300-330": 0,
    "330-360": 0,
  },
};
