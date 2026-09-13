// Helper to calculate selling price from provider rate + markup
export function calculateSellingPrice(
  providerRate: number,
  markupType: string,
  markupValue: number,
  roundTo: number = 0.01
): number {
  let price: number
  if (markupType === 'FIXED') {
    price = providerRate + markupValue
  } else {
    // PERCENTAGE
    price = providerRate * (1 + markupValue / 100)
  }
  // Round to specified precision
  if (roundTo > 0) {
    price = Math.ceil(price / roundTo) * roundTo
  }
  return parseFloat(price.toFixed(4))
}
