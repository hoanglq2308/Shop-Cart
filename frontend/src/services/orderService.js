import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

export async function createOrder(payload) {
  try {
    const response = await axios.post(`${API_BASE}/orders`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    })

    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data
    }

    throw error
  }
}
