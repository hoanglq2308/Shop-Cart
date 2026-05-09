import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function getAllProducts() {
  try {
    const response = await axios.get(`${API_BASE}/api/products`, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function getProductById(id) {
  try {
    const response = await axios.get(`${API_BASE}/api/products/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw error
  }
}
