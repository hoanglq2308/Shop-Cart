import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

/**
 * Get all cart items for the current user
 */
export async function getCart() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cart`)
    return response.data
  } catch (error) {
    console.error('Error fetching cart:', error)
    throw error
  }
}

/**
 * Add a product to cart
 */
export async function addToCart(productId, quantity) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/cart/add`, {
      productId,
      quantity,
    })
    return response.data
  } catch (error) {
    console.error('Error adding to cart:', error)
    // If backend returned a structured error response (e.g., 400 with JSON body),
    // return that body so callers can show user-friendly messages instead of
    // always hitting the generic catch branch.
    if (error.response && error.response.data) {
      return error.response.data
    }
    throw error
  }
}

/**
 * Update quantity of a cart item
 */
export async function updateCartItemQuantity(cartItemId, quantity) {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/cart/${cartItemId}/quantity`, {
      quantity,
    })
    return response.data
  } catch (error) {
    console.error('Error updating cart item quantity:', error)
    if (error.response && error.response.data) {
      return error.response.data
    }
    throw error
  }
}

/**
 * Remove an item from cart
 */
export async function removeCartItem(cartItemId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/cart/${cartItemId}`)
    return response.data
  } catch (error) {
    console.error('Error removing cart item:', error)
    if (error.response && error.response.data) {
      return error.response.data
    }
    throw error
  }
}

/**
 * Calculate cart count
 */
export function calculateCartCount(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * Calculate cart subtotal
 */
export function calculateCartSubtotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
