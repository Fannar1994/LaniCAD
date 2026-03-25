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

export function exportPdf(data: PdfExportData) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
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

  // Header bar
  doc.setFillColor(64, 64, 66) // #404042
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setFillColor(245, 200, 0) // #f5c800
  doc.rect(0, 28, pageWidth, 3, 'F')

  doc.setTextColor(245, 200, 0)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('LániCAD', 15, y + 5)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(data.title, 15, y + 13)

  // Date + document reference in header
  doc.setFontSize(9)
  doc.text(formatDate(now), pageWidth - 15, y + 5, { align: 'right' })
  doc.setFontSize(7)
  doc.text(`Tilvísun: ${docRef}`, pageWidth - 15, y + 10, { align: 'right' })

  y = 38

  // Client info section
  if (data.client.name || data.client.company || data.client.kennitala) {
    doc.setTextColor(64, 64, 66)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Viðskiptavinur', 15, y)
    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const clientLines: string[] = []
    if (data.client.name) clientLines.push(`Nafn: ${data.client.name}`)
    if (data.client.company) clientLines.push(`Fyrirtæki: ${data.client.company}`)
    if (data.client.kennitala) clientLines.push(`Kt: ${data.client.kennitala}`)
    if (data.client.phone) clientLines.push(`Sími: ${data.client.phone}`)
    if (data.client.email) clientLines.push(`Netfang: ${data.client.email}`)
    if (data.client.address) clientLines.push(`Heimilisfang: ${data.client.address}`)
    if (data.client.inspector) clientLines.push(`Eftirlitsaðili: ${data.client.inspector}`)

    // Two-column layout for client info
    const mid = Math.ceil(clientLines.length / 2)
    const col1 = clientLines.slice(0, mid)
    const col2 = clientLines.slice(mid)

    doc.setTextColor(80, 80, 80)
    col1.forEach((line, i) => {
      doc.text(line, 15, y + i * 4.5)
    })
    col2.forEach((line, i) => {
      doc.text(line, pageWidth / 2 + 5, y + i * 4.5)
    })
    y += Math.max(col1.length, col2.length) * 4.5 + 3
  }

  // Rental period
  if (data.startDate || data.endDate) {
    doc.setTextColor(64, 64, 66)
    doc.setFontSize(9)
    const periodParts: string[] = []
    if (data.startDate) periodParts.push(`Frá: ${formatDate(new Date(data.startDate))}`)
    if (data.endDate) periodParts.push(`Til: ${formatDate(new Date(data.endDate))}`)
    periodParts.push(`Dagar: ${data.rentalDays}`)
    doc.text(periodParts.join('   |   '), 15, y)
    y += 6
  }

  // Summary table
  if (data.summaryRows.length > 0) {
    doc.setTextColor(64, 64, 66)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Samantekt', 15, y)
    y += 2

    autoTable(doc, {
      startY: y,
      body: data.summaryRows,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60, textColor: [100, 100, 100] },
        1: { halign: 'left' },
      },
      margin: { left: 15, right: 15 },
    })

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6
  }

  // Materials table
  doc.setTextColor(64, 64, 66)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Efnislisti', 15, y)
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
    margin: { left: 15, right: 15 },
    columnStyles: {
      [data.tableHeaders.length - 1]: { halign: 'right' },
      [data.tableHeaders.length - 2]: { halign: 'right' },
    },
  })

  // Total box at bottom
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  doc.setFillColor(245, 200, 0)
  doc.roundedRect(pageWidth - 80, finalY, 65, 14, 2, 2, 'F')
  doc.setTextColor(64, 64, 66)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(data.totalLabel, pageWidth - 77, finalY + 5)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(data.totalValue, pageWidth - 18, finalY + 11, { align: 'right' })

  // Footer with page numbers and document reference
  const pageCount = doc.getNumberOfPages()
  const pageHeight = doc.internal.pageSize.getHeight()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `LániCAD — ${data.calculatorType} — Síða ${i}/${pageCount}`,
      pageWidth / 2, pageHeight - 8,
      { align: 'center' }
    )
    doc.text(
      docRef,
      pageWidth - 15, pageHeight - 8,
      { align: 'right' }
    )
    doc.text(
      formatDate(now),
      15, pageHeight - 8,
    )
  }

  const filename = `lanicad-${data.calculatorType.toLowerCase().replace(/\s+/g, '-')}-${formatDate(now).replace(/\./g, '')}.pdf`
  doc.save(filename)
}
