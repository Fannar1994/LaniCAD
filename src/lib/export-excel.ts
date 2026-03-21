import * as XLSX from 'xlsx'
import type { ClientInfo } from '@/types'
import { formatDate } from '@/lib/format'

export interface ExcelExportData {
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

export function exportExcel(data: ExcelExportData) {
  const rows: (string | number)[][] = []

  // Title
  rows.push([data.title])
  rows.push([`Dagsetning: ${formatDate(new Date())}`])
  rows.push([])

  // Client info
  if (data.client.name || data.client.company) {
    rows.push(['Viðskiptavinur'])
    if (data.client.name) rows.push(['Nafn', data.client.name])
    if (data.client.company) rows.push(['Fyrirtæki', data.client.company])
    if (data.client.kennitala) rows.push(['Kennitala', data.client.kennitala])
    if (data.client.phone) rows.push(['Sími', data.client.phone])
    if (data.client.email) rows.push(['Netfang', data.client.email])
    if (data.client.address) rows.push(['Heimilisfang', data.client.address])
    if (data.client.inspector) rows.push(['Eftirlitsaðili', data.client.inspector])
    rows.push([])
  }

  // Rental period
  if (data.startDate || data.endDate) {
    if (data.startDate) rows.push(['Upphafsdagur', formatDate(new Date(data.startDate))])
    if (data.endDate) rows.push(['Lokadagur', formatDate(new Date(data.endDate))])
    rows.push(['Leigudagar', data.rentalDays])
    rows.push([])
  }

  // Summary
  if (data.summaryRows.length > 0) {
    rows.push(['Samantekt'])
    data.summaryRows.forEach(([label, value]) => rows.push([label, value]))
    rows.push([])
  }

  // Materials table
  rows.push(data.tableHeaders)
  data.tableRows.forEach(row => rows.push(row))
  rows.push([])

  // Total
  const totalRow: (string | number)[] = Array(data.tableHeaders.length).fill('')
  totalRow[0] = data.totalLabel
  totalRow[totalRow.length - 1] = data.totalValue
  rows.push(totalRow)

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Column widths
  ws['!cols'] = data.tableHeaders.map((_, i) => ({ wch: i === 0 ? 18 : i === 1 ? 35 : 15 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, data.calculatorType)

  const filename = `lanicad-${data.calculatorType.toLowerCase().replace(/\s+/g, '-')}-${formatDate(new Date()).replace(/\./g, '')}.xlsx`
  XLSX.writeFile(wb, filename)
}
