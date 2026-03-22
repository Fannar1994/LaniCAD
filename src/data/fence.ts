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
  'fence-3500x2000x1.1': { key: 'fence-3500x2000x1.1', rentalNo: '01-BAT-GI01-015', saleNo: '0295300', description: 'Girðingar 3500x2000x1,1', rates: [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13], salePrice: 19995, discountPrice: 13900, fenceLength: 3.5 },
  'fence-3500x2000x1.7': { key: 'fence-3500x2000x1.7', rentalNo: '01-BAT-GI01-050', saleNo: '0295317', description: 'Girðingar 3500x2000x1,7', rates: [120, 60, 30, 15, 15, 15, 15, 15, 15, 15, 15, 15], salePrice: 24995, discountPrice: 17900, fenceLength: 3.5 },
  'fence-3500x1200x1.1': { key: 'fence-3500x1200x1.1', rentalNo: '01-BAT-GI01-052', saleNo: '0295290', description: 'Girðingar 3500x1200x1,1', rates: [80, 40, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10], salePrice: 12995, discountPrice: 9900, fenceLength: 3.5 },
  'queue-barrier': { key: 'queue-barrier', rentalNo: '01-BAT-GI01-045', saleNo: '0295292', description: 'Biðraðagirðingar 2500mm', rates: [90, 45, 23, 12, 12, 12, 12, 12, 12, 12, 12, 12], salePrice: 24995, discountPrice: 17500, fenceLength: 2.5 },
  'plastic-fence': { key: 'plastic-fence', rentalNo: '01-BAT-GI01-053', saleNo: '0295243', description: 'Girðing plast 2100x1100', rates: [50, 25, 13, 7, 7, 7, 7, 7, 7, 7, 7, 7], salePrice: 26995, discountPrice: 21500, fenceLength: 2.1 },
  'stone-concrete': { key: 'stone-concrete', rentalNo: '01-BAT-GI01-020', saleNo: '0295320', description: 'Steinar f/girðingar', rates: [30, 15, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4], salePrice: 2495, discountPrice: 1700 },
  'stone-pvc': { key: 'stone-pvc', rentalNo: '01-BAT-GI01-021', saleNo: '0295325', description: 'PVC Steinar f/girðingar', rates: [20, 10, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3], salePrice: 3995, discountPrice: 2900 },
  'clamps': { key: 'clamps', rentalNo: '01-BAT-GI01-030', saleNo: '97100097', description: 'Klemmur f/girðingar', rates: [5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1], salePrice: 995, discountPrice: 650 },
  'rack-fence': { key: 'rack-fence', rentalNo: '01-BAT-GI01-040', saleNo: '97100100', description: 'Rekki f/Girðingar (25stk)', rates: [50, 25, 13, 7, 7, 7, 7, 7, 7, 7, 7, 7], salePrice: 99995, discountPrice: 79900 },
  'rack-queue': { key: 'rack-queue', rentalNo: '01-BAT-GI01-043', saleNo: '9731020', description: 'Rekki f/biðraðagirðingar', rates: [50, 25, 13, 7, 7, 7, 7, 7, 7, 7, 7, 7], salePrice: 84995, discountPrice: 67900 },
  'walking-gate': { key: 'walking-gate', rentalNo: '01-BAT-GI01-060', saleNo: '97100096', description: 'Gönguhliðar 120cm', rates: [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13], salePrice: 20312, discountPrice: 14200 },
  'wheels': { key: 'wheels', rentalNo: '01-BAT-GI01-061', saleNo: '97100099', description: 'Hjól f/girðingar', rates: [30, 15, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4], salePrice: 18395, discountPrice: 6900 },
  'lock': { key: 'lock', rentalNo: '01-BAT-GI01-062', saleNo: '97100981', description: 'Efri Læsing f/Hlið', rates: [10, 5, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2], salePrice: 4858, discountPrice: 3900 },
  'warning-sign': { key: 'warning-sign', rentalNo: '01-BAT-GI01-070', saleNo: '0295245', description: 'Gátaskjöldur 1300x310mm', rates: [30, 15, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4], salePrice: 9995, discountPrice: 6900 },
}

export const FENCE_TYPES = [
  { key: 'standard-heavy', label: 'Girðing 3.5m (1.7kg/m)', productKey: 'fence-3500x2000x1.7', fenceLength: 3.5 },
  { key: 'standard-light', label: 'Girðing 3.5m (1.1kg/m)', productKey: 'fence-3500x2000x1.1', fenceLength: 3.5 },
  { key: 'standard-low', label: 'Girðing 3.5m × 1.2m', productKey: 'fence-3500x1200x1.1', fenceLength: 3.5 },
  { key: 'queue', label: 'Biðröðgirðing 2.5m', productKey: 'queue-barrier', fenceLength: 2.5 },
  { key: 'plastic', label: 'Plastgirðing 2.1m', productKey: 'plastic-fence', fenceLength: 2.1 },
  { key: 'warning', label: 'Viðvörunarskilti 1.3m', productKey: 'warning-sign', fenceLength: 1.3 },
]

export const MIN_RENTAL_DAYS = 10
