import { ref } from 'vue'

// this section is no used

/* // this is able the possibility to enable mutilple section at the same time
export function useSectionManagerMultiple<T extends Record<string, boolean>>(options: T, multiple = false) {
  type SectionKey = keyof T // get valid key of options parameter

  // Vérification explicite pour s'assurer que `options` n'est pas undefined
  if (!options) {
    throw new Error('options cannot be undefined or null')
  }
  const sections = reactive(options)

  const toggleSection = (section: SectionKey) => {
    sections[section] = !sections[section]
  }

  return { sections, toggleSection, labels: options }
} */

export function useSectionManager(options: readonly string[]) {
  // here, `typeof options[number]` extract the type of the value of this array `options`
  const activeSection = ref<typeof options[number]>(options[0])

  const setActiveSection = (section: typeof options[number]) => {
    activeSection.value = section
  }

  return { activeSection, setActiveSection, labels: options }
}
