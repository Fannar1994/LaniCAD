import type { ExtraValue, Height, Material, PallarVariation, ShowExtraValues, Width } from "../interface";
import type { ProductIdentifier } from "../shared";

export const configuration: {
  materials: {
    label: string;
    materials: { label: string; items: Material[] };
  };
  sizes: {
    label: string;
    width: Width;
    length: Height;
    showExtraValues: ShowExtraValues;
    cylinderSize: {
      label: string;
      items: ExtraValue[];
    };
  };
  variation: { label: string; items: PallarVariation[] };
} = {
  variation: {
    label: "Sláðu inn stærð sólpallsins, veldu tegund klæðningar og hvort þú viljir reikna með efni í undirstöður",
    items: [
      {
        id: 0,
        label: "Langsum",
        value: "langsum",
        image: "https://www.datocms-assets.com/65892/1681901160-pallur-langsum.png",
      },
      {
        id: 1,
        label: "Þversum",
        value: "thversum",
        image: "https://www.datocms-assets.com/65892/1681901164-pallur-thversum.png",
      },
    ],
  },
  sizes: {
    label: "Veldu stærð",
    cylinderSize: {
      label: "Stærð hólks: (mm)",
      items: [
        {
          id: 0,
          label: "200mm",
          value: "2",
        },
        {
          id: 1,
          label: "250mm",
          value: "2.5",
        },
        {
          id: 2,
          label: "315mm",
          value: "4",
        },
      ],
    },
    showExtraValues: {
      label: "Reikna með hólkum og festingum",
      value: false,
    },
    length: {
      label: "Lengd: (m)",
      value: 2,
    },
    width: {
      label: "Breidd: (m)",
      value: 2,
    },
  },
  materials: {
    label: "Veldu þér efni",
    materials: {
      label: "Klæðning:",
      items: [
        {
          id: 0,
          vnr: "0058324",
          productId: 248053,
          label: "FURA ALHEFLUÐ 27X95 MM AB-GAGNVARIN",
          value: "0058324",
          materialType: "wood",
          materialWidth: 0.095,
        },
        {
          id: 1,
          vnr: "0058325",
          productId: 248055,
          label: "FURA ALHEFLAÐ 27X120 AB-GAGNVARIN",
          value: "0058325",
          materialType: "wood",
          materialWidth: 0.12,
        },
        {
          id: 2,
          vnr: "0058326",
          productId: 201110,
          label: "FURA ALHEFLUÐ 27X145 MM AB-GAGNVARIN",
          value: "0058326",
          materialType: "wood",
          materialWidth: 0.145,
        },
        {
          id: 3,
          vnr: "0039481",
          productId: 248018,
          label: "BANGKIRAI 21X145 MM RÁSAÐ",
          value: "0039481",
          materialType: "wood",
          materialWidth: 0.145,
        },
        {
          id: 4,
          vnr: "0038216",
          productId: 218657,
          label: "CUMARU 21X145MM ALHEFLAÐ",
          value: "0038216",
          materialType: "wood",
          materialWidth: 0.145,
        },
        {
          id: 5,
          vnr: "0053286",
          productId: 248033,
          label: "LINAX 28X145MM BRÚNT RÁSAÐ",
          value: "0053286",
          materialType: "wood",
          materialWidth: 0.145,
        },
        {
          id: 6,
          vnr: "0053325",
          productId: 299285,
          label: "KEBONY 28X120MM SLÉTTHEFLAÐ",
          value: "0053325",
          materialType: "wood",
          materialWidth: 0.12,
        },
        {
          id: 7,
          vnr: "0053335",
          productId: 299287,
          label: "KEBONY 28X120MM RÁSAÐ",
          value: "0053335",
          materialType: "wood",
          materialWidth: 0.12,
        },
        {
          id: 8,
          vnr: "0053287",
          productId: 339339,
          label: "PALLAEFNI GRÁTT RÁSAÐ 28X145",
          value: "0053287",
          materialType: "wood",
          materialWidth: 0.145,
        },
        {
          id: 9,
          vnr: "0039600",
          productId: 339243,
          label: "N/D NATURE PLASTPALLAEFNI - MATT SVART",
          value: "0039600",
          materialType: "plastic",
        },
        {
          id: 10,
          vnr: "0039605",
          productId: 339245,
          label: "N/D NATURE PLASTPALLAEFNI - MATT BRÚNT",
          value: "0039605",
          materialType: "plastic",
        },
        {
          id: 11,
          vnr: "0039610",
          productId: 339247,
          label: "N/D NATURE PLASTPALLAEFNI - MATT UMBER",
          value: "0039610",
          materialType: "plastic",
        },
        {
          id: 12,
          vnr: "0053424",
          productId: 342791,
          label: "LUNAWOOD GRENI 26X140MM BURSTAÐ - PROFIX 2 FESTINGAR",
          value: "0053424",
          materialType: "thermowood",
          materialWidth: 0.14,
        },
        {
          id: 13,
          vnr: "0053425",
          productId: 312762,
          label: "LUNAWOOD THERMOWOOD",
          value: "0053425",
          materialType: "thermowood",
          materialWidth: 0.117,
        },
        {
          id: 14,
          vnr: "0038226",
          productId: 353734,
          label: "GARAPA 21X145MM ALHEFLAÐ",
          value: "0038226",
          materialType: "wood",
          materialWidth: 0.145,
        },
      ],
    },
  },
};

export const productIdList = [
  "248067",
  "248063",
  "302906",
  "169380",
  "169382",
  "199076",
  "169949",
  "169933",
  "169434",
  "204647",
  "339339",
  "248053",
  "248055",
  "201110",
  "248018",
  "218657",
  "248033",
  "299285",
  "299287",
  "339243",
  "339245",
  "339247",
  "248024",
  "248026",
  "342791",
  "312762",
  "343597",
  "364742",
  "194278",
  "255213",
  "194165",
  "353734",
];

export const productsList: Record<string, ProductIdentifier[]> = {
  burdur: [{ vnr: "0058506", id: 248067 }],
  dregari: [{ vnr: "0058504", id: 248063 }],
  skrufur: [{ vnr: "30114550", id: 302906 }],
  tClips: [{ vnr: "0039518", id: 248024 }],
  endaClips: [{ vnr: "0039519", id: 248026 }],
  clipsMedSkrufum: [{ vnr: "0053430", id: 343597 }],
  sankerRight: [{ vnr: "33711006", id: 169380 }],
  sankerLeft: [{ vnr: "33711007", id: 169382 }],
  kambSkrufa: [{ vnr: "33799540", id: 199076 }],
  blikkholkar: [
    { vnr: "0251655", id: 169949 },
    { vnr: "0251657", id: 364742 },
    { vnr: "0251658", id: 169933 },
  ],
  staurafesting: [{ vnr: "33709003", id: 169434 }],
  staurasteypa: [{ vnr: "0225333", id: 204647 }],
  bordabolti: [
    {
      vnr: "31121080",
      id: 194278,
    },
  ],
  ferkantSkinna: [
    {
      vnr: "31330011",
      id: 255213,
    },
  ],
  roHeitgalv: [
    {
      vnr: "30300510",
      id: 194165,
    },
  ],
  klaedning: [
    { vnr: "0053287", id: 339339 },
    { vnr: "0058324", id: 248053 },
    { vnr: "0058325", id: 248055 },
    { vnr: "0058326", id: 201110 },
    { vnr: "0039481", id: 248018 },
    { vnr: "0038216", id: 218657 },
    { vnr: "0053286", id: 248033 },
    { vnr: "0053325", id: 299285 },
    { vnr: "0053335", id: 299287 },
    { vnr: "0039600", id: 339243 },
    { vnr: "0039605", id: 339245 },
    { vnr: "0039610", id: 339247 },
    { vnr: "0053424", id: 342791 },
    { vnr: "0053425", id: 312762 },
    { vnr: "0038226", id: 353734 },
  ],
};
