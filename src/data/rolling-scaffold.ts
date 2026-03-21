// Mobile scaffolding (hjólapallar) pricing and component data

export interface RollingPricing {
  '24h': number
  extra: number
  week: number
  deposit: number
}

export const NARROW_PRICING: Record<string, RollingPricing> = {
  '2.5': { '24h': 4717, extra: 2359, week: 11794, deposit: 10000 },
  '3.5': { '24h': 5443, extra: 2722, week: 13608, deposit: 12000 },
  '4.5': { '24h': 7576, extra: 3788, week: 18941, deposit: 15000 },
  '5.5': { '24h': 9073, extra: 4537, week: 22683, deposit: 18000 },
  '6.5': { '24h': 10571, extra: 5286, week: 26427, deposit: 21000 },
  '7.5': { '24h': 12068, extra: 6034, week: 30170, deposit: 24000 },
  '8.5': { '24h': 13565, extra: 6783, week: 33913, deposit: 25000 },
  '9.5': { '24h': 15106, extra: 7553, week: 37765, deposit: 27000 },
  '10.5': { '24h': 16647, extra: 8324, week: 41618, deposit: 28000 },
}

export const WIDE_PRICING: Record<string, RollingPricing> = {
  '2.5': { '24h': 5443, extra: 2722, week: 13608, deposit: 12000 },
  '3.5': { '24h': 6170, extra: 3085, week: 15425, deposit: 15000 },
  '4.5': { '24h': 8303, extra: 4152, week: 20758, deposit: 18000 },
  '5.5': { '24h': 9800, extra: 4900, week: 24500, deposit: 21000 },
  '6.5': { '24h': 11298, extra: 5649, week: 28244, deposit: 24000 },
  '7.5': { '24h': 12795, extra: 6398, week: 31988, deposit: 25000 },
  '8.5': { '24h': 14292, extra: 7146, week: 35730, deposit: 27000 },
  '9.5': { '24h': 15833, extra: 7917, week: 39583, deposit: 28000 },
  '10.5': { '24h': 17374, extra: 8687, week: 43435, deposit: 30000 },
}

export const QUICKLY_PRICING: RollingPricing = {
  '24h': 4082, extra: 2041, week: 10206, deposit: 10000,
}

export const SUPPORT_LEGS_PRICING: RollingPricing = {
  '24h': 453, extra: 227, week: 1134, deposit: 0,
}

export interface ScaffoldComponent {
  itemNo: string
  name: string
  weekPrice: number
  quantities: Record<string, number>
}

export const NARROW_COMPONENTS: ScaffoldComponent[] = [
  { itemNo: '01-PAL-HP01-001', name: 'Álrammar B1 2,1m', weekPrice: 3192, quantities: { '2.5': 2, '3.5': 4, '4.5': 4, '5.5': 6, '6.5': 6, '7.5': 8, '8.5': 8, '9.5': 10, '10.5': 10 } },
  { itemNo: '01-PAL-HP01-002', name: 'Álrammar B5 1,05m', weekPrice: 2128, quantities: { '2.5': 0, '3.5': 0, '4.5': 2, '5.5': 2, '6.5': 4, '7.5': 4, '8.5': 6, '9.5': 6, '10.5': 8 } },
  { itemNo: '01-PAL-HP01-003', name: 'Gólfborð 1,8m', weekPrice: 1064, quantities: { '2.5': 3, '3.5': 3, '4.5': 3, '5.5': 3, '6.5': 3, '7.5': 3, '8.5': 3, '9.5': 3, '10.5': 3 } },
  { itemNo: '01-PAL-HP01-004', name: 'Handrið', weekPrice: 1596, quantities: { '2.5': 7, '3.5': 9, '4.5': 9, '5.5': 11, '6.5': 11, '7.5': 13, '8.5': 13, '9.5': 15, '10.5': 15 } },
  { itemNo: '01-PAL-HP01-005', name: 'Skástífur', weekPrice: 1596, quantities: { '2.5': 2, '3.5': 4, '4.5': 4, '5.5': 6, '6.5': 6, '7.5': 8, '8.5': 8, '9.5': 10, '10.5': 10 } },
  { itemNo: '01-PAL-HP01-060', name: 'Stillanl.fætur', weekPrice: 1064, quantities: { '2.5': 4, '3.5': 4, '4.5': 4, '5.5': 4, '6.5': 4, '7.5': 4, '8.5': 4, '9.5': 4, '10.5': 4 } },
  { itemNo: '01-PAL-HP01-095', name: 'Hjól Ø200mm', weekPrice: 3192, quantities: { '2.5': 4, '3.5': 4, '4.5': 4, '5.5': 4, '6.5': 4, '7.5': 4, '8.5': 4, '9.5': 4, '10.5': 4 } },
  { itemNo: '01-PAL-HP01-023', name: '12cm hækkun', weekPrice: 0, quantities: { '2.5': 0, '3.5': 0, '4.5': 2, '5.5': 0, '6.5': 2, '7.5': 0, '8.5': 2, '9.5': 0, '10.5': 2 } },
  { itemNo: '01-PAL-HP01-110', name: 'Álstífur', weekPrice: 0, quantities: { '2.5': 0, '3.5': 0, '4.5': 0, '5.5': 0, '6.5': 0, '7.5': 0, '8.5': 0, '9.5': 0, '10.5': 0 } },
]

export const ROLLING_TYPES = [
  { key: 'narrow', label: 'Mjór pallur (0.75m)', width: 0.75 },
  { key: 'wide', label: 'Breiður pallur (1.35m)', width: 1.35 },
  { key: 'quickly', label: 'Quickly pallur', width: 0 },
] as const

export const HEIGHT_OPTIONS = ['2.5', '3.5', '4.5', '5.5', '6.5', '7.5', '8.5', '9.5', '10.5'] as const
