import { intervalToDuration } from 'date-fns'

export const useExpirationIndicator = createSharedComposable(() => {
  function calculateExpirationInterval(expirationDate: Date) {
    const now = Date.now()
    const duration = intervalToDuration({
      start: now,
      end: expirationDate,
    })
    return duration
  }

  return {
    calculateExpirationInterval,
  }
})
