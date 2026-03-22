// ── Input Validation Utilities for LániCAD ──
// Kennitala, date ranges, numeric bounds, email, phone

export interface ValidationResult {
  valid: boolean
  message?: string
}

const OK: ValidationResult = { valid: true }

/**
 * Validate Icelandic kennitala (DDMMYY-NNNN) with check digit.
 * Weights: [3,2,7,6,5,4,3,2] applied to first 8 digits,
 * check = 11 - (sum % 11); if check==11 → 0; if check==10 → invalid.
 */
export function validateKennitala(raw: string): ValidationResult {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 0) return OK // empty is OK (optional field)
  if (digits.length !== 10) return { valid: false, message: 'Kennitala verður að vera 10 tölustafir' }

  const day = parseInt(digits.slice(0, 2))
  const month = parseInt(digits.slice(2, 4))
  if (day < 1 || day > 31) return { valid: false, message: 'Ógildur dagur í kennitölu' }
  if (month < 1 || month > 12) return { valid: false, message: 'Ógildur mánuður í kennitölu' }

  const weights = [3, 2, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits[i]) * weights[i]
  }
  const remainder = sum % 11
  const check = remainder === 0 ? 0 : 11 - remainder
  if (check === 10) return { valid: false, message: 'Ógild kennitala (vartala stemmir ekki)' }
  if (parseInt(digits[8]) !== check) return { valid: false, message: 'Ógild kennitala (vartala stemmir ekki)' }

  return OK
}

/**
 * Validate date range: end >= start, both present when one is present.
 */
export function validateDateRange(start?: string, end?: string): ValidationResult {
  if (!start && !end) return OK
  if (start && !end) return { valid: false, message: 'Vantar lokadag' }
  if (!start && end) return { valid: false, message: 'Vantar upphafsdag' }

  const s = new Date(start!)
  const e = new Date(end!)
  if (isNaN(s.getTime())) return { valid: false, message: 'Ógildur upphafsdagur' }
  if (isNaN(e.getTime())) return { valid: false, message: 'Ógildur lokadagur' }
  if (e < s) return { valid: false, message: 'Lokadagur má ekki vera á undan upphafsdag' }
  return OK
}

/**
 * Validate a number is within bounds.
 */
export function validateNumber(
  value: number,
  opts: { min?: number; max?: number; label?: string } = {}
): ValidationResult {
  const { min, max, label = 'Gildi' } = opts
  if (isNaN(value)) return { valid: false, message: `${label} verður að vera tala` }
  if (min !== undefined && value < min) return { valid: false, message: `${label} má ekki vera minna en ${min}` }
  if (max !== undefined && value > max) return { valid: false, message: `${label} má ekki vera meira en ${max}` }
  return OK
}

/**
 * Validate email format.
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) return OK // empty is OK (optional)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) return { valid: false, message: 'Ógilt netfang' }
  return OK
}

/**
 * Validate Icelandic phone number (7 digits, optional +354 prefix).
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) return OK
  const digits = phone.replace(/[\s\-+]/g, '')
  if (digits.startsWith('354')) {
    if (digits.length !== 10) return { valid: false, message: 'Ógilt símanúmer' }
  } else {
    if (digits.length !== 7) return { valid: false, message: 'Símanúmer verður að vera 7 tölustafir' }
  }
  if (!/^\d+$/.test(digits)) return { valid: false, message: 'Símanúmer má bara innihalda tölustafi' }
  return OK
}

/**
 * Validate required string field.
 */
export function validateRequired(value: string, label = 'Reitur'): ValidationResult {
  if (!value || !value.trim()) return { valid: false, message: `${label} er nauðsynlegur` }
  return OK
}
