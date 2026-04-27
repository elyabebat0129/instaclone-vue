import axios from 'axios'
import { getActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const TOKEN_KEY = 'instaclone.token'

// Instancia central do Axios. Os services importam este objeto para nao
// repetir baseURL, headers e regras de autenticacao em cada requisicao.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  // Antes de cada request, tentamos anexar o token salvo no navegador.
  // Assim as telas nao precisam lembrar de enviar Authorization manualmente.
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
      // 401 indica sessao invalida/expirada. Limpamos o estado local para
      // evitar que o front continue exibindo dados de um usuario sem sessao.
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
  // A API pode devolver erros em formatos diferentes; esta funcao pega a
  // primeira mensagem util para mostrar na interface.
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
