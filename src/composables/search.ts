/** Texte comparable : minuscules, sans accents ni espaces superflus (« Crème » ≈ « creme »). */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Filtre une liste sur une recherche : tous les mots doivent apparaître (ordre libre),
 * les noms qui commencent par la recherche passent en premier.
 */
export function searchItems<T>(items: readonly T[], query: string, getText: (item: T) => string): T[] {
  const needle = normalizeText(query)
  if (!needle)
    return [...items]
  const words = needle.split(' ')
  const scored: { item: T, score: number }[] = []
  for (const item of items) {
    const text = normalizeText(getText(item))
    if (!words.every(word => text.includes(word)))
      continue
    const score = text.startsWith(needle)
      ? 0
      : text.split(' ').some(part => part.startsWith(words[0]))
        ? 1
        : 2
    scored.push({ item, score })
  }
  return scored
    .sort((a, b) => a.score - b.score || getText(a.item).localeCompare(getText(b.item), 'fr'))
    .map(entry => entry.item)
}
