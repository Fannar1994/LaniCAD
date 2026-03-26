// ── PDF Import: renders PDF pages to image + optional OCR ──
// Uses pdfjs-dist for rendering and tesseract.js for OCR
// Supports native text extraction + measurement pattern parsing

import * as pdfjsLib from 'pdfjs-dist'

// Use the worker from the installed package
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

export interface PdfPage {
  pageNum: number
  width: number
  height: number
}

export interface ExtractedMeasurement {
  text: string
  valueMm: number
  unit: string
}

export interface PdfImportResult {
  /** Data URL of the rendered page (PNG) */
  imageDataUrl: string
  /** SVG string wrapping the image for use as equipment background */
  svgContent: string
  /** OCR text extracted (empty string if OCR not run) */
  ocrText: string
  /** Native PDF text (from born-digital PDFs) */
  nativeText: string
  /** Combined text for display (native text preferred, OCR fallback) */
  allText: string
  /** Extracted measurements from text */
  measurements: ExtractedMeasurement[]
  width: number
  height: number
}

// ── Measurement Extraction ──

function parseNumber(raw: string): number {
  const cleaned = raw.replace(/\s/g, '').replace(',', '.')
  return parseFloat(cleaned)
}

export function extractMeasurements(text: string): ExtractedMeasurement[] {
  const results: ExtractedMeasurement[] = []
  const seen = new Set<string>()

  // mm pattern
  for (const match of text.matchAll(/(\d[\d\s.]*)\s*mm\b/gi)) {
    const val = parseNumber(match[1])
    if (!isNaN(val) && val > 0) {
      const key = `${val}mm`
      if (!seen.has(key)) { seen.add(key); results.push({ text: match[0].trim(), valueMm: val, unit: 'mm' }) }
    }
  }

  // m pattern (not "mm")
  for (const match of text.matchAll(/(\d[\d,.\s]*)\s*m\b(?!m)/gi)) {
    const val = parseNumber(match[1])
    if (!isNaN(val) && val > 0 && val < 10000) {
      const key = `${val}m`
      if (!seen.has(key)) { seen.add(key); results.push({ text: match[0].trim(), valueMm: val * 1000, unit: 'm' }) }
    }
  }

  // cm pattern
  for (const match of text.matchAll(/(\d[\d\s.]*)\s*cm\b/gi)) {
    const val = parseNumber(match[1])
    if (!isNaN(val) && val > 0) {
      const key = `${val}cm`
      if (!seen.has(key)) { seen.add(key); results.push({ text: match[0].trim(), valueMm: val * 10, unit: 'cm' }) }
    }
  }

  return results
}

/** Load a PDF file and return page info */
export async function loadPdf(file: File): Promise<{ pageCount: number; pages: PdfPage[] }> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: PdfPage[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const vp = page.getViewport({ scale: 1 })
    pages.push({ pageNum: i, width: vp.width, height: vp.height })
  }

  return { pageCount: pdf.numPages, pages }
}

/** Extract native text content from a PDF page (for born-digital PDFs) */
async function extractNativeText(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
): Promise<string> {
  const page = await pdf.getPage(pageNum)
  const content = await page.getTextContent()
  const lines: string[] = []
  let currentLine = ''
  let lastY: number | null = null

  for (const item of content.items) {
    if ('str' in item) {
      const y = (item as any).transform?.[5] ?? 0
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        if (currentLine.trim()) lines.push(currentLine.trim())
        currentLine = ''
      }
      currentLine += item.str
      lastY = y
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim())
  return lines.join('\n')
}

/** Render a specific PDF page to an image and optionally run OCR */
export async function renderPdfPage(
  file: File,
  pageNum: number,
  options: { scale?: number; runOcr?: boolean } = {},
): Promise<PdfImportResult> {
  const { scale = 2, runOcr = false } = options
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale })

  // Render to canvas
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!
  await page.render({ canvas, canvasContext: ctx, viewport }).promise

  const imageDataUrl = canvas.toDataURL('image/png')
  const width = viewport.width / scale
  const height = viewport.height / scale

  // Generate SVG wrapper for use as CAD background
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <image href="${imageDataUrl}" x="0" y="0" width="${width}" height="${height}" />
</svg>`

  // Extract native text from PDF (fast, works for born-digital PDFs)
  const nativeText = await extractNativeText(pdf, pageNum)

  // OCR if requested (for scanned PDFs or to supplement native text)
  let ocrText = ''
  if (runOcr) {
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('isl+eng')
      const { data } = await worker.recognize(canvas)
      ocrText = data.text
      await worker.terminate()
    } catch {
      ocrText = '[OCR villa — ekki tókst að lesa texta]'
    }
  }

  // Combine texts — prefer native, supplement with OCR
  const allText = [nativeText, ocrText].filter(Boolean).join('\n---\n')
  const measurements = extractMeasurements(allText)

  return { imageDataUrl, svgContent, ocrText, nativeText, allText, measurements, width, height }
}
