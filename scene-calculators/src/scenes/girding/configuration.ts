import type { Cladding, GirdingVariation, Height, Material, Width } from "../interface";

export const configuration: {
  sizes: { label: string; width: Width; height: Height };
  materials: {
    label: string;
    claddings: { label: string; items: Cladding[] };
    materials: { label: string; items: Material[] };
  };
  variation: { label: string; items: GirdingVariation[] };
} = {
  variation: {
    label: "Veldu tegund af girðingu",
    items: [
      {
        id: 0,
        label: "Lóðrétt, milli staura",
        value: "lodrett-milli-staura",
        image: "https://www.datocms-assets.com/65892/1681901146-grindverk-lodrett-milli-staura.png",
      },
      {
        id: 1,
        label: "Lárétt, milli staura",
        value: "larett-milli-staura",
        image: "https://www.datocms-assets.com/65892/1681901137-grindverk-larett-milli-staura.png",
      },
      {
        id: 2,
        label: "Lárétt, yfir staur",
        value: "larett-yfir-staura",
        image: "https://www.datocms-assets.com/65892/1681901142-grindverk-larett-yfir-staura.png",
      },
    ],
  },
  sizes: {
    label: "Veldu stærð",
    width: {
      label: "Lengd: (m)",
      value: 2,
    },
    height: {
      label: "Hæð: (m)",
      value: 1.8,
      maxValue: 1.8,
    },
  },
  materials: {
    label: "Veldu þér efni",
    claddings: {
      label: "Klæðning:",
      items: [
        {
          id: 0,
          label: "Einföld",
          value: "einfold",
        },
        {
          id: 1,
          label: "Tvöföld",
          value: "tvofold",
        },
      ],
    },
    materials: {
      label: "Efni:",
      items: [
        {
          id: 0,
          vnr: "0058254",
          productId: 248043,
          label: "FURA ALHEFL 22X95 AB-GAGNV",
          value: "0058254",
          variantId: "0058254::360:",
          materialType: "wood",
          materialWidth: 0.095,
          materialLengthInMeters: 3.6,
        },
        {
          id: 1,
          vnr: "0058255",
          productId: 248045,
          label: "FURA ALHEF 22X120 AB-GAGNV",
          value: "0058255",
          variantId: "0058255::360:",
          materialType: "wood",
          materialWidth: 0.12,
          materialLengthInMeters: 3.6,
        },
        {
          id: 2,
          vnr: "0058256",
          productId: 248047,
          label: "FURA ALHEFL 22X145 AB-GAGNV",
          value: "0058256",
          variantId: "0058256::360:",
          materialType: "wood",
          materialWidth: 0.145,
          materialLengthInMeters: 3.6,
        },
        {
          id: 3,
          vnr: "0039479",
          productId: 201137,
          label: "BANGKIRAI RÁSAÐ 19X90",
          value: "0039479",
          variantId: "0039479::360:",
          materialType: "wood",
          materialWidth: 0.09,
          materialLengthInMeters: 3.6,
        },
        {
          id: 4,
          vnr: "0076185",
          productId: 362978,
          label: "LUNAWOOD 19X117MM OFNÞURRKUÐ FURA ALHEFLAÐ",
          value: "0076185",
          variantId: "0076185::360:",
          materialType: "wood",
          materialWidth: 0.117,
          materialLengthInMeters: 3.6,
        },
      ],
    },
  },
};
