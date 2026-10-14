export function moneyToCents(
  value: { toFixed(digits: number): string } | number | string | null | undefined,
): number {
  if (value == null || value === "") return 0

  const fixed =
    typeof value === "number"
      ? value.toFixed(2)
      : typeof value === "string"
        ? Number(value).toFixed(2)
        : value.toFixed(2)

  const negative = fixed.startsWith("-")
  const [whole, fraction = "00"] = fixed.replace("-", "").split(".")
  const cents = Number(whole) * 100 + Number(fraction.slice(0, 2).padEnd(2, "0"))
  if (!Number.isFinite(cents)) return 0

  return negative ? -cents : cents
}

export function centsToDecimalString(cents: number): string {
  const sign = cents < 0 ? "-" : ""
  const absolute = Math.abs(cents)
  const reais = Math.floor(absolute / 100)
  const centavos = absolute % 100

  return `${sign}${reais}.${String(centavos).padStart(2, "0")}`
}

export function formatBrlFromCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}
