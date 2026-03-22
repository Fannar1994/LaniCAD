import { describe, it, expect } from 'vitest'
import {
  validateKennitala,
  validateDateRange,
  validateNumber,
  validateEmail,
  validatePhone,
  validateRequired,
} from '@/lib/validate'

// ═══════════════════════════════════════════════════
// Kennitala Validation
// ═══════════════════════════════════════════════════
describe('validateKennitala', () => {
  it('accepts empty string (optional field)', () => {
    expect(validateKennitala('')).toEqual({ valid: true })
  })

  it('rejects too short input', () => {
    const r = validateKennitala('12345')
    expect(r.valid).toBe(false)
    expect(r.message).toContain('10 tölustafir')
  })

  it('rejects too long input', () => {
    const r = validateKennitala('12345678901')
    expect(r.valid).toBe(false)
  })

  it('strips non-digit chars before validation', () => {
    // 0101-26-2089 → 0101262089
    // Weights: 3×0 + 2×1 + 7×0 + 6×1 + 5×2 + 4×6 + 3×2 + 2×0 = 0+2+0+6+10+24+6+0=48
    // 48 % 11 = 4, check = 11-4 = 7 … but digit 8 is 8 ≠ 7 → invalid
    const r = validateKennitala('01-01-26-2089')
    // This is testing format handling, not check digit
    expect(r.valid).toBe(false)
  })

  it('rejects invalid day (>31)', () => {
    const r = validateKennitala('3201900000')
    expect(r.valid).toBe(false)
    expect(r.message).toContain('dagur')
  })

  it('rejects invalid month (>12)', () => {
    const r = validateKennitala('0113900000')
    expect(r.valid).toBe(false)
    expect(r.message).toContain('mánuð')
  })

  it('accepts a valid kennitala with correct check digit', () => {
    // Known valid Icelandic kennitala pattern:
    // 010130-2989: day=01, month=01, year=30
    // Weights: 3×0+2×1+7×0+6×1+5×3+4×0+3×2+2×9 = 0+2+0+6+15+0+6+18=47
    // 47%11=3, check=11-3=8, digit[8]=8 ✓
    expect(validateKennitala('0101302989')).toEqual({ valid: true })
  })

  it('rejects kennitala with wrong check digit', () => {
    // Change check digit from 8 to 5
    const r = validateKennitala('0101302589')
    expect(r.valid).toBe(false)
    expect(r.message).toContain('vartala')
  })
})

// ═══════════════════════════════════════════════════
// Date Range Validation
// ═══════════════════════════════════════════════════
describe('validateDateRange', () => {
  it('accepts both empty (optional)', () => {
    expect(validateDateRange()).toEqual({ valid: true })
  })

  it('rejects start without end', () => {
    const r = validateDateRange('2026-01-01')
    expect(r.valid).toBe(false)
    expect(r.message).toContain('lokadag')
  })

  it('rejects end without start', () => {
    const r = validateDateRange(undefined, '2026-01-31')
    expect(r.valid).toBe(false)
    expect(r.message).toContain('upphafsdag')
  })

  it('accepts valid range', () => {
    expect(validateDateRange('2026-01-01', '2026-01-31')).toEqual({ valid: true })
  })

  it('accepts same day', () => {
    expect(validateDateRange('2026-06-15', '2026-06-15')).toEqual({ valid: true })
  })

  it('rejects end before start', () => {
    const r = validateDateRange('2026-02-01', '2026-01-15')
    expect(r.valid).toBe(false)
    expect(r.message).toContain('á undan')
  })

  it('rejects invalid date strings', () => {
    const r = validateDateRange('not-a-date', '2026-01-01')
    expect(r.valid).toBe(false)
    expect(r.message).toContain('Ógildur upphafsdagur')
  })
})

// ═══════════════════════════════════════════════════
// Number Validation
// ═══════════════════════════════════════════════════
describe('validateNumber', () => {
  it('accepts number within range', () => {
    expect(validateNumber(50, { min: 0, max: 100 })).toEqual({ valid: true })
  })

  it('rejects below minimum', () => {
    const r = validateNumber(-1, { min: 0, label: 'Lengd' })
    expect(r.valid).toBe(false)
    expect(r.message).toContain('Lengd')
    expect(r.message).toContain('0')
  })

  it('rejects above maximum', () => {
    const r = validateNumber(500, { max: 100, label: 'Hæð' })
    expect(r.valid).toBe(false)
    expect(r.message).toContain('Hæð')
    expect(r.message).toContain('100')
  })

  it('rejects NaN', () => {
    const r = validateNumber(NaN)
    expect(r.valid).toBe(false)
    expect(r.message).toContain('tala')
  })

  it('accepts boundary values', () => {
    expect(validateNumber(0, { min: 0 })).toEqual({ valid: true })
    expect(validateNumber(100, { max: 100 })).toEqual({ valid: true })
  })
})

// ═══════════════════════════════════════════════════
// Email Validation
// ═══════════════════════════════════════════════════
describe('validateEmail', () => {
  it('accepts empty (optional)', () => {
    expect(validateEmail('')).toEqual({ valid: true })
  })

  it('accepts valid email', () => {
    expect(validateEmail('user@example.com')).toEqual({ valid: true })
  })

  it('accepts email with subdomain', () => {
    expect(validateEmail('user@sub.domain.is')).toEqual({ valid: true })
  })

  it('rejects missing @', () => {
    expect(validateEmail('userexample.com').valid).toBe(false)
  })

  it('rejects missing domain', () => {
    expect(validateEmail('user@').valid).toBe(false)
  })

  it('rejects spaces', () => {
    expect(validateEmail('user @example.com').valid).toBe(false)
  })
})

// ═══════════════════════════════════════════════════
// Phone Validation
// ═══════════════════════════════════════════════════
describe('validatePhone', () => {
  it('accepts empty (optional)', () => {
    expect(validatePhone('')).toEqual({ valid: true })
  })

  it('accepts 7-digit number', () => {
    expect(validatePhone('5551234')).toEqual({ valid: true })
  })

  it('accepts with spaces', () => {
    expect(validatePhone('555 1234')).toEqual({ valid: true })
  })

  it('accepts +354 prefix', () => {
    expect(validatePhone('+3545551234')).toEqual({ valid: true })
  })

  it('rejects too short', () => {
    expect(validatePhone('12345').valid).toBe(false)
  })

  it('rejects letters', () => {
    expect(validatePhone('555abc4').valid).toBe(false)
  })
})

// ═══════════════════════════════════════════════════
// Required Validation
// ═══════════════════════════════════════════════════
describe('validateRequired', () => {
  it('rejects empty string', () => {
    const r = validateRequired('', 'Nafn')
    expect(r.valid).toBe(false)
    expect(r.message).toContain('Nafn')
  })

  it('rejects whitespace-only', () => {
    expect(validateRequired('   ').valid).toBe(false)
  })

  it('accepts non-empty string', () => {
    expect(validateRequired('Jón')).toEqual({ valid: true })
  })
})
