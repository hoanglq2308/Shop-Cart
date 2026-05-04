export function calculateCartCount(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0)
}

export function calculateCartSubtotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}
