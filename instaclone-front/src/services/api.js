import axios from 'axios'
import { getActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const TOKEN_KEY = 'instaclone.token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      const activePinia = getActivePinia()

      if (activePinia) {
        useAuthStore(activePinia).clearSession()
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

export function extractErrorMessage(error, fallback = 'Nao foi possivel concluir a operacao.') {
  if (error.response?.data?.errors) {
    const firstEntry = Object.values(error.response.data.errors)[0]

    if (Array.isArray(firstEntry) && firstEntry.length) {
      return firstEntry[0]
    }  
  }

  return error.response?.data?.message || error.message || fallback
}

export { TOKEN_KEY }
export default api
