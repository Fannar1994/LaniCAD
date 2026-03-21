// Ceiling props and beams data

export interface CeilingPropData {
  id: string
  articleNumber: string
  name: string
  minHeight: number
  maxHeight: number
  kN_min: number
  kN_max: number
  weight_kg: number
  classLabel: string
  classKey: string
  dayRate: number
  weekRate: number
  salePrice: number
}

export interface BeamData {
  id: string
  articleNumber: string
  name: string
  length_m: number
  weight_kg: number
  dayRate: number
  weekRate: number
  salePrice: number
}

export interface AccessoryData {
  id: string
  name: string
  weight_kg: number
  dayRate: number
  weekRate: number
  salePrice: number
}

export const LOFTASTODIR: CeilingPropData[] = [
  { id: '01-MÓT-LM51-000', articleNumber: '97200039', name: 'Villalta 070/120M', minHeight: 0.7, maxHeight: 1.2, kN_min: 52.1, kN_max: 20, weight_kg: 6.1, classLabel: 'A', classKey: 'A', dayRate: 16, weekRate: 60, salePrice: 5422 },
  { id: '01-MÓT-LM51-001', articleNumber: '97200040', name: 'Villalta 100/180M', minHeight: 1.0, maxHeight: 1.8, kN_min: 52.1, kN_max: 20, weight_kg: 7.4, classLabel: 'A', classKey: 'A', dayRate: 18, weekRate: 67, salePrice: 6595 },
  { id: '01-MÓT-LM51-002', articleNumber: '97200041', name: 'Villalta 120/200M', minHeight: 1.2, maxHeight: 2.0, kN_min: 52.1, kN_max: 20, weight_kg: 8.0, classLabel: 'A-B', classKey: 'A', dayRate: 20, weekRate: 75, salePrice: 7195 },
  { id: '01-MÓT-LM51-003', articleNumber: '97200042', name: 'Villalta 160/290M', minHeight: 1.6, maxHeight: 2.9, kN_min: 35, kN_max: 20, weight_kg: 10.8, classLabel: 'B-BD', classKey: 'BD', dayRate: 25, weekRate: 93, salePrice: 10495 },
  { id: '01-MÓT-LM51-004', articleNumber: '97200043', name: 'Villalta 200/350M', minHeight: 2.0, maxHeight: 3.5, kN_min: 35, kN_max: 15, weight_kg: 12.2, classLabel: 'B-CD', classKey: 'CD', dayRate: 30, weekRate: 112, salePrice: 13895 },
  { id: '01-MÓT-LM51-005', articleNumber: '97200044', name: 'Villalta 250/400M', minHeight: 2.5, maxHeight: 4.0, kN_min: 30, kN_max: 12, weight_kg: 14.5, classLabel: 'CE', classKey: 'CE', dayRate: 35, weekRate: 130, salePrice: 17595 },
  { id: '01-MÓT-LM51-006', articleNumber: '97200045', name: 'Villalta 301/500M', minHeight: 3.01, maxHeight: 5.0, kN_min: 30, kN_max: 10, weight_kg: 18.7, classLabel: 'D-E', classKey: 'E', dayRate: 50, weekRate: 186, salePrice: 26995 },
  { id: '01-MÓT-LM51-007', articleNumber: '97200046', name: 'Villalta 301/550M', minHeight: 3.01, maxHeight: 5.5, kN_min: 30, kN_max: 10, weight_kg: 22.0, classLabel: 'E', classKey: 'E', dayRate: 70, weekRate: 260, salePrice: 40795 },
]

export const MOTABITAR: BeamData[] = [
  { id: '01-MÓT-LM71-001', articleNumber: '97200050', name: 'HT-20 Mótabiti 2,45m', length_m: 2.45, weight_kg: 11.1, dayRate: 50, weekRate: 186, salePrice: 16995 },
  { id: '01-MÓT-LM71-002', articleNumber: '97200051', name: 'HT-20 Mótabiti 2,90m', length_m: 2.9, weight_kg: 12.9, dayRate: 60, weekRate: 223, salePrice: 20495 },
  { id: '01-MÓT-LM71-003', articleNumber: '97200052', name: 'HT-20 Mótabiti 3,30m', length_m: 3.3, weight_kg: 14.5, dayRate: 70, weekRate: 260, salePrice: 23995 },
  { id: '01-MÓT-LM71-004', articleNumber: '97200053', name: 'HT-20 Mótabiti 3,90m', length_m: 3.9, weight_kg: 16.9, dayRate: 80, weekRate: 297, salePrice: 28995 },
  { id: '01-MÓT-LM71-005', articleNumber: '97200054', name: 'HT-20 Mótabiti 4,90m', length_m: 4.9, weight_kg: 20.9, dayRate: 100, weekRate: 372, salePrice: 37995 },
  { id: '01-MÓT-LM71-006', articleNumber: '97200055', name: 'Faresin Mótabiti 3,60m', length_m: 3.6, weight_kg: 18.0, dayRate: 90, weekRate: 335, salePrice: 43895 },
  { id: '01-MÓT-LM71-007', articleNumber: '97200056', name: 'Faresin Mótabiti 5,90m', length_m: 5.9, weight_kg: 29.0, dayRate: 140, weekRate: 520, salePrice: 57895 },
]

export const AUKAHLUTIR: AccessoryData[] = [
  { id: '01-MÓT-AH21-041', name: 'Þrífótur', weight_kg: 7, dayRate: 5, weekRate: 19, salePrice: 4500 },
  { id: '01-MÓT-AH21-042', name: 'Framlenging 50cm', weight_kg: 3, dayRate: 3, weekRate: 11, salePrice: 2500 },
  { id: '01-MÓT-AH21-043', name: 'Rekkur (málað)', weight_kg: 45, dayRate: 20, weekRate: 75, salePrice: 15000 },
  { id: '01-MÓT-AH21-044', name: 'Rekkur (galvanísað)', weight_kg: 45, dayRate: 25, weekRate: 93, salePrice: 18000 },
  { id: '01-MÓT-AH21-045', name: 'Gafflar', weight_kg: 2, dayRate: 5, weekRate: 19, salePrice: 3500 },
]

export const CLASS_INFO: Record<string, { label: string; desc: string; kN: string }> = {
  A: { label: 'Flokkur A', desc: 'EN 1065 Class A — lægstu stoðir', kN: '20-52.1 kN' },
  B: { label: 'Flokkur B', desc: 'EN 1065 Class B', kN: '20-35 kN' },
  BD: { label: 'Flokkur B-BD', desc: 'EN 1065 Class BD', kN: '20-35 kN' },
  CD: { label: 'Flokkur CD', desc: 'EN 1065 Class CD', kN: '15-35 kN' },
  CE: { label: 'Flokkur CE', desc: 'EN 1065 Class CE', kN: '12-30 kN' },
  D: { label: 'Flokkur D', desc: 'EN 1065 Class D', kN: '10-30 kN' },
  E: { label: 'Flokkur E', desc: 'EN 1065 Class E — hæstu stoðir', kN: '10-30 kN' },
}
