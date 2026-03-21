/**
 * ISK currency formatter: "1.234.567 kr"
 */
export function formatKr(value: number): string {
  const rounded = Math.round(value)
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted} kr`
}

/**
 * Format kennitala: "DDMMYY-NNNN"
 */
export function formatKennitala(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length > 6) {
    return `${digits.slice(0, 6)}-${digits.slice(6)}`
  }
  return digits
}

/**
 * Calculate inclusive day count between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.max(1, Math.ceil(ms / 86400000) + 1)
}

/**
 * Format date as DD.MM.YYYY
 */
export function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  return `${d}.${m}.${y}`
}

/**
 * Format number with dot thousands separator
 */
export function formatNumber(value: number): string {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
