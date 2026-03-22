// Scaffolding products — Facade scaffolding (Layher Allround)
// Daily rental prices (kr/day), weights (kg), sale prices (kr)
// Source: Leigulager allt.xlsx, sub-group 01-PAL-VP01 (50 items)

export const SCAFFOLD_ITEMS = [
  // --- Frames & Risers ---
  { itemNo: '01-PAL-VP01-000', saleNo: '97100000', name: 'Rammar 2,0m', dailyRate: 19, weight: 18.6, salePrice: 23895 },
  { itemNo: '01-PAL-VP01-001', saleNo: '97100001', name: 'Rammar 0,7m', dailyRate: 15, weight: 7.52, salePrice: 12867 },
  { itemNo: '01-PAL-VP01-083', saleNo: '97100083', name: '12cm hækkun f/ramma', dailyRate: 2, weight: 2.5, salePrice: 1717 },
  { itemNo: '01-PAL-VP01-020', saleNo: '97100020', name: 'Splitti f/ramma', dailyRate: 1, weight: 0.08, salePrice: 320 },
  // --- Floors & Platforms ---
  { itemNo: '01-PAL-VP01-002', saleNo: '97100002', name: 'Gólfborð 1,8m', dailyRate: 12, weight: 13.9, salePrice: 15995 },
  { itemNo: '01-PAL-VP01-003', saleNo: '97100003', name: 'Stigapallar 1,8m', dailyRate: 50, weight: 17, salePrice: 40531 },
  { itemNo: '01-PAL-VP01-078', saleNo: '97100078', name: 'Öryggisfesting f/gólf', dailyRate: 7, weight: 0, salePrice: 5481 },
  // --- Stairs & Ladders ---
  { itemNo: '01-PAL-VP01-004', saleNo: '97100004', name: 'Stigar 2,0m', dailyRate: 17, weight: 8, salePrice: 12026 },
  { itemNo: '01-PAL-VP01-005', saleNo: '97100005', name: 'Stigar 2,7m', dailyRate: 25, weight: 11.5, salePrice: 18175 },
  { itemNo: '01-PAL-VP01-084', saleNo: '97100084', name: 'Framlenging á 2m stiga', dailyRate: 3, weight: 3.75, salePrice: 4150 },
  { itemNo: '01-PAL-VP01-200', saleNo: '97100200', name: 'Álstigi 800×2500mm', dailyRate: 403, weight: 10, salePrice: 455520 },
  { itemNo: '01-PAL-VP01-201', saleNo: '97100201', name: 'Festing f/álstiga 2m', dailyRate: 10, weight: 5, salePrice: 7398 },
  { itemNo: '01-PAL-VP01-202', saleNo: '97100202', name: 'Handrið á efstu hæð f/tröpput.', dailyRate: 48, weight: 5, salePrice: 27983 },
  // --- Legs & Jacks ---
  { itemNo: '01-PAL-VP01-006', saleNo: '97100006', name: 'Lappir 50cm', dailyRate: 6, weight: 3.1, salePrice: 4995 },
  { itemNo: '01-PAL-VP01-007', saleNo: '97100007', name: 'Lappir 100cm', dailyRate: 8, weight: 4.05, salePrice: 6995 },
  { itemNo: '01-PAL-VP01-071', saleNo: '97100071', name: 'Lappir 70cm', dailyRate: 7, weight: 4.05, salePrice: 5997 },
  { itemNo: '01-PAL-VP01-064', saleNo: '97100064', name: 'Veltilappir 50cm galv.', dailyRate: 7, weight: 2.5, salePrice: 5795 },
  // --- Guardrails ---
  { itemNo: '01-PAL-VP01-010', saleNo: '97100010', name: 'Handrið 1,8m', dailyRate: 3, weight: 2.3, salePrice: 3410 },
  { itemNo: '01-PAL-VP01-0101', saleNo: '971000101', name: 'Tvöföld handrið 1,8m', dailyRate: 15, weight: 8.8, salePrice: 14097 },
  { itemNo: '01-PAL-VP01-011', saleNo: '97100011', name: 'Handriðastoðir', dailyRate: 7, weight: 3.4, salePrice: 8807 },
  { itemNo: '01-PAL-VP01-045', saleNo: '97100045', name: 'Handriðastoðir 1,8m', dailyRate: 9, weight: 3.4, salePrice: 12165 },
  { itemNo: '01-PAL-VP01-017', saleNo: '97100017', name: 'Endahandrið', dailyRate: 9, weight: 1.17, salePrice: 4348 },
  // --- Toeboards ---
  { itemNo: '01-PAL-VP01-048', saleNo: '97100048', name: 'Táborð 1,0m galv.', dailyRate: 4, weight: 2.28, salePrice: 4018 },
  { itemNo: '01-PAL-VP01-049', saleNo: '97100049', name: 'Táborð 1,8m galv.', dailyRate: 5, weight: 4.5, salePrice: 4755 },
  // --- Wall Ties ---
  { itemNo: '01-PAL-VP01-012', saleNo: '97100012', name: 'Veggfestingar 50cm', dailyRate: 3, weight: 2.3, salePrice: 3695 },
  { itemNo: '01-PAL-VP01-047', saleNo: '97100047', name: 'Veggfestingar 80cm', dailyRate: 6, weight: 2.9, salePrice: 4688 },
  { itemNo: '01-PAL-VP01-060', saleNo: '97100060', name: 'Veggfestingar 130cm', dailyRate: 6, weight: 4.4, salePrice: 0 },
  // --- Diagonal Braces ---
  { itemNo: '01-PAL-VP01-008', saleNo: '97100008', name: 'Skástífur 2,12m', dailyRate: 3, weight: 2.65, salePrice: 3580 },
  { itemNo: '01-PAL-VP01-056', saleNo: '97100056', name: 'Skástífur f/breikkanir galv.', dailyRate: 10, weight: 7, salePrice: 15713 },
  // --- Steel Tubes & Clamps ---
  { itemNo: '01-PAL-VP01-0125', saleNo: '971000125', name: 'Stálrör 1,0m', dailyRate: 3, weight: 3.33, salePrice: 0 },
  { itemNo: '01-PAL-VP01-013', saleNo: '97100013', name: 'Stálrör 1,2m', dailyRate: 3, weight: 4, salePrice: 2995 },
  { itemNo: '01-PAL-VP01-014', saleNo: '97100014', name: 'Stálrör 2,0m', dailyRate: 4, weight: 6.66, salePrice: 3644 },
  { itemNo: '01-PAL-VP01-067', saleNo: '97100067', name: 'Rör galv 6m 1½"', dailyRate: 12, weight: 19.98, salePrice: 20552 },
  { itemNo: '01-PAL-VP01-015', saleNo: '97100015', name: 'Klemmur fastar', dailyRate: 3, weight: 1.4, salePrice: 1695 },
  { itemNo: '01-PAL-VP01-016', saleNo: '97100016', name: 'Snúklemmur', dailyRate: 3, weight: 1.5, salePrice: 1896 },
  { itemNo: '01-PAL-VP01-0161', saleNo: '971000161', name: 'Klemmur m/öryggisfallpinna', dailyRate: 3, weight: 1.5, salePrice: 2211 },
  { itemNo: '01-PAL-VP01-061', saleNo: '97100061', name: 'Samtengistautar f/rör', dailyRate: 8, weight: 0, salePrice: 665 },
  { itemNo: '01-PAL-VP01-062', saleNo: '97100062', name: 'Samtengiklemmur f/rör', dailyRate: 8, weight: 0, salePrice: 5525 },
  // --- Wideners ---
  { itemNo: '01-PAL-VP01-055', saleNo: '97100055', name: 'Breikkanir f/vinnupalla 1,05m', dailyRate: 20, weight: 9.05, salePrice: 33716 },
  { itemNo: '01-PAL-VP01-549', saleNo: '97100549', name: 'Breikkanir f/vinnupalla 0,55m', dailyRate: 12, weight: 3.5, salePrice: 14093 },
  // --- Hoists & Pulleys ---
  { itemNo: '01-PAL-VP01-022', saleNo: '97100022', name: 'Talía', dailyRate: 31, weight: 2.3, salePrice: 51200 },
  { itemNo: '01-PAL-VP01-023', saleNo: '97100023', name: 'Gálgi fyrir talíu', dailyRate: 31, weight: 2.3, salePrice: 27300 },
  // --- Trestles ---
  { itemNo: '01-PAL-VP01-085', saleNo: '97100085', name: 'Búkkar 110/190 málað', dailyRate: 20, weight: 0, salePrice: 18837 },
  // --- Beam Carriers ---
  { itemNo: '01-PAL-VP01-090', saleNo: '97100090', name: 'Burðarbitar 3,6m (par)', dailyRate: 148, weight: 67.4, salePrice: 235857 },
  { itemNo: '01-PAL-VP01-091', saleNo: '97100091', name: 'Burðarbitar 5,4m (par)', dailyRate: 163, weight: 0, salePrice: 274135 },
  // --- Racks & Storage ---
  { itemNo: '01-PAL-VP01-021', saleNo: '97100021', name: 'Rekkar fyrir ramma', dailyRate: 81, weight: 73, salePrice: 81700 },
  { itemNo: '01-PAL-VP01-0212', saleNo: '971000212', name: 'Rekkar fyrir ramma galv.', dailyRate: 65, weight: 0, salePrice: 24293 },
  { itemNo: '01-PAL-VP01-077', saleNo: '97100077', name: 'Rekkar fyrir gólf', dailyRate: 64, weight: 32.6, salePrice: 40517 },
  { itemNo: '01-PAL-VP01-079', saleNo: '97100079', name: 'Rekkar f/gólf samsett galv.', dailyRate: 52, weight: 0, salePrice: 65594 },
  { itemNo: '01-PAL-VP01-0109', saleNo: '971000109', name: 'Rekki f/tvöföld handrið', dailyRate: 64, weight: 20, salePrice: 38095 },
  { itemNo: '01-MÓT-AH21-046', saleNo: '97201046', name: 'Fylgihlutagrind', dailyRate: 100, weight: 30, salePrice: 0 },
] as const

export const BOARD_LENGTH_M = 1.8
export const WALL_ANCHOR_AREA_M2 = 15
export const RACK_FRAME_SLOTS = 50
export const RACK_FLOOR_SLOTS = 40
export const RACK_HANDRAIL_SLOTS = 38
export const SLOTS_PER_FRAME_2M = 1
export const SLOTS_PER_FRAME_07M = 0.5
export const SMALL_ITEMS_PER_GRID = 100
