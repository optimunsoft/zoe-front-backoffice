/**
 * Calcula el dígito de verificación (DV) de un NIT colombiano (algoritmo DIAN).
 */
export const getNITCheckDigit = (nit: string): string => {
  const nitNumerico = nit.replace(/\D/g, '').padStart(15, '0')
  const pesos = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3]
  let suma = 0

  for (let i = 0; i < 15; i++) {
    const peso = pesos[i]
    const digito = Number.parseInt(nitNumerico.charAt(i), 10)

    if (peso === undefined || Number.isNaN(digito)) continue

    suma += digito * peso
  }

  const residuo = suma % 11
  const digito = residuo === 1 ? 1 : residuo === 0 ? 0 : 11 - residuo

  return digito.toString()
}
