// ── PDF Import: renders PDF pages to image + optional OCR ──
// Uses pdfjs-dist for rendering and tesseract.js for OCR

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

export interface PdfImportResult {
  /** Data URL of the rendered page (PNG) */
  imageDataUrl: string
  /** SVG string wrapping the image for use as equipment background */
  svgContent: string
  /** OCR text extracted (empty string if OCR not run) */
  ocrText: string
  width: number
  height: number
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

  // OCR if requested
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

  return { imageDataUrl, svgContent, ocrText, width, height }
}
