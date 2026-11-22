/**
 * Utilitários para inputs de valor no padrão monetário brasileiro (BRL).
 * Exibição: "1.234,56" | Conversão API: 1234.56
 */

/** Remove tudo que não for dígito. */
function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Formata string digitada para o padrão pt-BR (centavos da direita).
 * Aceita apenas números. Ex: "1234" → "12,34" | "150000" → "1.500,00" | "" → "0,00"
 */
export function formatCurrencyInput(value: string): string {
  const digits = onlyDigits(value)
  const amount = digits ? Number(digits) / 100 : 0

  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Converte número em string formatada para preencher inputs.
 * Ex: 1500 → "1.500,00" | NaN → "0,00"
 */
export function formatCurrencyFromNumber(value: number): string {
  const amount = Number.isFinite(value) ? value : 0

  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Converte string no padrão pt-BR em number.
 * Ex: "1.234,56" → 1234.56 | "" | "0,00" → 0
 */
export function parseCurrencyInput(value: string): number {
  const digits = onlyDigits(value)
  if (!digits) return 0
  return Number(digits) / 100
}

/** true se a string formatada representa um valor > 0 */
export function isPositiveCurrency(value: string): boolean {
  return parseCurrencyInput(value) > 0
}

/** true se representa um valor >= 0 */
export function isNonNegativeCurrency(value: string): boolean {
  const amount = parseCurrencyInput(value)
  return !Number.isNaN(amount) && amount >= 0
}
