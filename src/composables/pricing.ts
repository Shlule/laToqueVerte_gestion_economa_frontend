import type { PricingMode, SellingPrice } from '~/types'

// Même calcul que le serveur (economa/pricing.py), pour voir le résultat en direct
// pendant qu'on règle la formule, avant d'enregistrer.

export const PRICING_MODES: PricingMode[] = [
  'raw_coefficient',
  'cost_coefficient',
  'margin',
  'fixed',
]

/** Valeurs de départ proposées quand on change de formule. */
export const DEFAULT_VALUES: Record<PricingMode, number> = {
  raw_coefficient: 3.5,
  cost_coefficient: 2,
  margin: 60,
  fixed: 3.5,
}

export const VAT_RATES = [5.5, 10, 20]

export function computeSellingPrice(
  mode: PricingMode,
  value: number,
  vatRate: number,
  materials: number,
  productionCost: number,
  quantity: number,
): SellingPrice {
  const vat = 1 + vatRate / 100
  let ht: number
  switch (mode) {
    case 'raw_coefficient':
      ht = materials * value
      break
    case 'cost_coefficient':
      ht = productionCost * value
      break
    case 'margin':
      ht = value < 100
        ? productionCost / (1 - value / 100)
        : 0
      break
    default:
      ht = value * quantity / vat
  }
  const ttc = ht * vat
  return {
    priceHT: ht,
    priceTTC: ttc,
    perUnitHT: quantity
      ? ht / quantity
      : null,
    perUnitTTC: quantity
      ? ttc / quantity
      : null,
    marginRate: ht
      ? (ht - productionCost) / ht * 100
      : null,
    coefficientOnMaterials: materials
      ? ht / materials
      : null,
  }
}
