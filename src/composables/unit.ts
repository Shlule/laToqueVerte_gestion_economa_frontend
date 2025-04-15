import type { Unit } from '~/types'

export function convertUnit(quantity: number, fromUnit: Unit, toUnit: Unit): number {
  const conversionRates: Record<Unit, Record<Unit, number>> = {
    kg: { g: 1000, kg: 1, unit: Number.NaN },
    g: { g: 1, kg: 0.001, unit: Number.NaN },
    unit: { unit: 1, kg: Number.NaN, g: Number.NaN },
  }

  // Vérifie si la conversion est possible
  const conversionRate = conversionRates[fromUnit]?.[toUnit]
  if (Number.isNaN(conversionRate)) {
    throw new TypeError(`Invalid conversion from "${fromUnit}" to "${toUnit}"`)
  }

  return quantity * conversionRate
}

export const unitOptions = [{
  label: 'kg',
  value: 'kg',
}, {
  label: 'g',
  value: 'g',
}, {
  label: 'unit',
  value: 'unit',
}]
