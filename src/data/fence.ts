export interface FenceProductData {
  key: string
  rentalNo: string
  saleNo: string
  description: string
  rates: number[] // 12 monthly tiers
  salePrice: number
  fenceLength?: number // meters per panel
}

export const FENCE_PRODUCTS: Record<string, FenceProductData> = {
  'fence-3500x2000x1.1': { key: 'fence-3500x2000x1.1', rentalNo: '01-BAT-GI01-015', saleNo: '97300015', description: 'Girðing 3500×2000mm (1.1kg/m)', rates: [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13], salePrice: 13500, fenceLength: 3.5 },
  'fence-3500x2000x1.7': { key: 'fence-3500x2000x1.7', rentalNo: '01-BAT-GI01-050', saleNo: '97300050', description: 'Girðing 3500×2000mm (1.7kg/m)', rates: [120, 60, 30, 15, 15, 15, 15, 15, 15, 15, 15, 15], salePrice: 18500, fenceLength: 3.5 },
  'fence-3500x1200x1.1': { key: 'fence-3500x1200x1.1', rentalNo: '01-BAT-GI01-052', saleNo: '97300052', description: 'Girðing 3500×1200mm (1.1kg/m)', rates: [80, 40, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10], salePrice: 10500, fenceLength: 3.5 },
  'queue-barrier': { key: 'queue-barrier', rentalNo: '01-BAT-GI01-045', saleNo: '97300045', description: 'Biðröðgirðing 2500mm', rates: [90, 45, 23, 12, 12, 12, 12, 12, 12, 12, 12, 12], salePrice: 12000, fenceLength: 2.5 },
  'plastic-fence': { key: 'plastic-fence', rentalNo: '01-BAT-GI01-053', saleNo: '97300053', description: 'Plastgirðing 2100mm', rates: [50, 25, 13, 7, 7, 7, 7, 7, 7, 7, 7, 7], salePrice: 5500, fenceLength: 2.1 },
  'stone-concrete': { key: 'stone-concrete', rentalNo: '01-BAT-GI01-020', saleNo: '97300020', description: 'Steinn (steinsteypa)', rates: [30, 15, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4], salePrice: 4500 },
  'stone-pvc': { key: 'stone-pvc', rentalNo: '01-BAT-GI01-021', saleNo: '97300021', description: 'Steinn (PVC)', rates: [20, 10, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3], salePrice: 3000 },
  'clamps': { key: 'clamps', rentalNo: '01-BAT-GI01-030', saleNo: '97300030', description: 'Klemmur', rates: [5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1], salePrice: 900 },
  'rack-fence': { key: 'rack-fence', rentalNo: '01-BAT-GI01-040', saleNo: '97300040', description: 'Rekkur f/girðingar', rates: [50, 25, 13, 7, 7, 7, 7, 7, 7, 7, 7, 7], salePrice: 0 },
  'rack-queue': { key: 'rack-queue', rentalNo: '01-BAT-GI01-043', saleNo: '97300043', description: 'Rekkur f/biðröðgirðingar', rates: [50, 25, 13, 7, 7, 7, 7, 7, 7, 7, 7, 7], salePrice: 0 },
  'walking-gate': { key: 'walking-gate', rentalNo: '01-BAT-GI01-060', saleNo: '97300060', description: 'Gönguhliðar', rates: [100, 50, 25, 13, 13, 13, 13, 13, 13, 13, 13, 13], salePrice: 18000 },
  'wheels': { key: 'wheels', rentalNo: '01-BAT-GI01-061', saleNo: '97300061', description: 'Hjól f/hliðar', rates: [30, 15, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4], salePrice: 5000 },
  'lock': { key: 'lock', rentalNo: '01-BAT-GI01-062', saleNo: '97300062', description: 'Lás', rates: [10, 5, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2], salePrice: 2000 },
  'warning-sign': { key: 'warning-sign', rentalNo: '01-BAT-GI01-070', saleNo: '97300070', description: 'Viðvörunarskilti 1300mm', rates: [30, 15, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4], salePrice: 3500 },
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
