// Scaffolding products — Facade scaffolding (Layher Allround)
// Daily rental prices (kr/day), weights (kg), sale prices (kr)

export const SCAFFOLD_ITEMS = [
  { itemNo: '01-PAL-VP01-000', saleNo: '97100000', name: 'Rammar 2,0m', dailyRate: 19, weight: 18.6, salePrice: 23895 },
  { itemNo: '01-PAL-VP01-001', saleNo: '97100001', name: 'Rammar 0,7m', dailyRate: 15, weight: 7.52, salePrice: 12867 },
  { itemNo: '01-PAL-VP01-083', saleNo: '97100083', name: '12cm hækkun f/ramma', dailyRate: 2, weight: 0.6, salePrice: 1717 },
  { itemNo: '01-PAL-VP01-002', saleNo: '97100002', name: 'Gólfborð 1,8m', dailyRate: 12, weight: 13.9, salePrice: 15995 },
  { itemNo: '01-PAL-VP01-003', saleNo: '97100003', name: 'Stigapallar 1,8m', dailyRate: 50, weight: 17, salePrice: 40531 },
  { itemNo: '01-PAL-VP01-004', saleNo: '97100004', name: 'Stigar 2,0m', dailyRate: 17, weight: 8, salePrice: 12026 },
  { itemNo: '01-PAL-VP01-005', saleNo: '97100005', name: 'Stigar 2,7m', dailyRate: 25, weight: 11.5, salePrice: 18175 },
  { itemNo: '01-PAL-VP01-084', saleNo: '97100084', name: 'Framlenging á 2m stiga', dailyRate: 3, weight: 4, salePrice: 4150 },
  { itemNo: '01-PAL-VP01-006', saleNo: '97100006', name: 'Lappir 50cm', dailyRate: 6, weight: 3.1, salePrice: 4995 },
  { itemNo: '01-PAL-VP01-007', saleNo: '97100007', name: 'Lappir 100cm', dailyRate: 8, weight: 4.5, salePrice: 6995 },
  { itemNo: '01-PAL-VP01-0101', saleNo: '971000101', name: 'Tvöföld handrið', dailyRate: 15, weight: 8.8, salePrice: 14097 },
  { itemNo: '01-PAL-VP01-011', saleNo: '97100011', name: 'Handriðastoðir', dailyRate: 7, weight: 3.4, salePrice: 8807 },
  { itemNo: '01-PAL-VP01-012', saleNo: '97100012', name: 'Veggfestingar 50cm', dailyRate: 3, weight: 3.0, salePrice: 3695 },
  { itemNo: '01-PAL-VP01-047', saleNo: '97100047', name: 'Veggfestingar 100cm', dailyRate: 6, weight: 3.4, salePrice: 4688 },
  { itemNo: '01-PAL-VP01-017', saleNo: '97100017', name: 'Endalokur', dailyRate: 9, weight: 1.2, salePrice: 4348 },
  { itemNo: '01-PAL-VP01-013', saleNo: '97100013', name: 'Stálrör 1,2m', dailyRate: 5, weight: 4, salePrice: 2995 },
  { itemNo: '01-PAL-VP01-015', saleNo: '97100015', name: 'Klemmur', dailyRate: 3, weight: 1.3, salePrice: 1695 },
  { itemNo: '01-PAL-VP01-016', saleNo: '97100016', name: 'Snúklemmur', dailyRate: 3, weight: 1.4, salePrice: 1896 },
  { itemNo: '01-PAL-VP01-020', saleNo: '97100020', name: 'Splitti', dailyRate: 0.5, weight: 0.08, salePrice: 320 },
  { itemNo: '01-PAL-VP01-090', saleNo: '97100090', name: 'Burðarbitar 3,6m', dailyRate: 148, weight: 0, salePrice: 235857 },
  { itemNo: '01-PAL-VP01-091', saleNo: '97100091', name: 'Burðarbitar 5,4m', dailyRate: 163, weight: 0, salePrice: 274135 },
  { itemNo: '01-PAL-VP01-021', saleNo: '97100021', name: 'Rekkar fyrir ramma 50 stk.', dailyRate: 81, weight: 65, salePrice: 81700 },
  { itemNo: '01-PAL-VP01-077', saleNo: '97100077', name: 'Rekkar fyrir gólf 40 stk.', dailyRate: 64, weight: 43, salePrice: 40517 },
  { itemNo: '01-PAL-VP01-0109', saleNo: '971000109', name: 'Rekki f/tvöföld handrið 40 stk.', dailyRate: 64, weight: 20, salePrice: 38095 },
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
