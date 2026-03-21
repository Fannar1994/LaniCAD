// Scaffolding products — Facade scaffolding (Layher Allround)
// Daily rental prices (kr/day), weights (kg), sale prices (kr)

export const SCAFFOLD_ITEMS = [
  { itemNo: '01-PAL-VP01-001', name: 'Rammar 2,0m', dailyRate: 19, weight: 18.6, salePrice: 23895 },
  { itemNo: '01-PAL-VP01-002', name: 'Rammar 0,7m', dailyRate: 15, weight: 7.52, salePrice: 12867 },
  { itemNo: '01-PAL-VP01-003', name: '12cm hækkun f/ramma', dailyRate: 2, weight: 0.6, salePrice: 1717 },
  { itemNo: '01-PAL-VP01-004', name: 'Gólfborð 1,8m', dailyRate: 12, weight: 13.9, salePrice: 15995 },
  { itemNo: '01-PAL-VP01-005', name: 'Stigapallar 1,8m', dailyRate: 50, weight: 17, salePrice: 40531 },
  { itemNo: '01-PAL-VP01-006', name: 'Stigar 2,0m', dailyRate: 17, weight: 8, salePrice: 12026 },
  { itemNo: '01-PAL-VP01-007', name: 'Stigar 2,7m', dailyRate: 25, weight: 11.5, salePrice: 18175 },
  { itemNo: '01-PAL-VP01-008', name: 'Framlenging á 2m stiga', dailyRate: 3, weight: 4, salePrice: 4150 },
  { itemNo: '01-PAL-VP01-009', name: 'Lappir 50cm', dailyRate: 6, weight: 3.1, salePrice: 4995 },
  { itemNo: '01-PAL-VP01-010', name: 'Lappir 100cm', dailyRate: 8, weight: 4.5, salePrice: 6995 },
  { itemNo: '01-PAL-VP01-011', name: 'Tvöföld handrið', dailyRate: 15, weight: 8.8, salePrice: 14097 },
  { itemNo: '01-PAL-VP01-012', name: 'Handriðastoðir', dailyRate: 7, weight: 3.4, salePrice: 8807 },
  { itemNo: '01-PAL-VP01-013', name: 'Veggfestingar 50cm', dailyRate: 3, weight: 3.0, salePrice: 3695 },
  { itemNo: '01-PAL-VP01-014', name: 'Veggfestingar 100cm', dailyRate: 6, weight: 3.4, salePrice: 4688 },
  { itemNo: '01-PAL-VP01-015', name: 'Endalokur', dailyRate: 9, weight: 1.2, salePrice: 4348 },
  { itemNo: '01-PAL-VP01-016', name: 'Stálrör 1,2m', dailyRate: 5, weight: 4, salePrice: 2995 },
  { itemNo: '01-PAL-VP01-017', name: 'Klemmur', dailyRate: 3, weight: 1.3, salePrice: 1695 },
  { itemNo: '01-PAL-VP01-018', name: 'Snúklemmur', dailyRate: 3, weight: 1.4, salePrice: 1896 },
  { itemNo: '01-PAL-VP01-019', name: 'Splitti', dailyRate: 0.5, weight: 0.08, salePrice: 320 },
  { itemNo: '01-PAL-VP01-020', name: 'Burðarbitar 3,6m', dailyRate: 148, weight: 0, salePrice: 235857 },
  { itemNo: '01-PAL-VP01-021', name: 'Burðarbitar 5,4m', dailyRate: 163, weight: 0, salePrice: 274135 },
  { itemNo: '01-PAL-VP01-022', name: 'Rekkar fyrir ramma 50 stk.', dailyRate: 81, weight: 65, salePrice: 81700 },
  { itemNo: '01-PAL-VP01-023', name: 'Rekkar fyrir gólf 40 stk.', dailyRate: 64, weight: 43, salePrice: 40517 },
  { itemNo: '01-PAL-VP01-024', name: 'Rekki f/tvöföld handrið 40 stk.', dailyRate: 64, weight: 20, salePrice: 38095 },
  { itemNo: '01-PAL-VP01-025', name: 'Fylgihlutagrind', dailyRate: 100, weight: 30, salePrice: 0 },
] as const

export const BOARD_LENGTH_M = 1.8
export const WALL_ANCHOR_AREA_M2 = 15
export const RACK_FRAME_SLOTS = 50
export const RACK_FLOOR_SLOTS = 40
export const RACK_HANDRAIL_SLOTS = 38
