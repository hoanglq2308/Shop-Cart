import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export async function checkStock(items) {
  const response = await axios.post(`${API_BASE}/inventory/check-stock`, { items }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
  })

  return response.data
}