export function validateCartItem(item) {
  if (!item || !item.productId) {
    return { valid: false, error: 'Product ID không hợp lệ' }
  }

  const quantity = Number(item.quantity)

  if (!Number.isInteger(quantity)) {
    return { valid: false, error: 'Số lượng phải là số nguyên' }
  }

  if (quantity <= 0) {
    return { valid: false, error: 'Số lượng phải lớn hơn 0' }
  }

  const stock = Number(item.stock) || 0
  if (quantity > stock) {
    return { valid: false, error: `Số lượng không được vượt quá ${stock}` }
  }

  return { valid: true }
}

export function calculateCartTotal(cartItems = []) {
  if (!cartItems || cartItems.length === 0) {
    return {
      subtotal: 0,
      itemCount: 0,
      total: 0,
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.product?.price) || 0
    const quantity = Number(item.quantity) || 0
    return sum + price * quantity
  }, 0)

  const itemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  return {
    subtotal,
    itemCount,
    total: subtotal,
  }
}

export function validateQuantityUpdate(currentQuantity, newQuantity, maxStock) {
  const current = Number(currentQuantity) || 0
  const newQty = Number(newQuantity)
  const max = Number(maxStock) || 0

  if (!Number.isInteger(newQty)) {
    return { valid: false, error: 'Số lượng phải là số nguyên' }
  }

  if (newQty <= 0) {
    return { valid: false, error: 'Số lượng phải lớn hơn 0' }
  }

  if (newQty > max) {
    return { valid: false, error: `Số lượng không được vượt quá ${max}` }
  }

  return { valid: true, newQuantity: newQty }
}
