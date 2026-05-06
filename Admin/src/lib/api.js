export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://corelign-production.up.railway.app'

export function apiUrl(path) {
  return `${API_BASE}${path}`
}
