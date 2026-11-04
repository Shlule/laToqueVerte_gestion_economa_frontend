const formatters = new Map<number, Intl.NumberFormat>()

/** Prix en euros : arrondi au centime pour l'affichage (le calcul reste exact côté serveur). */
export function formatPrice(value: number | string | null | undefined, maxDigits = 2): string {
  const amount = Number(value ?? 0)
  let formatter = formatters.get(maxDigits)
  if (!formatter) {
    formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: maxDigits,
    })
    formatters.set(maxDigits, formatter)
  }
  return formatter.format(Number.isFinite(amount)
    ? amount
    : 0)
}
