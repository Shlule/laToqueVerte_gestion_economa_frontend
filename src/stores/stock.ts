import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Stock } from '~/types'

export const useStockStore = defineStore('useStockStore', () => {
  const stockPerIngredient = ref<Map<string, Stock[]>>(new Map())

  // async function populateServerData() {
  //   const { data: ingredientList, error, isLoading } = await getAllIngredient()
  //   if (!ingredientList.value) {
  //     return
  //   }
  //   const promiseList = []
  //   for (const ingredient of ingredientList.value) {
  //     promiseList.push(getAllStocks(ingredient.id))
  //   //   const { data: stockList, error, isLoading } = await getAllStocks(ingredient.id)
  //   //   if (!stockList.value) {
  //   //     stockPerIngredient.value.set(ingredient.id, [])
  //   //     continue
  //   //   }
  //   //   stockPerIngredient.value.set(ingredient.id, stockList.value)
  //   }
  //   const stocks = await Promise.all(promiseList)
  //   for (let i = 0; i < ingredientList.value.length; i++) {
  //     const ingredient = ingredientList.value[i]
  //     const { data: stockList, error, isLoading } = stocks[i]
  //     if (!stockList.value) {
  //       stockPerIngredient.value.set(ingredient.id, [])
  //       continue
  //     }
  //     stockPerIngredient.value.set(ingredient.id, stockList.value)
  //   }
  // }

  function hasStocks(ingredientId: string): boolean {
    return stockPerIngredient.value.has(ingredientId)
  }

  function getStocks(ingredientId: string): Stock[] | undefined {
    return stockPerIngredient.value.get(ingredientId)
  }

  function setStocks(ingredientId: string, stocks: Stock[]) {
    stockPerIngredient.value.set(ingredientId, stocks)
  }

  return {
    stockPerIngredient,
    hasStocks,
    getStocks,
    setStocks,

  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useStockStore as any, import.meta.hot))
