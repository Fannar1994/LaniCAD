/**
 * Standard rental cost: day/week rate calculation
 * Used by formwork, ceiling props, and beams
 */
export function calcStandardRental(dayRate: number, weekRate: number, days: number, qty: number): number {
  if (days < 7) return dayRate * days * qty
  return weekRate * Math.ceil(days / 7) * qty
}

/**
 * Mobile fence rental cost: 12-tier monthly declining rates
 * Each tier is 30 days, minimum 10 days
 */
export function calcFenceRental(days: number, rates: number[], qty: number): number {
  const MIN_DAYS = 10
  let cost = 0
  let remaining = Math.max(days, MIN_DAYS)
  for (let i = 0; i < 12 && remaining > 0; i++) {
    const periodDays = Math.min(30, remaining)
    cost += periodDays * rates[i] * qty
    remaining -= periodDays
  }
  return cost
}

/**
 * Mobile scaffolding rental: 24h / extra day / weekly pricing
 */
export function calcRollingRental(
  days: number,
  pricing: { '24h': number; extra: number; week: number }
): number {
  if (days === 1) return pricing['24h']
  if (days <= 6) return pricing['24h'] + pricing.extra * (days - 1)
  const fullWeeks = Math.floor(days / 7)
  const extraDays = days % 7
  return pricing.week * fullWeeks + (extraDays > 0 ? pricing['24h'] * extraDays : 0)
}

/**
 * Scaffolding rental: daily rate × days × qty
 */
export function calcScaffoldingRental(dailyRate: number, days: number, qty: number): number {
  return dailyRate * days * qty
}
