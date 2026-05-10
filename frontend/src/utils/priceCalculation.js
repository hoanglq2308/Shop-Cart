/**
 * @typedef {Object} PriceItem
 * @property {number} price
 * @property {number} quantity
 *
 * @typedef {Object} Coupon
 * @property {'PERCENTAGE'|'FIXED_AMOUNT'} type
 * @property {number|string} value
 */

/**
 * Calculate order totals from items, optional coupon, and shipping fee.
 *
 * @param {PriceItem[]} items
 * @param {Coupon | null} coupon
 * @param {number} shippingFee
 * @returns {{ subtotal: number, discount: number, shipping: number, total: number }}
 */
export function calculateOrderPrice(items = [], coupon = null, shippingFee = 0) {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0
    const quantity = Number(item.quantity) || 0
    return sum + price * quantity
  }, 0)

  let discount = 0
  if (coupon && Number(coupon.value) > 0) {
    const couponType = String(coupon.type || '')
      .trim()
      .toUpperCase()

    if (couponType === 'PERCENTAGE') {
      discount = subtotal * (Number(coupon.value) / 100)
    } else if (couponType === 'FIXED_AMOUNT') {
      discount = Number(coupon.value)
    }
  }

  const normalizedShipping = Math.max(0, Number(shippingFee) || 0)
  const normalizedDiscount = Math.min(subtotal, Math.max(0, discount))
  const total = subtotal + normalizedShipping - normalizedDiscount

  return {
    subtotal,
    discount: normalizedDiscount,
    shipping: normalizedShipping,
    total,
  }
}

/**
 * Check if cart items can be fulfilled by the provided stock list.
 *
 * @param {{ productId: number | string, quantity: number }[]} cartItems
 * @param {{ id: number | string, stockQuantity?: number }[]} productStocks
 * @returns {{ isAvailable: boolean, unavailableItems: Array<{ productId: number | string, requested: number, available: number }> }}
 */
export function checkInventoryAvailability(cartItems = [], productStocks = []) {
  const stockMap = new Map(
    productStocks.map((product) => [String(product.id), Number(product.stockQuantity) || 0]),
  )

  const unavailableItems = cartItems
    .filter((item) => {
      const stock = stockMap.get(String(item.productId))
      if (stock == null) {
        return true
      }
      return Number(item.quantity) > stock
    })
    .map((item) => ({
      productId: item.productId,
      requested: Number(item.quantity),
      available: stockMap.get(String(item.productId)) ?? 0,
    }))

  return {
    isAvailable: unavailableItems.length === 0,
    unavailableItems,
  }
}
