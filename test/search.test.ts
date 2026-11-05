import { describe, expect, it } from 'vitest'
import { normalizeText, searchItems } from '../src/composables/search'

const names = [
  'Beurre doux',
  'Crème fraîche',
  'Farine T55',
  'Beurre de cacao',
  'Pâte à choux',
]

describe('recherche', () => {
  it('ignore accents et casse', () => {
    expect(normalizeText('  Crème  Fraîche ')).toBe('creme fraiche')
    expect(searchItems(names, 'creme', n => n)).toEqual(['Crème fraîche'])
  })

  it('accepte les mots dans le désordre', () => {
    expect(searchItems(names, 'cacao beurre', n => n)).toEqual(['Beurre de cacao'])
  })

  it('classe en premier les noms qui commencent par la recherche', () => {
    expect(searchItems(['Pâte à choux', 'Choux craquelin'], 'choux', n => n)).toEqual(['Choux craquelin', 'Pâte à choux'])
  })
})
