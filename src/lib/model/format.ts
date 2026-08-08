const CURRENCY_LOCALE: Record<string, string> = {
  EUR: "en-IE",
  USD: "en-US",
  GBP: "en-GB",
  SEK: "sv-SE",
}

export function formatCurrency(value: number, currency = "EUR", opts?: { compact?: boolean }): string {
  if (!Number.isFinite(value)) return "Not calculable"
  const locale = CURRENCY_LOCALE[currency] ?? "en-US"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: opts?.compact ? "compact" : "standard",
    maximumFractionDigits: opts?.compact ? 1 : 0,
  }).format(value)
}

export function formatPercent(fraction: number, digits = 1): string {
  if (!Number.isFinite(fraction)) return "Not calculable"
  return `${(fraction * 100).toFixed(digits)}%`
}

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "Not calculable"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value)
}

export function formatMonths(month: number | null): string {
  if (month === null) return "Not reached in horizon"
  if (month === 0) return "Month 1"
  return `Month ${month + 1}`
}

export function formatSigned(value: number, currency = "EUR"): string {
  if (!Number.isFinite(value)) return "Not calculable"
  const sign = value >= 0 ? "+" : "−"
  return `${sign}${formatCurrency(Math.abs(value), currency)}`
}
