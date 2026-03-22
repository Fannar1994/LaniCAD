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
  { id: '01-MÓT-LM51-041', articleNumber: '97100041', name: 'Loftastoðir 0,7–1,2M (Málað)', minHeight: 0.7, maxHeight: 1.2, kN_min: 25.9, kN_max: 20.8, weight_kg: 5.8, classLabel: 'A', classKey: 'A', dayRate: 16, weekRate: 112, salePrice: 5422 },
  { id: '01-MÓT-LM51-027', articleNumber: '97100027', name: 'Loftastoðir 1,6–3,0M (Málað)', minHeight: 1.6, maxHeight: 3.0, kN_min: 11.7, kN_max: 3.3, weight_kg: 9.75, classLabel: 'A', classKey: 'A', dayRate: 16, weekRate: 112, salePrice: 6689 },
  { id: '01-MÓT-LM51-026', articleNumber: '97100026', name: 'Loftastoðir 2,0–3,5M (Málað)', minHeight: 2.0, maxHeight: 3.5, kN_min: 7.5, kN_max: 2.4, weight_kg: 10.26, classLabel: 'A', classKey: 'A', dayRate: 16, weekRate: 112, salePrice: 7547 },
  { id: '01-MÓT-LM51-029', articleNumber: '97100029', name: 'Loftastoðir 1,6–2,9M (Galv.)', minHeight: 1.6, maxHeight: 2.9, kN_min: 11.7, kN_max: 3.6, weight_kg: 11.0, classLabel: 'A', classKey: 'A', dayRate: 20, weekRate: 140, salePrice: 9174 },
  { id: '01-MÓT-LM51-028', articleNumber: '97100028', name: 'Loftastoðir 2,0–3,5M (Galv.)', minHeight: 2.0, maxHeight: 3.5, kN_min: 7.5, kN_max: 2.4, weight_kg: 11.0, classLabel: 'A', classKey: 'A', dayRate: 20, weekRate: 140, salePrice: 10340 },
  { id: '01-MÓT-LM51-092', articleNumber: '97100092', name: 'Loftastoðir B/D30 175/300', minHeight: 1.75, maxHeight: 3.0, kN_min: 13.1, kN_max: 4.4, weight_kg: 16.89, classLabel: 'B/D', classKey: 'BD', dayRate: 30, weekRate: 210, salePrice: 17633 },
  { id: '01-MÓT-LM51-031', articleNumber: '97100031', name: 'Loftastoðir B30 178/300 HPE Galv.', minHeight: 1.78, maxHeight: 3.0, kN_min: 12.6, kN_max: 4.4, weight_kg: 16.8, classLabel: 'B', classKey: 'B', dayRate: 28, weekRate: 196, salePrice: 20869 },
  { id: '01-MÓT-LM51-913', articleNumber: '97100913', name: 'Loftastoðir CE30 179/300 Galv.', minHeight: 1.79, maxHeight: 3.0, kN_min: 18.7, kN_max: 6.7, weight_kg: 10.26, classLabel: 'C/E', classKey: 'CE', dayRate: 40, weekRate: 280, salePrice: 21750 },
  { id: '01-MÓT-LM51-032', articleNumber: '97100032', name: 'Loftastoðir B35 200/350 HPE Galv.', minHeight: 2.0, maxHeight: 3.5, kN_min: 10.0, kN_max: 3.3, weight_kg: 17.4, classLabel: 'B', classKey: 'B', dayRate: 28, weekRate: 196, salePrice: 18706 },
  { id: '01-MÓT-LM51-091', articleNumber: '97100091', name: 'Loftastoðir CD35 201/350 Galv.', minHeight: 2.01, maxHeight: 3.5, kN_min: 14.9, kN_max: 4.9, weight_kg: 20.5, classLabel: 'C/D', classKey: 'CD', dayRate: 40, weekRate: 280, salePrice: 21395 },
  { id: '01-MÓT-LM51-235', articleNumber: '97100235', name: 'Loftastoðir E35 (201/350)', minHeight: 2.01, maxHeight: 3.5, kN_min: 30.0, kN_max: 30.0, weight_kg: 20.5, classLabel: 'E', classKey: 'E', dayRate: 40, weekRate: 280, salePrice: 19995 },
  { id: '01-MÓT-LM51-935', articleNumber: 'FA8169012C', name: 'Faresin Loftastoðir E35 200/350 (Galv.)', minHeight: 2.0, maxHeight: 3.5, kN_min: 30.0, kN_max: 30.0, weight_kg: 0, classLabel: 'E', classKey: 'E', dayRate: 40, weekRate: 280, salePrice: 19621 },
  { id: '01-MÓT-LM51-048', articleNumber: '97100048', name: 'Loftastoðir B45 260/480 Galv.', minHeight: 2.6, maxHeight: 4.8, kN_min: 5.9, kN_max: 1.7, weight_kg: 21.18, classLabel: 'B', classKey: 'B', dayRate: 28, weekRate: 196, salePrice: 39669 },
  { id: '01-MÓT-LM51-080', articleNumber: '97100209', name: 'Loftastoðir D45', minHeight: 2.6, maxHeight: 4.5, kN_min: 20.0, kN_max: 20.0, weight_kg: 42.0, classLabel: 'D', classKey: 'D', dayRate: 60, weekRate: 420, salePrice: 24650 },
  { id: '01-MÓT-LM51-079', articleNumber: '97100079', name: 'Loftastoðir D55 301/550 Galv.', minHeight: 3.01, maxHeight: 5.5, kN_min: 20.0, kN_max: 20.0, weight_kg: 42.0, classLabel: 'D', classKey: 'D', dayRate: 70, weekRate: 490, salePrice: 40795 },
]

export const MOTABITAR: BeamData[] = [
  { id: '01-MÓT-LM71-924', articleNumber: '0153924', name: 'HT-20 2,45 m', length_m: 2.45, weight_kg: 11.27, dayRate: 17, weekRate: 119, salePrice: 8647 },
  { id: '01-MÓT-LM71-926', articleNumber: '0153926', name: 'HT-20 2,65 m', length_m: 2.65, weight_kg: 12.19, dayRate: 19, weekRate: 133, salePrice: 9471 },
  { id: '01-MÓT-LM71-929', articleNumber: '0153929', name: 'HT-20 2,9 m', length_m: 2.9, weight_kg: 13.34, dayRate: 20, weekRate: 140, salePrice: 10295 },
  { id: '01-MÓT-LM71-933', articleNumber: '0153933', name: 'HT-20 3,3 m', length_m: 3.3, weight_kg: 13.34, dayRate: 21, weekRate: 145, salePrice: 11634 },
  { id: '01-MÓT-LM71-936', articleNumber: '0153936', name: 'HT-20 3,6 m', length_m: 3.6, weight_kg: 16.56, dayRate: 25, weekRate: 175, salePrice: 13076 },
  { id: '01-MÓT-LM71-939', articleNumber: '0153939', name: 'HT-20 3,9 m', length_m: 3.9, weight_kg: 17.94, dayRate: 27, weekRate: 189, salePrice: 17633 },
  { id: '01-MÓT-LM71-949', articleNumber: '0153949', name: 'HT-20 4,9 m', length_m: 4.9, weight_kg: 22.54, dayRate: 34, weekRate: 238, salePrice: 17299 },
]

export const AUKAHLUTIR: AccessoryData[] = [
  { id: '01-MÓT-LM51-024', name: 'Þrífótur f/ Loftastoðir', weight_kg: 11.55, dayRate: 28, weekRate: 196, salePrice: 10156 },
  { id: '01-MÓT-LM51-095', name: 'Framlenging f/ Loftastoðir 100cm', weight_kg: 11.55, dayRate: 16, weekRate: 112, salePrice: 6295 },
  { id: '01-MÓT-LM51-040', name: 'Rekkar fyrir Loftastoðir (Málað)', weight_kg: 32.6, dayRate: 64, weekRate: 448, salePrice: 45580 },
  { id: '01-MÓT-LM51-954', name: 'Faresin Loftastoðarekki (Galv.)', weight_kg: 0, dayRate: 106, weekRate: 745, salePrice: 114955 },
  { id: '01-MÓT-LM51-025', name: 'Gafflar stórir', weight_kg: 2.5, dayRate: 16, weekRate: 112, salePrice: 2515 },
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
