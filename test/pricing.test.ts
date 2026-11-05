import { describe, expect, it } from 'vitest'
import { computeSellingPrice } from '../src/composables/pricing'

// mêmes cas que economa/tests/test_cout_de_revient.py
describe('prix de vente', () => {
  it('coefficient sur les matières', () => {
    const p = computeSellingPrice('raw_coefficient', 4, 5.5, 10, 19.6, 8)
    expect(p.priceHT).toBeCloseTo(40)
    expect(p.perUnitTTC).toBeCloseTo(5.275)
    expect(p.marginRate).toBeCloseTo(51)
  })

  it('marge visée et prix fixe', () => {
    expect(computeSellingPrice('margin', 60, 5.5, 2, 8, 4).priceHT).toBeCloseTo(20)
    expect(computeSellingPrice('cost_coefficient', 2, 5.5, 2, 8, 4).priceHT).toBeCloseTo(16)
    const fixed = computeSellingPrice('fixed', 3.5, 10, 2, 8, 4)
    expect(fixed.perUnitTTC).toBeCloseTo(3.5)
    expect(fixed.priceHT).toBeCloseTo(12.7273, 3)
  })
})
