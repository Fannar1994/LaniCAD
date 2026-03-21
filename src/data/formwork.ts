// Formwork product data — ported from motareiknivel-byko-v11.html

export interface FormworkPanel {
  id: string
  desc: string
  w: number
  h: number
  qty: number
  dayRate: number
  weekRate: number
  corner?: 'inside' | 'outside' | 'outside-small' | 'inside-adj'
  comp?: boolean
  mp?: boolean
  special?: string
}

export interface FormworkAccessory {
  id: string
  desc: string
  qty: number
  dayRate: number
  weekRate: number
  cat: string
}

export interface FormworkIDFrame {
  id: string
  desc: string
  qty: number
  dayRate: number
  weekRate: number
  frameW?: number
}

export interface FormworkProp {
  id: string
  desc: string
  minH: number
  maxH: number
  qty: number
  dayRate: number
  weekRate: number
}

export interface FormworkBeam {
  id: string
  desc: string
  length: number
  qty: number
  dayRate: number
  weekRate: number
}

export type FormworkSystem = 'manto' | 'rasto' | 'takko' | 'alufort'

// ---- HM01: Rasto panels ----
export const HM01: FormworkPanel[] = [
  { id: '01-MÓT-HM01-001', desc: 'Rasto Mótaflekar 30×300', w: 30, h: 300, qty: 19, dayRate: 70.16, weekRate: 491.13 },
  { id: '01-MÓT-HM01-624', desc: 'Rasto Mótaflekar 45×300', w: 45, h: 300, qty: 1, dayRate: 70.97, weekRate: 496.77 },
  { id: '01-MÓT-HM01-598', desc: 'Rasto Mótaflekar 60×300', w: 60, h: 300, qty: 17, dayRate: 80.65, weekRate: 564.52 },
  { id: '01-MÓT-HM01-576', desc: 'Rasto Mótaflekar 75×300', w: 75, h: 300, qty: 10, dayRate: 90.32, weekRate: 632.26 },
  { id: '01-MÓT-HM01-565', desc: 'Rasto Mótaflekar 90×300', w: 90, h: 300, qty: 5, dayRate: 103.23, weekRate: 722.58 },
  { id: '01-MÓT-HM01-036', desc: 'Rasto Mótaflekar 240×300', w: 240, h: 300, qty: 0, dayRate: 373.39, weekRate: 2613.71 },
  { id: '01-MÓT-HM01-057', desc: 'Rasto Mótaflekar 45×150', w: 45, h: 150, qty: 8, dayRate: 39.52, weekRate: 276.61 },
  { id: '01-MÓT-HM01-551', desc: 'Rasto Mótaflekar 90×150', w: 90, h: 150, qty: 12, dayRate: 50.00, weekRate: 350.00 },
  { id: '01-MÓT-HM01-131', desc: 'Rasto Mp-Mótaflekar 70×300', w: 70, h: 300, qty: 8, dayRate: 198.39, weekRate: 1388.71, mp: true },
  { id: '01-MÓT-HM01-218', desc: 'Rasto Mp-Mótaflekar 70×150', w: 70, h: 150, qty: 12, dayRate: 83.06, weekRate: 581.45, mp: true },
  { id: '01-MÓT-HM01-635', desc: 'Rasto Innhorn 30/300', w: 30, h: 300, qty: 6, dayRate: 137.90, weekRate: 965.32, corner: 'inside' },
  { id: '01-MÓT-HM01-392', desc: 'Rasto Veltihorn 30/300', w: 30, h: 300, qty: 4, dayRate: 198.39, weekRate: 1388.71, corner: 'outside' },
  { id: '01-MÓT-HM01-856', desc: 'Rasto Úthorn/Veltihorn 15/300', w: 15, h: 300, qty: 4, dayRate: 117.74, weekRate: 824.19, corner: 'outside-small' },
  { id: '01-MÓT-HM01-117', desc: 'Rasto Hornastillar 5×300', w: 5, h: 300, qty: 16, dayRate: 29.84, weekRate: 208.87, comp: true },
]

// ---- HM02: Takko panels ----
export const HM02: FormworkPanel[] = [
  { id: '01-MÓT-HM02-541', desc: 'Takko Mótaflekar 30×120', w: 30, h: 120, qty: 6, dayRate: 33.06, weekRate: 231.45 },
  { id: '01-MÓT-HM02-530', desc: 'Takko Mótaflekar 45×120', w: 45, h: 120, qty: 10, dayRate: 39.52, weekRate: 276.61 },
  { id: '01-MÓT-HM02-520', desc: 'Takko Mótaflekar 60×120', w: 60, h: 120, qty: 10, dayRate: 42.74, weekRate: 299.19 },
  { id: '01-MÓT-HM02-519', desc: 'Takko Mótaflekar 75×120', w: 75, h: 120, qty: 40, dayRate: 46.77, weekRate: 327.42 },
  { id: '01-MÓT-HM02-508', desc: 'Takko Mótaflekar 90×120', w: 90, h: 120, qty: 158, dayRate: 50.00, weekRate: 350.00 },
  { id: '01-MÓT-HM02-574', desc: 'Takko Mp-Mótaflekar 70×120', w: 70, h: 120, qty: 5, dayRate: 83.06, weekRate: 581.45, mp: true },
  { id: '01-MÓT-HM02-042', desc: 'Takko Innhorn 25/120 S', w: 25, h: 120, qty: 9, dayRate: 63.71, weekRate: 445.97, corner: 'inside' },
  { id: '01-MÓT-HM02-552', desc: 'Takko Innhorn 30/120', w: 30, h: 120, qty: -1, dayRate: 63.71, weekRate: 445.97, corner: 'inside' },
  { id: '01-MÓT-HM02-563', desc: 'Takko Veltihorn 30/120', w: 30, h: 120, qty: 11, dayRate: 83.06, weekRate: 581.45, corner: 'outside' },
  { id: '01-MÓT-HM02-009', desc: 'Takko Hornastillar 5×120', w: 5, h: 120, qty: 85, dayRate: 18.55, weekRate: 129.84, comp: true },
]

// ---- KM01: Manto panels ----
export const KM01: FormworkPanel[] = [
  { id: '01-MÓT-KM01-759', desc: 'Manto Mótaflekar 240×330', w: 240, h: 330, qty: -2, dayRate: 404.84, weekRate: 2833.87 },
  { id: '01-MÓT-KM01-760', desc: 'Manto Mótaflekar 120×330', w: 120, h: 330, qty: 2, dayRate: 192.74, weekRate: 1349.19 },
  { id: '01-MÓT-KM01-770', desc: 'Manto Mótaflekar 105×330', w: 105, h: 330, qty: 5, dayRate: 178.23, weekRate: 1247.58 },
  { id: '01-MÓT-KM01-771', desc: 'Manto Mótaflekar 100×330', w: 100, h: 330, qty: -1, dayRate: 178.23, weekRate: 1247.58 },
  { id: '01-MÓT-KM01-781', desc: 'Manto Mótaflekar 90×330', w: 90, h: 330, qty: 7, dayRate: 158.06, weekRate: 1106.45 },
  { id: '01-MÓT-KM01-782', desc: 'Manto Mótaflekar 80×330', w: 80, h: 330, qty: 1, dayRate: 146.77, weekRate: 1027.42 },
  { id: '01-MÓT-KM01-792', desc: 'Manto Mótaflekar 75×330', w: 75, h: 330, qty: 8, dayRate: 146.77, weekRate: 1027.42 },
  { id: '01-MÓT-KM01-807', desc: 'Manto Mótaflekar 70×330', w: 70, h: 330, qty: 45, dayRate: 136.29, weekRate: 954.03 },
  { id: '01-MÓT-KM01-829', desc: 'Manto Mótaflekar 60×330', w: 60, h: 330, qty: 1, dayRate: 128.23, weekRate: 897.58 },
  { id: '01-MÓT-KM01-830', desc: 'Manto Mótaflekar 55×330', w: 55, h: 330, qty: 3, dayRate: 117.74, weekRate: 824.19 },
  { id: '01-MÓT-KM01-840', desc: 'Manto Mótaflekar 45×330', w: 45, h: 330, qty: 3, dayRate: 108.87, weekRate: 762.10 },
  { id: '01-MÓT-KM01-009', desc: 'Manto Mótaflekar 30×330', w: 30, h: 330, qty: 1, dayRate: 94.35, weekRate: 660.48 },
  { id: '01-MÓT-KM01-156', desc: 'Manto Hornastillar 5×330', w: 5, h: 330, qty: 10, dayRate: 62.10, weekRate: 434.68, comp: true },
  { id: '01-MÓT-KM01-996', desc: 'Manto Mótaflekar 240×300', w: 240, h: 300, qty: -69, dayRate: 373.39, weekRate: 2613.71 },
  { id: '01-MÓT-KM01-780', desc: 'Manto Mótaflekar 120×300', w: 120, h: 300, qty: -29, dayRate: 170.97, weekRate: 1196.77 },
  { id: '01-MÓT-KM01-403', desc: 'Manto Mótaflekar 105×300', w: 105, h: 300, qty: -10, dayRate: 163.71, weekRate: 1145.97 },
  { id: '01-MÓT-KM01-414', desc: 'Manto Mótaflekar 90×300', w: 90, h: 300, qty: 103, dayRate: 150.00, weekRate: 1050.00 },
  { id: '01-MÓT-KM01-425', desc: 'Manto Mótaflekar 75×300', w: 75, h: 300, qty: 15, dayRate: 150.81, weekRate: 1055.65 },
  { id: '01-MÓT-KM01-436', desc: 'Manto Mótaflekar 70×300', w: 70, h: 300, qty: 57, dayRate: 151.61, weekRate: 1061.29 },
  { id: '01-MÓT-KM01-056', desc: 'Manto Mótaflekar 65×300', w: 65, h: 300, qty: 11, dayRate: 141.94, weekRate: 993.55 },
  { id: '01-MÓT-KM01-447', desc: 'Manto Mótaflekar 60×300', w: 60, h: 300, qty: 9, dayRate: 132.26, weekRate: 925.81 },
  { id: '01-MÓT-KM01-458', desc: 'Manto Mótaflekar 55×300', w: 55, h: 300, qty: 57, dayRate: 130.65, weekRate: 914.52 },
  { id: '01-MÓT-KM01-469', desc: 'Manto Mótaflekar 45×300', w: 45, h: 300, qty: 26, dayRate: 106.45, weekRate: 745.16 },
  { id: '01-MÓT-KM01-911', desc: 'Manto Mótaflekar 30×300', w: 30, h: 300, qty: 4, dayRate: 90.32, weekRate: 632.26 },
  { id: '01-MÓT-KM01-814', desc: 'Manto Hornastillar 5×300', w: 5, h: 300, qty: 52, dayRate: 33.87, weekRate: 237.10, comp: true },
  { id: '01-MÓT-KM01-055', desc: 'Manto Mótaflekar 240×270', w: 240, h: 270, qty: 4, dayRate: 373.39, weekRate: 2613.71 },
  { id: '01-MÓT-KM01-046', desc: 'Manto Mótaflekar 120×270', w: 120, h: 270, qty: 22, dayRate: 170.97, weekRate: 1196.77 },
  { id: '01-MÓT-KM01-048', desc: 'Manto Mótaflekar 90×270', w: 90, h: 270, qty: 7, dayRate: 150.00, weekRate: 1050.00 },
  { id: '01-MÓT-KM01-049', desc: 'Manto Mótaflekar 70×270', w: 70, h: 270, qty: 4, dayRate: 151.61, weekRate: 1061.29 },
  { id: '01-MÓT-KM01-054', desc: 'Manto Mótaflekar 60×270', w: 60, h: 270, qty: 4, dayRate: 132.26, weekRate: 925.81 },
  { id: '01-MÓT-KM01-058', desc: 'Manto Mótaflekar 55×270', w: 55, h: 270, qty: 7, dayRate: 130.65, weekRate: 914.52 },
  { id: '01-MÓT-KM01-050', desc: 'Manto Mótaflekar 45×270', w: 45, h: 270, qty: 0, dayRate: 106.45, weekRate: 745.16 },
  { id: '01-MÓT-KM01-047', desc: 'Manto Mótaflekar 120×240', w: 120, h: 240, qty: 0, dayRate: 170.97, weekRate: 1196.77 },
  { id: '01-MÓT-KM01-066', desc: 'Manto Mótaflekar 240×120', w: 240, h: 120, qty: 29, dayRate: 84.68, weekRate: 592.74 },
  { id: '01-MÓT-KM01-175', desc: 'Manto Mótaflekar 120×120', w: 120, h: 120, qty: 44, dayRate: 84.68, weekRate: 592.74 },
  { id: '01-MÓT-KM01-186', desc: 'Manto Mótaflekar 105×120', w: 105, h: 120, qty: -6, dayRate: 64.52, weekRate: 451.61 },
  { id: '01-MÓT-KM01-197', desc: 'Manto Mótaflekar 90×120', w: 90, h: 120, qty: 5, dayRate: 82.26, weekRate: 575.81 },
  { id: '01-MÓT-KM01-201', desc: 'Manto Mótaflekar 75×120', w: 75, h: 120, qty: -2, dayRate: 76.61, weekRate: 536.29 },
  { id: '01-MÓT-KM01-212', desc: 'Manto Mótaflekar 70×120', w: 70, h: 120, qty: 14, dayRate: 72.58, weekRate: 508.06 },
  { id: '01-MÓT-KM01-223', desc: 'Manto Mótaflekar 60×120', w: 60, h: 120, qty: 10, dayRate: 68.55, weekRate: 479.84 },
  { id: '01-MÓT-KM01-234', desc: 'Manto Mótaflekar 55×120', w: 55, h: 120, qty: 20, dayRate: 66.13, weekRate: 462.90 },
  { id: '01-MÓT-KM01-245', desc: 'Manto Mótaflekar 45×120', w: 45, h: 120, qty: 9, dayRate: 64.52, weekRate: 451.61 },
  { id: '01-MÓT-KM01-002', desc: 'Manto Mótaflekar 30×120', w: 30, h: 120, qty: 0, dayRate: 60.48, weekRate: 423.39 },
  { id: '01-MÓT-KM01-617', desc: 'Manto Hornastillar 5×120', w: 5, h: 120, qty: 0, dayRate: 0.00, weekRate: 0.00, comp: true },
  { id: '01-MÓT-KM01-437', desc: 'Manto Mótaflekar 240×60', w: 240, h: 60, qty: -10, dayRate: 82.77, weekRate: 579.37 },
  { id: '01-MÓT-KM01-851', desc: 'Manto Innhorn 35/330', w: 35, h: 330, qty: 8, dayRate: 187.10, weekRate: 1309.68, corner: 'inside' },
  { id: '01-MÓT-KM01-457', desc: 'Manto Innhorn 35/300', w: 35, h: 300, qty: 15, dayRate: 187.10, weekRate: 1309.68, corner: 'inside' },
  { id: '01-MÓT-KM01-045', desc: 'Manto Innhorn 35/270', w: 35, h: 270, qty: 2, dayRate: 170.97, weekRate: 1196.77, corner: 'inside' },
  { id: '01-MÓT-KM01-012', desc: 'Manto Innhorn 35/120', w: 35, h: 120, qty: 98, dayRate: 84.68, weekRate: 592.74, corner: 'inside' },
  { id: '01-MÓT-KM01-052', desc: 'Manto Innhorn Stál 30/120', w: 30, h: 120, qty: 1, dayRate: 187.10, weekRate: 1309.68, corner: 'inside' },
  { id: '01-MÓT-KM01-188', desc: 'Manto Veltihorn 35/330', w: 35, h: 330, qty: 2, dayRate: 214.52, weekRate: 1501.61, corner: 'outside' },
  { id: '01-MÓT-KM01-899', desc: 'Manto Veltihorn 35/300', w: 35, h: 300, qty: 15, dayRate: 214.52, weekRate: 1501.61, corner: 'outside' },
  { id: '01-MÓT-KM01-057', desc: 'Manto Veltihorn 35/270', w: 35, h: 270, qty: 1, dayRate: 214.52, weekRate: 1501.61, corner: 'outside' },
  { id: '01-MÓT-KM01-577', desc: 'Manto Veltihorn 35×120', w: 35, h: 120, qty: 2, dayRate: 214.52, weekRate: 1501.61, corner: 'outside' },
  { id: '01-MÓT-KM01-040', desc: 'Manto Úthorn/Veltihorn 20/330', w: 20, h: 330, qty: 52, dayRate: 148.39, weekRate: 1038.71, corner: 'outside-small' },
  { id: '01-MÓT-KM01-222', desc: 'Manto Úthorn/Veltihorn 20/300', w: 20, h: 300, qty: 5, dayRate: 214.52, weekRate: 1501.61, corner: 'outside-small' },
  { id: '01-MÓT-KM01-053', desc: 'Manto Still. Innhorn 30/300', w: 30, h: 300, qty: 4, dayRate: 107.26, weekRate: 750.81, corner: 'inside-adj' },
  { id: '01-MÓT-KM01-330', desc: 'Manto Gólfbitar 200-300', w: 0, h: 0, qty: 18, dayRate: 161.29, weekRate: 1129.03, special: 'floor' },
  { id: '01-MÓT-KM01-401', desc: 'Horn f/Lyftustokka 120', w: 0, h: 120, qty: 1, dayRate: 0.00, weekRate: 0.00, special: 'lift' },
  { id: '01-MÓT-KM01-402', desc: 'Horn f/Lyftustokka 300', w: 0, h: 300, qty: 4, dayRate: 403.23, weekRate: 2822.58, special: 'lift' },
]

// ---- HM21: Rasto/Takko accessories ----
export const HM21: FormworkAccessory[] = [
  { id: '01-MÓT-HM21-000', desc: 'Rasto Réttskeiðarklemmur', qty: 770, dayRate: 4.84, weekRate: 33.87, cat: 'clamp' },
  { id: '01-MÓT-HM21-910', desc: 'Rasto Stillanl.Réttskeiðaklemmur', qty: 278, dayRate: 8.06, weekRate: 56.45, cat: 'clamp' },
  { id: '01-MÓT-HM21-900', desc: 'Rasto Úthornaklemmur', qty: 404, dayRate: 9.68, weekRate: 67.74, cat: 'clamp' },
  { id: '01-MÓT-HM21-110', desc: 'Takko Skástífur (106-131cm)', qty: 63, dayRate: 18.55, weekRate: 129.84, cat: 'brace' },
  { id: '01-MÓT-HM21-381', desc: 'Rasto Tvöfaldar Mótaskástífur', qty: 12, dayRate: 29.03, weekRate: 203.23, cat: 'brace' },
  { id: '01-MÓT-HM21-357', desc: 'Fu-Strekkjari f/Girði', qty: 259, dayRate: 6.45, weekRate: 45.16, cat: 'tie' },
  { id: '01-MÓT-HM21-167', desc: 'Rasto Kranakrókar', qty: 3, dayRate: 22.58, weekRate: 158.06, cat: 'crane' },
  { id: '01-MÓT-HM21-168', desc: 'Rasto Kranakrókar G2', qty: -3, dayRate: 22.58, weekRate: 158.06, cat: 'crane' },
  { id: '01-MÓT-HM21-264', desc: 'RT-Flekaboltar', qty: 56, dayRate: 1.61, weekRate: 11.29, cat: 'bolt' },
  { id: '01-MÓT-HM21-566', desc: 'RT-Flekarær', qty: 73, dayRate: 1.61, weekRate: 11.29, cat: 'tube' },
  { id: '01-MÓT-HM21-435', desc: 'Rasto Mp Boltar', qty: 0, dayRate: 2.42, weekRate: 16.94, cat: 'bolt' },
  { id: '01-MÓT-HM21-457', desc: 'Rasto Mp Rær', qty: 0, dayRate: 1.61, weekRate: 11.29, cat: 'tube' },
  { id: '01-MÓT-HM21-437', desc: 'Rasto/Manto tengistykki', qty: 1, dayRate: 2.88, weekRate: 20.16, cat: 'connector' },
  { id: '01-MÓT-HM21-441', desc: 'Plata f/Rasto/Manto tengistykki', qty: 1, dayRate: 2.88, weekRate: 20.16, cat: 'connector' },
  { id: '01-MÓT-HM21-667', desc: 'Endaklossi MR', qty: 65, dayRate: 6.45, weekRate: 45.16, cat: 'end' },
  { id: '01-MÓT-HM21-810', desc: 'Rasto Vinnupallaknekti 100', qty: 49, dayRate: 19.35, weekRate: 135.48, cat: 'platform' },
]

// ---- KM21: Manto accessories ----
export const KM21: FormworkAccessory[] = [
  { id: '01-MÓT-KM21-000', desc: 'Manto Réttskeiðaklemmur', qty: 182, dayRate: 8.87, weekRate: 62.10, cat: 'clamp' },
  { id: '01-MÓT-KM21-010', desc: 'Manto Flekaklemmur', qty: 89, dayRate: 7.26, weekRate: 50.81, cat: 'clamp' },
  { id: '01-MÓT-KM21-898', desc: 'Manto Stillanl.Réttsk.Klemmur', qty: 253, dayRate: 10.48, weekRate: 73.39, cat: 'clamp' },
  { id: '01-MÓT-KM21-227', desc: 'Manto Úthornaklemmur', qty: 215, dayRate: 13.71, weekRate: 95.97, cat: 'clamp' },
  { id: '01-MÓT-KM21-205', desc: 'Manto Vinnupallaknekti 90', qty: 36, dayRate: 19.35, weekRate: 135.48, cat: 'platform' },
  { id: '01-MÓT-KM21-710', desc: 'Manto Kranakrókar', qty: -15, dayRate: 47.58, weekRate: 333.06, cat: 'crane' },
  { id: '01-MÓT-KM21-700', desc: 'Manto Right Spindle Piece', qty: 0, dayRate: 12.10, weekRate: 84.68, cat: 'spindle' },
  { id: '01-MÓT-KM21-720', desc: 'Manto Left Spindle Piece', qty: 0, dayRate: 12.10, weekRate: 84.68, cat: 'spindle' },
  { id: '01-MÓT-KM21-721', desc: 'Manto Center Tube 50', qty: 0, dayRate: 4.03, weekRate: 28.23, cat: 'tube' },
  { id: '01-MÓT-KM21-732', desc: 'Manto Center Tube 80', qty: -3, dayRate: 4.84, weekRate: 33.87, cat: 'tube' },
  { id: '01-MÓT-KM21-743', desc: 'Manto Center Tube 110', qty: -3, dayRate: 6.45, weekRate: 45.16, cat: 'tube' },
  { id: '01-MÓT-KM21-754', desc: 'Manto Center Tube 140', qty: 0, dayRate: 8.06, weekRate: 56.45, cat: 'tube' },
  { id: '01-MÓT-KM21-765', desc: 'Manto Center Tube 170', qty: -12, dayRate: 9.68, weekRate: 67.74, cat: 'tube' },
  { id: '01-MÓT-KM21-165', desc: 'Manto Pouring Platform', qty: 1, dayRate: 0.00, weekRate: 0.00, cat: 'platform' },
]

// ---- LM02: Alufort slab panels ----
export const LM02: FormworkPanel[] = [
  { id: '01-MÓT-LM02-715', desc: 'Alufort Mótaflekar 75×150', w: 75, h: 150, qty: 1124, dayRate: 41.67, weekRate: 291.73 },
  { id: '01-MÓT-LM02-315', desc: 'Alufort Mótaflekar 37,5×150', w: 37.5, h: 150, qty: 24, dayRate: 32.37, weekRate: 226.58 },
  { id: '01-MÓT-LM02-775', desc: 'Alufort Mótaflekar 75×75', w: 75, h: 75, qty: 78, dayRate: 26.75, weekRate: 187.26 },
  { id: '01-MÓT-LM02-375', desc: 'Alufort Mótaflekar 37,5×75', w: 37.5, h: 75, qty: 8, dayRate: 23.06, weekRate: 161.40 },
  { id: '01-MÓT-LM02-900', desc: 'Alufort Rekki f/Mótafleka (Galv)', w: 0, h: 0, qty: 21, dayRate: 177.29, weekRate: 1241.04 },
]

// ---- LM22: Alufort accessories ----
export const LM22: FormworkAccessory[] = [
  { id: '01-MÓT-LM22-400', desc: 'Alufort Drop-Head', qty: 1190, dayRate: 17.29, weekRate: 121.02, cat: 'head' },
  { id: '01-MÓT-LM22-040', desc: 'Alufort Drop-Head Quick Attack', qty: 150, dayRate: 17.29, weekRate: 121.02, cat: 'head' },
  { id: '01-MÓT-LM22-401', desc: 'Alufort Fixed-Head', qty: 100, dayRate: 5.76, weekRate: 40.33, cat: 'head' },
  { id: '01-MÓT-LM22-402', desc: 'Alufort Kombi-Head', qty: 50, dayRate: 13.15, weekRate: 92.04, cat: 'head' },
  { id: '01-MÓT-LM22-403', desc: 'Alufort Festing f/Drop-Head', qty: 30, dayRate: 4.29, weekRate: 30.00, cat: 'head' },
  { id: '01-MÓT-LM22-546', desc: 'Alufort Festing M/Stuðning 10×10cm', qty: 38, dayRate: 7.54, weekRate: 52.74, cat: 'head' },
  { id: '01-MÓT-LM22-322', desc: 'Alufort Dregari 150cm', qty: 30, dayRate: 48.02, weekRate: 336.12, cat: 'stringer' },
  { id: '01-MÓT-LM22-323', desc: 'Alufort Dregari 225cm', qty: 566, dayRate: 48.02, weekRate: 336.12, cat: 'stringer' },
  { id: '01-MÓT-LM22-510', desc: 'Faresin Framlenging 50cm', qty: 232, dayRate: 7.04, weekRate: 49.24, cat: 'extension' },
  { id: '01-MÓT-LM22-850', desc: 'Alufort PVC Frágangslisti 150', qty: 526, dayRate: 2.67, weekRate: 18.70, cat: 'pvc' },
  { id: '01-MÓT-LM22-875', desc: 'Alufort PVC Frágangslisti 75', qty: 989, dayRate: 1.78, weekRate: 12.47, cat: 'pvc' },
  { id: '01-MÓT-LM22-990', desc: 'Alufort Skrúfa M12×40', qty: 3805, dayRate: 0.05, weekRate: 0.34, cat: 'fastener' },
  { id: '01-MÓT-LM22-992', desc: 'Alufort Ró M12 (Medium)', qty: 3760, dayRate: 0.02, weekRate: 0.12, cat: 'fastener' },
  { id: '01-MÓT-LM22-600', desc: 'Faresin Fylgihlutagrind 160×110', qty: 10, dayRate: 210.24, weekRate: 1471.67, cat: 'rack' },
]

// ---- LM81: ID frames ----
export const LM81: FormworkIDFrame[] = [
  { id: '01-MÓT-LM81-162', desc: 'ID-Rammar 133', qty: 1140, dayRate: 37.10, weekRate: 259.68, frameW: 133 },
  { id: '01-MÓT-LM81-173', desc: 'ID-Rammar 100', qty: 1810, dayRate: 33.87, weekRate: 237.10, frameW: 100 },
  { id: '01-MÓT-LM81-163', desc: 'ID-Endarammar', qty: 788, dayRate: 39.52, weekRate: 276.61 },
  { id: '01-MÓT-LM81-187', desc: 'ID-Hálfur Endarammi', qty: 511, dayRate: 10.48, weekRate: 73.39 },
  { id: '01-MÓT-LM81-200', desc: 'ID-Skástífur f/Hálfa Endaramma', qty: 471, dayRate: 3.23, weekRate: 22.58 },
  { id: '01-MÓT-LM81-530', desc: 'ID-Hausar 38/52', qty: 1068, dayRate: 16.13, weekRate: 112.90 },
  { id: '01-MÓT-LM81-552', desc: 'ID-Lappir 38/52', qty: 850, dayRate: 16.13, weekRate: 112.90 },
  { id: '01-MÓT-LM81-574', desc: 'ID-Skástífur', qty: 1886, dayRate: 4.84, weekRate: 33.87 },
  { id: '01-MÓT-LM81-009', desc: 'Rekki fyrir ID rammar', qty: 2, dayRate: 210.24, weekRate: 1471.67 },
]

// ---- LM51: Ceiling props (for Alufort slab) ----
export const LM51: FormworkProp[] = [
  { id: '01-MÓT-LM51-041', desc: 'Loftastoðir 0,7-1,2M (Málað)', minH: 70, maxH: 120, qty: 52, dayRate: 12.90, weekRate: 90.32 },
  { id: '01-MÓT-LM51-027', desc: 'Loftastoðir 1,6-3M (Málað)', minH: 160, maxH: 300, qty: 885, dayRate: 12.90, weekRate: 90.32 },
  { id: '01-MÓT-LM51-026', desc: 'Loftastoðir 2-3,5M (Málað)', minH: 200, maxH: 350, qty: 976, dayRate: 12.90, weekRate: 90.32 },
  { id: '01-MÓT-LM51-029', desc: 'Loftastoðir 1,6-2,9M (Galv)', minH: 160, maxH: 290, qty: 185, dayRate: 16.13, weekRate: 112.90 },
  { id: '01-MÓT-LM51-028', desc: 'Loftastoðir 2-3,5M (Galv)', minH: 200, maxH: 350, qty: 238, dayRate: 16.13, weekRate: 112.90 },
  { id: '01-MÓT-LM51-092', desc: 'Loftastoðir B/D30 175/300', minH: 175, maxH: 300, qty: 468, dayRate: 24.19, weekRate: 169.35 },
  { id: '01-MÓT-LM51-031', desc: 'Loftastoðir B30 178/300 HPE Gl', minH: 178, maxH: 300, qty: 88, dayRate: 22.58, weekRate: 158.06 },
  { id: '01-MÓT-LM51-913', desc: 'Loftastoðir CE30 179/300 Galv', minH: 179, maxH: 300, qty: 500, dayRate: 13.71, weekRate: 95.97 },
  { id: '01-MÓT-LM51-935', desc: 'Faresin Loftastoðir E35 200/350 (Galv)', minH: 200, maxH: 350, qty: 1049, dayRate: 14.65, weekRate: 102.56 },
  { id: '01-MÓT-LM51-032', desc: 'Loftastoðir B35 200/350 HPE Gl', minH: 200, maxH: 350, qty: -3, dayRate: 22.58, weekRate: 158.06 },
  { id: '01-MÓT-LM51-091', desc: 'Loftastoðir CD35 201/350 Galv', minH: 201, maxH: 350, qty: 147, dayRate: 32.26, weekRate: 225.81 },
  { id: '01-MÓT-LM51-235', desc: 'Loftastoðir E35 (201/350)', minH: 201, maxH: 350, qty: 1, dayRate: 32.26, weekRate: 225.81 },
  { id: '01-MÓT-LM51-048', desc: 'Loftastoðir B45 260/480 Galv.', minH: 260, maxH: 480, qty: -29, dayRate: 44.35, weekRate: 310.48 },
  { id: '01-MÓT-LM51-080', desc: 'Loftastoðir D45', minH: 260, maxH: 450, qty: -50, dayRate: 48.39, weekRate: 338.71 },
  { id: '01-MÓT-LM51-079', desc: 'Loftastoðir D55 301/550 Galv', minH: 301, maxH: 550, qty: 43, dayRate: 56.45, weekRate: 395.16 },
]

// ---- LM71: HT-20 beams ----
export const LM71: FormworkBeam[] = [
  { id: '01-MÓT-LM71-011', desc: 'Mótabitar HT-20 1,20M', length: 120, qty: -22, dayRate: 10.97, weekRate: 76.78 },
  { id: '01-MÓT-LM71-924', desc: 'Mótabitar HT-20 2,45M', length: 245, qty: 3170, dayRate: 13.71, weekRate: 95.97 },
  { id: '01-MÓT-LM71-926', desc: 'Mótabitar HT-20 2,65M', length: 265, qty: 76, dayRate: 15.32, weekRate: 107.26 },
  { id: '01-MÓT-LM71-929', desc: 'Mótabitar HT-20 2,9M', length: 290, qty: 26, dayRate: 16.13, weekRate: 112.90 },
  { id: '01-MÓT-LM71-935', desc: 'Mótabitar HT-20 3,0M', length: 300, qty: -19, dayRate: 16.69, weekRate: 116.80 },
  { id: '01-MÓT-LM71-933', desc: 'Mótabitar HT-20 3,3M', length: 330, qty: 0, dayRate: 16.69, weekRate: 116.80 },
  { id: '01-MÓT-LM71-936', desc: 'Mótabitar HT-20 3,6M', length: 360, qty: 12, dayRate: 20.16, weekRate: 141.13 },
  { id: '01-MÓT-LM71-939', desc: 'Mótabitar HT-20 3,9M', length: 390, qty: 222, dayRate: 21.77, weekRate: 152.42 },
  { id: '01-MÓT-LM71-949', desc: 'Mótabitar HT-20 4,9M', length: 490, qty: -45, dayRate: 27.42, weekRate: 191.94 },
  { id: '01-MÓT-LM71-990', desc: 'Faresin Mótabitar 2,90M', length: 290, qty: 427, dayRate: 7.00, weekRate: 49.03 },
  { id: '01-MÓT-LM71-992', desc: 'Faresin Mótabitar 3,90M', length: 390, qty: 126, dayRate: 9.42, weekRate: 65.94 },
]

// ---- AH21: General accessories ----
export const AH21: FormworkAccessory[] = [
  { id: '01-MÓT-AH21-600', desc: 'Manto Mótarær DW 15 13cm', qty: 3925, dayRate: 2.42, weekRate: 16.94, cat: 'tierod' },
  { id: '01-MÓT-AH21-332', desc: 'Mótarær DW 15 10cm', qty: 174, dayRate: 5.65, weekRate: 39.52, cat: 'tierod' },
  { id: '01-MÓT-AH21-601', desc: 'Mótarær DW 15 Forbuilt', qty: -2146, dayRate: 2.42, weekRate: 16.94, cat: 'tierod' },
  { id: '01-MÓT-AH21-344', desc: 'Mótarær 130×230', qty: 262, dayRate: 2.42, weekRate: 16.94, cat: 'tierod' },
  { id: '01-MÓT-AH21-470', desc: 'Mótateinar 175cm', qty: 493, dayRate: 2.42, weekRate: 16.94, cat: 'tie' },
  { id: '01-MÓT-AH21-481', desc: 'Mótateinar 130cm', qty: 77, dayRate: 2.42, weekRate: 16.94, cat: 'tie' },
  { id: '01-MÓT-AH21-387', desc: 'Mótateinar 100cm', qty: -38, dayRate: 1.61, weekRate: 11.29, cat: 'tie' },
  { id: '01-MÓT-AH21-660', desc: 'Mótateinar 75cm', qty: -453, dayRate: 0.81, weekRate: 5.65, cat: 'tie' },
  { id: '01-MÓT-AH21-053', desc: 'Dregarateinar 30cm (Stuttir)', qty: -43, dayRate: 1.61, weekRate: 11.29, cat: 'spacer' },
  { id: '01-MÓT-AH21-410', desc: 'Dregarateinar 50cm (Langir)', qty: -6, dayRate: 1.61, weekRate: 11.29, cat: 'spacer' },
  { id: '01-MÓT-AH21-093', desc: 'Mótaskástífur B35 203/350', qty: 281, dayRate: 22.58, weekRate: 158.06, cat: 'brace' },
  { id: '01-MÓT-AH21-049', desc: 'Mótaskástífur 260/480 Galv', qty: -41, dayRate: 22.58, weekRate: 158.06, cat: 'brace' },
  { id: '01-MÓT-AH21-103', desc: 'M-Tvöfaldar Mótaskástífur', qty: -15, dayRate: 34.68, weekRate: 242.74, cat: 'brace' },
  { id: '01-MÓT-AH21-001', desc: 'Sökkulskór', qty: 144, dayRate: 12.10, weekRate: 84.68, cat: 'base' },
  { id: '01-MÓT-AH21-002', desc: 'Innveggjaskór', qty: 424, dayRate: 12.10, weekRate: 84.68, cat: 'base' },
  { id: '01-MÓT-AH21-214', desc: 'Plötur 8/8', qty: -186, dayRate: 2.42, weekRate: 16.94, cat: 'plate' },
  { id: '01-MÓT-AH21-010', desc: 'Bracket Bearing', qty: 212, dayRate: 25.00, weekRate: 175.00, cat: 'bracket' },
  { id: '01-MÓT-AH21-005', desc: 'Samanbr. Vinnupallaknekkti', qty: 103, dayRate: 967.74, weekRate: 6774.19, cat: 'platform' },
  { id: '01-MÓT-AH21-764', desc: 'Manto Dregarar 100cm', qty: -45, dayRate: 13.71, weekRate: 95.97, cat: 'stringer' },
  { id: '01-MÓT-AH21-980', desc: 'Dregarar 80cm', qty: 57, dayRate: 8.87, weekRate: 62.10, cat: 'stringer' },
  { id: '01-MÓT-AH21-746', desc: 'Krækjufestingar (M-Bolt Conn.)', qty: -66, dayRate: 1.61, weekRate: 11.29, cat: 'connector' },
  { id: '01-MÓT-AH21-114', desc: 'M-Skástífufestingar (Langar)', qty: 39, dayRate: 14.52, weekRate: 101.61, cat: 'brace' },
]

// ---- Mótateinar options (tie bar lengths) ----
export const TIE_BAR_OPTIONS = [
  { id: '01-MÓT-AH21-470', label: '175 cm' },
  { id: '01-MÓT-AH21-481', label: '130 cm' },
  { id: '01-MÓT-AH21-387', label: '100 cm' },
  { id: '01-MÓT-AH21-660', label: '75 cm' },
]

// ---- Manto height options ----
export const MANTO_HEIGHTS = [
  { value: 330, label: '3,3 m' },
  { value: 300, label: '3,0 m' },
  { value: 270, label: '2,7 m' },
  { value: 240, label: '2,4 m' },
  { value: 120, label: '1,2 m' },
  { value: 60, label: '0,6 m' },
]

// ---- System types ----
export const FORMWORK_SYSTEMS = [
  { key: 'manto' as const, brand: 'Hünnebeck', name: 'Kranamót', sub: 'Manto' },
  { key: 'rasto' as const, brand: 'Hünnebeck', name: 'Handflekamót', sub: 'Rasto / Takko' },
  { key: 'alufort' as const, brand: '', name: 'Bitamót / Loftamót', sub: 'Alufort' },
]
