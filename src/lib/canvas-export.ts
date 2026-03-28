/**
 * Export interactive 2D canvas state to SVG for print/PDF.
 * Converts CanvasObject[] to a clean SVG string compatible with Viewer2D.
 */
import type { CanvasObject } from '@/hooks/useCanvas2D'
import { BRAND } from '@/lib/geometry-config'

const EXPORT_SCALE = 80 // 1m = 80 SVG units (matches canvas SCALE)

interface ExportOptions {
  /** Title to show at bottom of SVG */
  title?: string
  /** Padding in SVG units around content */
  padding?: number
  /** Show grid in export */
  showGrid?: boolean
}

/**
 * Convert canvas objects to an SVG string suitable for Viewer2D and PDF export.
 */
export function canvasToSvg(objects: CanvasObject[], opts: ExportOptions = {}): string {
  const { title, padding = 40, showGrid = true } = opts

  if (objects.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
      <text x="200" y="100" text-anchor="middle" font-size="14" fill="#999">Ekkert á teikniborði</text>
    </svg>`
  }

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const obj of objects) {
    const x1 = obj.x * EXPORT_SCALE
    const y1 = obj.y * EXPORT_SCALE
    const x2 = x1 + obj.width * EXPORT_SCALE
    const y2 = y1 + obj.height * EXPORT_SCALE
    minX = Math.min(minX, x1)
    minY = Math.min(minY, y1)
    maxX = Math.max(maxX, x2)
    maxY = Math.max(maxY, y2)
  }

  const svgW = maxX - minX + padding * 2
  const svgH = maxY - minY + padding * 2 + (title ? 30 : 0)
  const oX = -minX + padding
  const oY = -minY + padding

  const parts: string[] = []

  // Grid lines (1m intervals)
  if (showGrid) {
    const gridStep = EXPORT_SCALE // 1 meter
    const gMinX = Math.floor(minX / gridStep) * gridStep
    const gMaxX = Math.ceil(maxX / gridStep) * gridStep
    const gMinY = Math.floor(minY / gridStep) * gridStep
    const gMaxY = Math.ceil(maxY / gridStep) * gridStep

    for (let gx = gMinX; gx <= gMaxX; gx += gridStep) {
      parts.push(`<line x1="${gx + oX}" y1="${gMinY + oY}" x2="${gx + oX}" y2="${gMaxY + oY}" stroke="#e0e0e0" stroke-width="0.5"/>`)
    }
    for (let gy = gMinY; gy <= gMaxY; gy += gridStep) {
      parts.push(`<line x1="${gMinX + oX}" y1="${gy + oY}" x2="${gMaxX + oX}" y2="${gy + oY}" stroke="#e0e0e0" stroke-width="0.5"/>`)
    }
  }

  // Equipment rectangles
  for (const obj of objects) {
    const x = obj.x * EXPORT_SCALE + oX
    const y = obj.y * EXPORT_SCALE + oY
    const w = obj.width * EXPORT_SCALE
    const h = obj.height * EXPORT_SCALE
    const transform = obj.rotation ? ` transform="rotate(${obj.rotation} ${x + w / 2} ${y + h / 2})"` : ''

    parts.push(`<g${transform}>`)
    parts.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${obj.color}" fill-opacity="0.8" stroke="${BRAND.dark}" stroke-width="1" rx="2"/>`)
    // Label
    const fontSize = Math.min(12, Math.max(8, w / obj.label.length * 1.2))
    parts.push(`  <text x="${x + 3}" y="${y + fontSize + 2}" font-size="${fontSize}" fill="${BRAND.dark}" font-family="Barlow, sans-serif">${escapeXml(obj.label)}</text>`)
    // Dimension
    parts.push(`  <text x="${x + w / 2}" y="${y + h + 12}" text-anchor="middle" font-size="8" fill="#666" font-family="Barlow, sans-serif">${obj.width.toFixed(1)}×${obj.height.toFixed(1)} m</text>`)
    parts.push(`</g>`)
  }

  // Title
  if (title) {
    parts.push(`<text x="${svgW / 2}" y="${svgH - 8}" text-anchor="middle" font-size="14" font-weight="bold" fill="${BRAND.dark}" font-family="Barlow Condensed, sans-serif">${escapeXml(title)}</text>`)
  }

  // Scale bar (1m reference)
  const sbX = svgW - padding - EXPORT_SCALE
  const sbY = svgH - (title ? 35 : 15)
  parts.push(`<line x1="${sbX}" y1="${sbY}" x2="${sbX + EXPORT_SCALE}" y2="${sbY}" stroke="${BRAND.dark}" stroke-width="2"/>`)
  parts.push(`<line x1="${sbX}" y1="${sbY - 4}" x2="${sbX}" y2="${sbY + 4}" stroke="${BRAND.dark}" stroke-width="1.5"/>`)
  parts.push(`<line x1="${sbX + EXPORT_SCALE}" y1="${sbY - 4}" x2="${sbX + EXPORT_SCALE}" y2="${sbY + 4}" stroke="${BRAND.dark}" stroke-width="1.5"/>`)
  parts.push(`<text x="${sbX + EXPORT_SCALE / 2}" y="${sbY - 6}" text-anchor="middle" font-size="9" fill="${BRAND.dark}" font-family="Barlow, sans-serif">1 m</text>`)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">\n${parts.join('\n')}\n</svg>`
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
