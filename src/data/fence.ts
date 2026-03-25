export interface FenceProductData {
  key: string
  rentalNo: string
  saleNo: string
  description: string
  rates: number[] // 12 monthly tiers
  salePrice: number       // Grunnverð (base sale price)
  discountPrice: number   // Spariverð (discount sale price)
  fenceLength?: number // meters per panel
}

export const FENCE_PRODUCTS: Record<string, FenceProductData> = {
  'fence-3500x2000x1.1': { key: 'fence-3500x2000x1.1', rentalNo: '01-BAT-GI01-015', saleNo: '0295300', description: 'Girðingar 3.500x2.000x1,1mm', rates: [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13], salePrice: 19995, discountPrice: 13900, fenceLength: 3.5 },
  'fence-3500x2000x1.7': { key: 'fence-3500x2000x1.7', rentalNo: '01-BAT-GI01-053', saleNo: '0295317', description: 'Girðingar 3.500x2.000x1,7mm', rates: [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13], salePrice: 24995, discountPrice: 17900, fenceLength: 3.5 },
  'fence-3500x1200x1.1': { key: 'fence-3500x1200x1.1', rentalNo: '01-BAT-GI01-052', saleNo: '0295290', description: 'Girðingar 3.500x1.200x1,1mm', rates: [80, 40, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10], salePrice: 12995, discountPrice: 9900, fenceLength: 3.5 },
  'queue-barrier': { key: 'queue-barrier', rentalNo: '01-BAT-GI01-050', saleNo: '0295292', description: 'Biðraðagirðingar 2.500x1.100m', rates: [130, 65, 33, 16, 16, 16, 16, 16, 16, 16, 16, 16], salePrice: 24995, discountPrice: 17500, fenceLength: 2.5 },
  'plastic-fence': { key: 'plastic-fence', rentalNo: '01-BAT-GI01-043', saleNo: '0295243', description: 'Girðing plast 2.100x1.100mm', rates: [80, 40, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10], salePrice: 26995, discountPrice: 21500, fenceLength: 2.1 },
  'stone-concrete': { key: 'stone-concrete', rentalNo: '01-BAT-GI01-054', saleNo: '0295320', description: 'Steinar f/girðingar', rates: [20, 10, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3], salePrice: 2495, discountPrice: 1700 },
  'stone-pvc': { key: 'stone-pvc', rentalNo: '01-BAT-GI01-0541', saleNo: '0295325', description: 'PVC Steinar f/girðingar', rates: [50, 25, 13, 6, 6, 6, 6, 6, 6, 6, 6, 6], salePrice: 3995, discountPrice: 2900 },
  'clamps': { key: 'clamps', rentalNo: '01-BAT-GI01-097', saleNo: '97100097', description: 'Klemmur f/girðingar', rates: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], salePrice: 995, discountPrice: 650 },
  'rack-fence': { key: 'rack-fence', rentalNo: '01-BAT-GI01-100', saleNo: '97100100', description: 'Rekki f/girðingar (25stk)', rates: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], salePrice: 99995, discountPrice: 79900 },
  'rack-queue': { key: 'rack-queue', rentalNo: '01-BAT-GI01-051', saleNo: '97310020', description: 'Rekki f/biðraðagirðingar (15stk)', rates: [64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64], salePrice: 84995, discountPrice: 67900 },
  'walking-gate': { key: 'walking-gate', rentalNo: '01-BAT-GI01-096', saleNo: '97100096', description: 'Gönguhlið 1.200mm', rates: [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13], salePrice: 20312, discountPrice: 14200 },
  'wheels': { key: 'wheels', rentalNo: '01-BAT-GI01-099', saleNo: '97100099', description: 'Hjól f/girðingar', rates: [110, 55, 28, 14, 14, 14, 14, 14, 14, 14, 14, 14], salePrice: 18395, discountPrice: 6900 },
  'lock': { key: 'lock', rentalNo: '01-BAT-GI01-101', saleNo: '971000981', description: 'Efri læsing f/hlið', rates: [50, 25, 13, 6, 6, 6, 6, 6, 6, 6, 6, 6], salePrice: 4858, discountPrice: 3900 },
  'warning-sign': { key: 'warning-sign', rentalNo: '01-BAT-GI01-045', saleNo: '0295245', description: 'Gátaskjöldur 1.300x0.310mm', rates: [40, 20, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5], salePrice: 9995, discountPrice: 6900 },
}

export const FENCE_TYPES = [
  { key: 'standard-heavy', label: 'Girðing 3,5x2m 1,7mm', productKey: 'fence-3500x2000x1.7', fenceLength: 3.5 },
  { key: 'standard-light', label: 'Girðing 3,5x2m 1,1mm', productKey: 'fence-3500x2000x1.1', fenceLength: 3.5 },
  { key: 'standard-low', label: 'Girðing 3,5x1,2m 1,1mm', productKey: 'fence-3500x1200x1.1', fenceLength: 3.5 },
  { key: 'queue', label: 'Biðröðgirðing 2,5m', productKey: 'queue-barrier', fenceLength: 2.5 },
  { key: 'plastic', label: 'Plastgirðing 2,1m', productKey: 'plastic-fence', fenceLength: 2.1 },
  { key: 'warning', label: 'Viðvörunarskilti 1,3m', productKey: 'warning-sign', fenceLength: 1.3 },
]

export const MIN_RENTAL_DAYS = 10
