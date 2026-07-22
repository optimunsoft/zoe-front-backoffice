/** Fecha de hoy a medianoche (hora local), para valores iniciales de datepickers. */
export const todayLocalDate = (): Date => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}
