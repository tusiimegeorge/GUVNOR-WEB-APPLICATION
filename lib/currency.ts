/**
 * Currency formatting utility for Ugandan Shillings
 */

export const CURRENCY = {
  code: "UGX",
  symbol: "UGX",
  locale: "en-UG",
}

/**
 * Format amount as Ugandan Shillings
 * @param amount - Amount in UGX
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  if (!amount && amount !== 0) return `${CURRENCY.symbol} 0`

  return `${CURRENCY.symbol} ${Math.round(amount).toLocaleString(CURRENCY.locale)}`
}

/**
 * Format amount as Ugandan Shillings for display
 * @param amount - Amount in UGX
 * @returns Formatted currency string (e.g., "UGX 50,000")
 */
export function displayPrice(price: number | string): string {
  if (!price) return `${CURRENCY.symbol} 0`

  const numPrice = typeof price === "string" ? parseFloat(price) : price

  if (isNaN(numPrice)) return `${CURRENCY.symbol} 0`

  return `${CURRENCY.symbol} ${Math.round(numPrice).toLocaleString(CURRENCY.locale)}`
}
