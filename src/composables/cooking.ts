/** Durée lisible : 45 → « 45 min », 75 → « 1 h 15 », 120 → « 2 h ». */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes)
    return ''
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours)
    return `${rest} min`
  return rest
    ? `${hours} h ${String(rest).padStart(2, '0')}`
    : `${hours} h`
}
