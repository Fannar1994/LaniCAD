const STANDARD_LENGTH = 3.6;

export const PRODUCTS = {
  viður: {
    klæðning: [
      {
        // FURA ALHEFLUÐ 22X95 AB-GAGNVARIÐ
        lengthInMeters: STANDARD_LENGTH,
        widthInMeters: 0.095,
        variantId: `0058254::${STANDARD_LENGTH * 100}:`,
        productId: "248043",
        slug: "https://byko.is/vara/fura-alheflud-22x95-ab-gagnvarid-248043",
      },
      {
        // FURA ALHEF 22X120 AB-GAGNV
        lengthInMeters: STANDARD_LENGTH,
        widthInMeters: 0.12,
        variantId: `0058255::${STANDARD_LENGTH * 100}:`,
        productId: "248045",
        slug: "https://byko.is/vara/fura-alhef-22-x120-ab-gagnv-248045",
      },
      {
        // FURA ALHEFL 22X145 AB-GAGNV
        lengthInMeters: STANDARD_LENGTH,
        widthInMeters: 0.145,
        variantId: `0058256::${STANDARD_LENGTH * 100}:`,
        productId: "248047",
        slug: "https://byko.is/vara/fura-alhefl-22-x145-ab-gagnv-248047",
      },
      {
        // BANGKIRAI RÁSAÐ 19X90
        lengthInMeters: STANDARD_LENGTH,
        widthInMeters: 0.09,
        variantId: `0039479::${STANDARD_LENGTH * 100}:`,
        productId: "201137",
        slug: "https://byko.is/vara/bangkirai-rasad-19x90-201137",
      },
      {
        // FURA 19X117MM ALHEFLAÐ
        lengthInMeters: STANDARD_LENGTH,
        widthInMeters: 0.117,
        variantId: `0076185::${STANDARD_LENGTH * 100}:`,
        productId: "362978",
        slug: "https://byko.is/vara/fura-19x117mm-alheflad-362978",
      },
    ],
    langbönd: [
      {
        // FURA ALHEF 45X95 AB-GAGNV
        lengthInMeters: STANDARD_LENGTH,
        widthInMeters: 0.095,
        variantId: `0058504::${STANDARD_LENGTH * 100}:`,
        productId: "248063",
        slug: "https://byko.is/vara/fura-alhef-45-x95-ab-gagnv-248063",
      },
    ],
    topplisti: [
      {
        // FURA ALHEFL 22X145 AB-GAGNV
        lengthInMeters: STANDARD_LENGTH,
        widthInMeters: 0.145,
        variantId: `0058256::${STANDARD_LENGTH * 100}:`,
        productId: "248047",
        slug: "https://byko.is/vara/fura-alhefl-22-x145-ab-gagnv-248047",
      },
    ],
    staurar: [
      {
        // FURA ALHEF 95X95 A-GAGNV
        lengthInMeters: 2.7,
        widthInMeters: 0.095,
        variantId: `0059954::270:`,
        productId: "228388",
        slug: "https://byko.is/vara/fura-alhef-95-x95-a-gagnv-228388",
      },
    ],
    klæðningargrind: [
      {
        // FURA ALHEF 45X95 AB-GAGNV
        lengthInMeters: STANDARD_LENGTH,
        widthInMeters: 0.045,
        variantId: `0058504::${STANDARD_LENGTH * 100}:`,
        productId: "248063",
        slug: "https://byko.is/vara/fura-alhef-45-x95-ab-gagnv-248063",
      },
    ],
  },
  skrúfur: {
    klæðning: [
      // A4 RYÐFRÍAR TRÉSKRÚFUR UZ
      {
        variantId: `30114545::4,5x45:`,
        productId: "302906",
        itemsPerPackage: 200,
        slug: "https://byko.is/vara/a4-rydfriar-treskrufur-uz-45-mm-200-stk-302906",
      },
    ],
    langbönd: [
      {
        // A4 RYÐFRÍAR TRÉSKRÚFUR UZ
        variantId: `30114560::4,5x60:`,
        productId: "302906",
        itemsPerPackage: 200,
        slug: "https://byko.is/vara/a4-rydfriar-treskrufur-uz-45-mm-200-stk-302906",
      },
    ],
    klæðningargrind: [
      {
        // A4 RYÐFRÍAR TRÉSKRÚFUR UZ
        variantId: `30115060::5x60:`,
        productId: "302907",
        itemsPerPackage: 200,
        slug: "https://byko.is/vara/a4-rydfriar-treskrufur-uz-50-mm-200-stk-302907",
      },
    ],
    topplisti: [
      {
        // A4 RYÐFRÍAR TRÉSKRÚFUR UZ
        variantId: `30114560::4,5x60`,
        productId: "302906",
        itemsPerPackage: 200,
        slug: "https://byko.is/vara/a4-rydfriar-treskrufur-uz-45-mm-200-stk-302906",
      },
    ],
    kambskrúfur: [
      {
        // KAMBSKRÚFA 250STK
        variantId: `33799540::5x40:`,
        productId: "199076",
        itemsPerPackage: 250,
        slug: "https://byko.is/vara/kambskrufa-250stk-199076",
      },
    ],
  },
  annað: {
    staurasteypa: [
      {
        // SAKRET STAURASTEYPA 25KG 225333
        variantId: "0225333",
        productId: "204647",
        slug: "https://byko.is/vara/sakret-staurasteypa-25kg-204647",
      },
    ],
    vinkill: [
      {
        // AR VINKILL 40X40X60X2,5 33711310::40X40X60X2,5:
        variantId: "33711305::40x40x40x2,5:",
        productId: "169324",
        slug: "https://byko.is/vara/ar-vinkill-40x40x40x25-169324",
      },
    ],
    blikkhólkur: [
      {
        // BLIKKHÓLKUR 250MM 0,75M
        variantId: "0251657",
        productId: "364742",
        slug: "https://byko.is/vara/blikkholkur-250mm-075-m-364742",
      },
    ],
  },
};

export type ProductType =
  | (typeof PRODUCTS.viður.klæðning)[0]
  | (typeof PRODUCTS.skrúfur.kambskrúfur)[0]
  | (typeof PRODUCTS.annað.blikkhólkur)[0]
  | (typeof PRODUCTS.annað.staurasteypa)[0]
  | (typeof PRODUCTS.annað.vinkill)[0];

export type ProductTypePurpose =
  | "klæðning"
  | "klæðningargrind"
  | "langbönd"
  | "staurar"
  | "blikkhólkar"
  | "staurasteypa"
  | "vinklar"
  | "topplisti"
  | "skrúfur langbönd"
  | "skrúfur klæðningargrind"
  | "skrúfur topplisti"
  | "skrúfur klæðning"
  | "kambskrúfur";

export const RAW_VARIANT_IDS = [
  "0058254::360:",
  "0058255::360:",
  "0058256::360:",
  "0039479::360:",
  "0076185::360:",
  "0058504::360:",
  "0059954::270:",
  "0059382::360:",
  "30114545::4,5x45:",
  "30115060::5x60:",
  "30114560::4,5x60:",
  "33799540::5x40:",
  "0225333",
  "33711305::40x40x40x2,5:",
  "0251655",
  "0251657",
];

export const RAW_PRODUCT_IDS = [
  "169324",
  "248043",
  "248045",
  "248047",
  "201137",
  "362978",
  "248063",
  "228388",
  "248075",
  "302906",
  "302907",
  "199076",
  "204647",
  "169949",
  "364742",
];
