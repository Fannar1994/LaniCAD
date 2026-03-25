// Scaffold configuration and component definitions for Vinnupallar

import { ComponentCategory, ScaffoldComponentConfig, VinnupallarConfiguration, PallurInput } from "./interface";

export const VSK_RATE = 0.24;
export const MAX_PALLAR = 20;

// Scaffold component configurations
export const SCAFFOLD_COMPONENTS: ScaffoldComponentConfig[] = [
  // Frames
  {
    saluvorn: "97100000",
    leigunumer: "01-PAL-VP01-000",
    heiti: "RAMMAR 2,0M",
    einVerd: 145.0,
    weight: 15.5,
    calculateQuantity: (input: PallurInput) => {
      return input.einingafjoldi * input.fjoldi2mHaeda * 2;
    },
  },
  {
    saluvorn: "97100001",
    leigunumer: "01-PAL-VP01-001",
    heiti: "RAMMAR 0,7M",
    einVerd: 85.0,
    weight: 6.2,
    calculateQuantity: (input: PallurInput) => {
      return input.einingafjoldi * input.fjoldi0_7mHaeda * 2;
    },
  },

  // Working table
  {
    saluvorn: "97100002",
    leigunumer: "01-PAL-VP01-002",
    heiti: "GÓLFBORÐ 1,8M",
    einVerd: 120.0,
    weight: 18.5,
    area: 1.8,
    calculateQuantity: (input: PallurInput) => {
      const totalLevels = input.fjoldi2mHaeda + input.fjoldi0_7mHaeda;
      return input.einingafjoldi * totalLevels;
    },
  },
  {
    saluvorn: "97100003",
    leigunumer: "01-PAL-VP01-003",
    heiti: "GÓLFBORÐ 0,9M",
    einVerd: 75.0,
    weight: 10.2,
    area: 0.9,
    calculateQuantity: (input: PallurInput) => {
      return 0; // Only used in specific configurations
    },
  },

  // Handrails
  {
    saluvorn: "97100101",
    leigunumer: "01-PAL-VP01-0101",
    heiti: "TVÖFÖLD HANDRIÐ",
    einVerd: 95.0,
    weight: 8.5,
    calculateQuantity: (input: PallurInput) => {
      const handrailsPerBay = input.einingafjoldi * 2;
      const endHandrails = input.fjoldiEndalokana * 2;
      return handrailsPerBay + endHandrails;
    },
  },
  {
    saluvorn: "97100102",
    leigunumer: "01-PAL-VP01-0102",
    heiti: "ENDALOKUN HANDRIÐ",
    einVerd: 55.0,
    weight: 4.2,
    calculateQuantity: (input: PallurInput) => {
      return input.fjoldiEndalokana;
    },
  },

  // Supports
  {
    saluvorn: "97100006",
    leigunumer: "01-PAL-VP01-006",
    heiti: "LAPPIR 50CM",
    einVerd: 35.0,
    weight: 2.8,
    calculateQuantity: (input: PallurInput) => {
      return input.einingafjoldi * 4;
    },
  },
  {
    saluvorn: "97100007",
    leigunumer: "01-PAL-VP01-007",
    heiti: "STOÐ 2,0M",
    einVerd: 45.0,
    weight: 6.5,
    calculateQuantity: (input: PallurInput) => {
      const needsSupports = input.haestaStandhaed > 4.0;
      return needsSupports ? input.einingafjoldi * 2 : 0;
    },
  },

  // Accessories
  {
    saluvorn: "97100010",
    leigunumer: "01-PAL-VP01-010",
    heiti: "HJÓL FYRIR GRUNN",
    einVerd: 25.0,
    weight: 1.5,
    calculateQuantity: (input: PallurInput) => {
      return 4; // 4 wheels per platform
    },
  },
  {
    saluvorn: "97100011",
    leigunumer: "01-PAL-VP01-011",
    heiti: "FÓTUR FYRIR GRUNN",
    einVerd: 15.0,
    weight: 0.8,
    calculateQuantity: (input: PallurInput) => {
      return 4; // 4 feet per platform
    },
  },
  {
    saluvorn: "97100012",
    leigunumer: "01-PAL-VP01-012",
    heiti: "STIGAR 2,0M",
    einVerd: 65.0,
    weight: 12.0,
    calculateQuantity: (input: PallurInput) => {
      return 1; // One ladder per platform
    },
  },
  {
    saluvorn: "97100013",
    leigunumer: "01-PAL-VP01-013",
    heiti: "STIGAHURÐ",
    einVerd: 35.0,
    weight: 3.5,
    calculateQuantity: (input: PallurInput) => {
      return 1; // One per ladder
    },
  },
];

export const VINNUPALLAR_CONFIG: VinnupallarConfiguration = {
  vsk: VSK_RATE,
  maxPallar: MAX_PALLAR,
  components: SCAFFOLD_COMPONENTS,
};

export const getComponentByCode = (saluvorn: string): ScaffoldComponentConfig | undefined => {
  for (let i = 0; i < SCAFFOLD_COMPONENTS.length; i++) {
    if (SCAFFOLD_COMPONENTS[i].saluvorn === saluvorn) {
      return SCAFFOLD_COMPONENTS[i];
    }
  }
  return undefined;
};

export const getComponentsByCategory = (category: ComponentCategory): ScaffoldComponentConfig[] => {
  const results: ScaffoldComponentConfig[] = [];
  for (let i = 0; i < SCAFFOLD_COMPONENTS.length; i++) {
    const c = SCAFFOLD_COMPONENTS[i];
    const heiti = c.heiti.toUpperCase();
    let matches = false;
    
    switch (category) {
      case ComponentCategory.FRAMES:
        matches = heiti.indexOf("RAMMAR") !== -1;
        break;
      case ComponentCategory.DECKS:
        matches = heiti.indexOf("GÓLFBORÐ") !== -1;
        break;
      case ComponentCategory.HANDRAILS:
        matches = heiti.indexOf("HANDRIÐ") !== -1 || heiti.indexOf("ENDALOKUN") !== -1;
        break;
      case ComponentCategory.SUPPORTS:
        matches = heiti.indexOf("LAPPIR") !== -1 || heiti.indexOf("STOÐ") !== -1;
        break;
      case ComponentCategory.ACCESSORIES:
        matches = heiti.indexOf("HJÓL") !== -1 || heiti.indexOf("FÓTUR") !== -1 || heiti.indexOf("STIGAR") !== -1;
        break;
    }
    
    if (matches) {
      results.push(c);
    }
  }
  return results;
};
