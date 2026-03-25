import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ClientInfo } from '@/types'
import { formatDate } from '@/lib/format'

export interface PdfExportData {
  title: string
  calculatorType: string
  client: ClientInfo
  startDate?: string
  endDate?: string
  rentalDays: number
  summaryRows: [string, string][]
  tableHeaders: string[]
  tableRows: (string | number)[][]
  totalLabel: string
  totalValue: string
}

// Company info for PDF header — configurable per tenant in the future
const COMPANY = {
  name: 'BYKO Leiga',
  address: 'Dalvegi 10-14, 201 Kópavogur',
  phone: '515 4000',
  email: 'leiga@byko.is',
  kennitala: '701214-0370',
  web: 'byko.is/leiga',
}

export function exportPdf(data: PdfExportData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let y = 15

  // Generate document reference number (LC-TYPE-YYMMDD-HHMM)
  const now = new Date()
  const typeCode = data.calculatorType.slice(0, 3).toUpperCase()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const docRef = `LC-${typeCode}-${yy}${mm}${dd}-${hh}${min}`

  // ── Header bar ──
  doc.setFillColor(64, 64, 66) // #404042
  doc.rect(0, 0, pageWidth, 30, 'F')
  doc.setFillColor(245, 200, 0) // #f5c800
  doc.rect(0, 30, pageWidth, 2.5, 'F')

  // Logo text (left)
  doc.setTextColor(245, 200, 0)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('LániCAD', margin, y + 6)

  // Company info (right-aligned in header)
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(COMPANY.name, pageWidth - margin, y, { align: 'right' })
  doc.text(COMPANY.address, pageWidth - margin, y + 4, { align: 'right' })
  doc.text(`Sími: ${COMPANY.phone} | ${COMPANY.email}`, pageWidth - margin, y + 8, { align: 'right' })
  doc.text(`Kt: ${COMPANY.kennitala}`, pageWidth - margin, y + 12, { align: 'right' })

  y = 39

  // ── Document info row ──
  doc.setFillColor(248, 248, 248)
  doc.rect(0, 33, pageWidth, 14, 'F')

  doc.setTextColor(64, 64, 66)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(data.title, margin, 42)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Tilvísun: ${docRef}`, pageWidth - margin, 39, { align: 'right' })
  doc.text(`Dagsetning: ${formatDate(now)}`, pageWidth - margin, 43, { align: 'right' })

  y = 53

  // ── Two-column: Client info (left) + Rental period (right) ──
  const hasClient = data.client.name || data.client.company || data.client.kennitala
  const hasPeriod = data.startDate || data.endDate

  if (hasClient || hasPeriod) {
    // Client box (left half)
    if (hasClient) {
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(220, 220, 220)
      doc.roundedRect(margin, y, (pageWidth - margin * 2) * 0.58, 36, 2, 2, 'FD')

      doc.setTextColor(64, 64, 66)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Viðskiptavinur', margin + 4, y + 5)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(80, 80, 80)
      let cy = y + 10
      if (data.client.name) { doc.text(data.client.name, margin + 4, cy); cy += 4 }
      if (data.client.company) { doc.text(data.client.company, margin + 4, cy); cy += 4 }
      if (data.client.kennitala) { doc.text(`Kt: ${data.client.kennitala}`, margin + 4, cy); cy += 4 }
      if (data.client.address) { doc.text(data.client.address, margin + 4, cy); cy += 4 }
      if (data.client.phone) { doc.text(`Sími: ${data.client.phone}`, margin + 4, cy); cy += 4 }
      if (data.client.email) { doc.text(data.client.email, margin + 4, cy); cy += 4 }
      if (data.client.inspector) { doc.text(`Eftirlitsaðili: ${data.client.inspector}`, margin + 4, cy) }
    }

    // Period box (right side)
    const rightX = margin + (pageWidth - margin * 2) * 0.62
    const rightW = (pageWidth - margin * 2) * 0.38
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(220, 220, 220)
    doc.roundedRect(rightX, y, rightW, 36, 2, 2, 'FD')

    doc.setTextColor(64, 64, 66)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Leigutímabil', rightX + 4, y + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(80, 80, 80)
    let ry = y + 11
    if (data.startDate) { doc.text(`Frá: ${formatDate(new Date(data.startDate))}`, rightX + 4, ry); ry += 5 }
    if (data.endDate) { doc.text(`Til: ${formatDate(new Date(data.endDate))}`, rightX + 4, ry); ry += 5 }
    doc.setFont('helvetica', 'bold')
    doc.text(`Dagar: ${data.rentalDays}`, rightX + 4, ry)

    y += 42
  }

  // ── Summary table ──
  if (data.summaryRows.length > 0) {
    doc.setTextColor(64, 64, 66)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Samantekt', margin, y)
    y += 2

    autoTable(doc, {
      startY: y,
      body: data.summaryRows,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55, textColor: [100, 100, 100] },
        1: { halign: 'left' },
      },
      margin: { left: margin, right: margin },
    })

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5
  }

  // ── Materials table ──
  doc.setTextColor(64, 64, 66)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Efnislisti', margin, y)
  y += 2

  autoTable(doc, {
    startY: y,
    head: [data.tableHeaders],
    body: data.tableRows,
    foot: [[
      ...Array(data.tableHeaders.length - 1).fill(''),
      data.totalValue,
    ]],
    theme: 'striped',
    headStyles: {
      fillColor: [64, 64, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8 },
    footStyles: {
      fillColor: [245, 200, 0],
      textColor: [64, 64, 66],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: margin, right: margin },
    columnStyles: {
      [data.tableHeaders.length - 1]: { halign: 'right' },
      [data.tableHeaders.length - 2]: { halign: 'right' },
    },
  })

  // ── Total box ──
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6
  doc.setFillColor(64, 64, 66)
  doc.roundedRect(pageWidth - margin - 70, finalY, 70, 16, 2, 2, 'F')
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(data.totalLabel, pageWidth - margin - 66, finalY + 5)
  doc.setTextColor(245, 200, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(data.totalValue, pageWidth - margin - 4, finalY + 13, { align: 'right' })

  // ── Terms / conditions note ──
  const termsY = finalY + 24
  if (termsY < pageHeight - 30) {
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, termsY, pageWidth - margin, termsY)
    doc.setFontSize(7)
    doc.setTextColor(140, 140, 140)
    doc.setFont('helvetica', 'normal')
    doc.text('Skilmálar: Verð er án VSK nema annað sé tekið fram. Leigutími reiknast frá afhendingu til skila.', margin, termsY + 4)
    doc.text('Leigutaki ber ábyrgð á búnaði á leigutíma. Skil skulu fara fram á umsömdum tíma.', margin, termsY + 8)
  }

  // ── Footer with page numbers and document reference ──
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Footer separator line
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14)

    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(now), margin, pageHeight - 9)
    doc.text(
      `LániCAD — ${data.calculatorType} — Síða ${i}/${pageCount}`,
      pageWidth / 2, pageHeight - 9,
      { align: 'center' }
    )
    doc.text(docRef, pageWidth - margin, pageHeight - 9, { align: 'right' })
  }

  const filename = `lanicad-${data.calculatorType.toLowerCase().replace(/\s+/g, '-')}-${formatDate(now).replace(/\./g, '')}.pdf`
  doc.save(filename)
}
