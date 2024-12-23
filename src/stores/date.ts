import { format } from 'date-fns'
import { acceptHMRUpdate, defineStore } from 'pinia'

// this store is responsible to get information relative to ingredient creation

export const useDateStore = defineStore('date', () => {
  const dayFormat = 'dd/MM/yyyy'
  const today = new Date()
  const todayFormated = computed(() => format(today, dayFormat))

  function formatDate(date: Date) {
    format(date, dayFormat)
  }
  return {
    dayFormat,
    todayFormated,
    formatDate,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useDateStore as any, import.meta.hot))