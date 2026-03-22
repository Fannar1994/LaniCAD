// Mobile scaffolding (hjólapallar) pricing and component data

export interface RollingPricing {
  '24h': number
  extra: number
  week: number
  deposit: number
}

export const NARROW_PRICING: Record<string, RollingPricing> = {
  '2.5': { '24h': 4717, extra: 2359, week: 11794, deposit: 10000 },
  '3.5': { '24h': 5942, extra: 2971, week: 14855, deposit: 12000 },
  '4.5': { '24h': 7620, extra: 3810, week: 19051, deposit: 15000 },
  '5.5': { '24h': 8845, extra: 4423, week: 22113, deposit: 16500 },
  '6.5': { '24h': 10524, extra: 5262, week: 26309, deposit: 19500 },
  '7.5': { '24h': 11748, extra: 5874, week: 29371, deposit: 21000 },
  '8.5': { '24h': 13427, extra: 6713, week: 33566, deposit: 24000 },
  '9.5': { '24h': 15649, extra: 7825, week: 39123, deposit: 25000 },
  '10.5': { '24h': 16647, extra: 8324, week: 41618, deposit: 28000 },
}

export const WIDE_PRICING: Record<string, RollingPricing> = {
  '2.5': { '24h': 5443, extra: 2722, week: 13608, deposit: 12000 },
  '3.5': { '24h': 6713, extra: 3357, week: 16783, deposit: 14000 },
  '4.5': { '24h': 9253, extra: 4627, week: 23134, deposit: 17000 },
  '5.5': { '24h': 10524, extra: 5262, week: 26309, deposit: 19000 },
  '6.5': { '24h': 12157, extra: 6079, week: 30391, deposit: 22000 },
  '7.5': { '24h': 13427, extra: 6714, week: 33566, deposit: 24000 },
  '8.5': { '24h': 15060, extra: 7530, week: 37649, deposit: 27000 },
  '9.5': { '24h': 17237, extra: 8619, week: 43092, deposit: 28000 },
  '10.5': { '24h': 22499, extra: 11250, week: 56247, deposit: 31000 },
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
  { itemNo: '01-PAL-HP01-106', name: 'Álrammar B1 2,1m', weekPrice: 1588, quantities: { '2.5': 2, '3.5': 4, '4.5': 4, '5.5': 6, '6.5': 6, '7.5': 8, '8.5': 8, '9.5': 10, '10.5': 10 } },
  { itemNo: '01-PAL-HP01-107', name: 'Álrammar B5 1,05m', weekPrice: 851, quantities: { '2.5': 2, '3.5': 0, '4.5': 2, '5.5': 0, '6.5': 2, '7.5': 0, '8.5': 2, '9.5': 0, '10.5': 2 } },
  { itemNo: '01-PAL-HP01-117', name: 'Gólfborð M/Opi PB25', weekPrice: 1701, quantities: { '2.5': 1, '3.5': 1, '4.5': 2, '5.5': 2, '6.5': 3, '7.5': 3, '8.5': 4, '9.5': 5, '10.5': 5 } },
  { itemNo: '01-PAL-HP01-108', name: 'Handrið H25', weekPrice: 397, quantities: { '2.5': 4, '3.5': 4, '4.5': 6, '5.5': 6, '6.5': 8, '7.5': 8, '8.5': 10, '9.5': 12, '10.5': 14 } },
  { itemNo: '01-PAL-HP01-109', name: 'Skástífur D25', weekPrice: 397, quantities: { '2.5': 4, '3.5': 8, '4.5': 8, '5.5': 12, '6.5': 12, '7.5': 16, '8.5': 16, '9.5': 20, '10.5': 20 } },
  { itemNo: '01-PAL-HP01-112', name: 'Stillanl.fætur f/hjól', weekPrice: 0, quantities: { '2.5': 4, '3.5': 4, '4.5': 4, '5.5': 4, '6.5': 4, '7.5': 4, '8.5': 4, '9.5': 4, '10.5': 4 } },
  { itemNo: '01-PAL-HP01-111', name: 'Hjól 200mm', weekPrice: 510, quantities: { '2.5': 4, '3.5': 4, '4.5': 4, '5.5': 4, '6.5': 4, '7.5': 4, '8.5': 4, '9.5': 4, '10.5': 4 } },
  { itemNo: '01-PAL-HP01-115', name: 'Álstífur Stillanlegar', weekPrice: 1134, quantities: { '2.5': 0, '3.5': 0, '4.5': 2, '5.5': 2, '6.5': 2, '7.5': 2, '8.5': 2, '9.5': 2, '10.5': 2 } },
]

export const WIDE_COMPONENTS: ScaffoldComponent[] = [
  { itemNo: '01-PAL-HP01-102', name: 'Álrammar F1 2,1m', weekPrice: 1701, quantities: { '2.5': 2, '3.5': 4, '4.5': 4, '5.5': 6, '6.5': 6, '7.5': 8, '8.5': 8, '9.5': 10, '10.5': 10 } },
  { itemNo: '01-PAL-HP01-103', name: 'Álrammar F5 1,05m', weekPrice: 907, quantities: { '2.5': 2, '3.5': 0, '4.5': 2, '5.5': 0, '6.5': 2, '7.5': 0, '8.5': 2, '9.5': 0, '10.5': 12 } },
  { itemNo: '01-PAL-HP01-118', name: 'Gólfborð P25', weekPrice: 1474, quantities: { '2.5': 1, '3.5': 1, '4.5': 2, '5.5': 2, '6.5': 3, '7.5': 3, '8.5': 4, '9.5': 5, '10.5': 6 } },
  { itemNo: '01-PAL-HP01-117', name: 'Gólfborð M/Opi PB25', weekPrice: 1701, quantities: { '2.5': 1, '3.5': 1, '4.5': 1, '5.5': 1, '6.5': 1, '7.5': 1, '8.5': 1, '9.5': 1, '10.5': 1 } },
  { itemNo: '01-PAL-HP01-108', name: 'Handrið H25', weekPrice: 397, quantities: { '2.5': 4, '3.5': 4, '4.5': 6, '5.5': 6, '6.5': 8, '7.5': 8, '8.5': 10, '9.5': 12, '10.5': 14 } },
  { itemNo: '01-PAL-HP01-109', name: 'Skástífur D25', weekPrice: 397, quantities: { '2.5': 4, '3.5': 8, '4.5': 8, '5.5': 12, '6.5': 12, '7.5': 16, '8.5': 16, '9.5': 20, '10.5': 20 } },
  { itemNo: '01-PAL-HP01-112', name: 'Stillanl.fætur f/hjól', weekPrice: 0, quantities: { '2.5': 4, '3.5': 4, '4.5': 4, '5.5': 4, '6.5': 4, '7.5': 4, '8.5': 4, '9.5': 4, '10.5': 4 } },
  { itemNo: '01-PAL-HP01-111', name: 'Hjól 200mm', weekPrice: 510, quantities: { '2.5': 4, '3.5': 4, '4.5': 4, '5.5': 4, '6.5': 4, '7.5': 4, '8.5': 4, '9.5': 4, '10.5': 4 } },
  { itemNo: '01-PAL-HP01-115', name: 'Stuðningsfætur stillanlegar', weekPrice: 1134, quantities: { '2.5': 0, '3.5': 0, '4.5': 2, '5.5': 2, '6.5': 2, '7.5': 2, '8.5': 2, '9.5': 2, '10.5': 2 } },
]

export const QUICKLY_COMPONENTS: ScaffoldComponent[] = [
  { itemNo: '01-PAL-HP01-127', name: 'Quickly Grunneining 4 mtr.', weekPrice: 4252, quantities: { '4.0': 1 } },
  { itemNo: '01-PAL-HP01-126', name: 'Gólfborð M/Opi PB20', weekPrice: 1417, quantities: { '4.0': 1 } },
  { itemNo: '01-PAL-HP01-124', name: 'Handrið H20', weekPrice: 397, quantities: { '4.0': 2 } },
  { itemNo: '01-PAL-HP01-107', name: 'Álrammar B5 1,05m', weekPrice: 851, quantities: { '4.0': 2 } },
]

export const SUPPORT_LEG_COMPONENT: ScaffoldComponent = {
  itemNo: '01-PAL-HP01-116', name: 'Stuðn.stoðir án hjóla', weekPrice: 1134, quantities: { default: 2 },
}

export const ROLLING_TYPES = [
  { key: 'narrow', label: 'Mjór pallur (0.75m)', width: 0.75 },
  { key: 'wide', label: 'Breiður pallur (1.35m)', width: 1.35 },
  { key: 'quickly', label: 'Quickly pallur', width: 0 },
] as const

export const HEIGHT_OPTIONS = ['2.5', '3.5', '4.5', '5.5', '6.5', '7.5', '8.5', '9.5', '10.5'] as const
