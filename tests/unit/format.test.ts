import { describe, it, expect } from 'vitest'
import {
  koboToNaira,
  nairaToKobo,
  formatNaira,
  formatDate,
} from '~/lib/format'

describe('money', () => {
  it('converts kobo to naira', () => {
    expect(koboToNaira(125000)).toBe(1250)
    expect(koboToNaira(0)).toBe(0)
  })

  it('converts naira to kobo rounding correctly', () => {
    expect(nairaToKobo(1250)).toBe(125000)
    expect(nairaToKobo(12.345)).toBe(1235)
  })

  it('formats naira with the naira symbol', () => {
    expect(formatNaira(125000)).toBe('\u20a61,250.00')
    expect(formatNaira(0)).toBe('\u20a60.00')
  })
})

describe('dates', () => {
  it('formats a timestamp', () => {
    const ts = Date.UTC(2026, 6, 16)
    expect(formatDate(ts)).toMatch(/2026/)
  })
})
