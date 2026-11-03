import { describe, expect, it } from 'vitest'
import { convertUnit } from '~/composables/unit'

describe('convertUnit', () => {
  it('convertit kg en g', () => {
    expect(convertUnit(1.5, 'kg', 'g')).toBe(1500)
  })

  it('convertit g en kg', () => {
    expect(convertUnit(250, 'g', 'kg')).toBe(0.25)
  })

  it('refuse une conversion impossible', () => {
    expect(() => convertUnit(1, 'unit', 'kg')).toThrow(TypeError)
  })
})
