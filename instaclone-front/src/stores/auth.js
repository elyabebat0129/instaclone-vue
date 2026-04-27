import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api, { TOKEN_KEY } from '@/services/api'
import { useFeedStore } from '@/stores/feed'

function normalizeErrors(error) {
  // Padroniza a leitura dos erros para as views tratarem tudo do mesmo jeito.
  if (error.response?.status === 422 && error.response?.data?.errors) {
    return error.response.data.errors
  }

  if (error.response?.data?.message) {
    return { general: [error.response.data.message] }
  }

  return { general: ['Nao foi possivel concluir a operacao.'] }
}

export const useAuthStore = defineStore('auth', () => {
  const feedStore = useFeedStore()
  const user = ref(null)
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  function setSession(payload) {
    // O backend devolve access_token e user no login/cadastro.
    token.value = payload.access_token
    user.value = payload.user
    localStorage.setItem(TOKEN_KEY, payload.access_token)
  }

  async function login(credentials) {
    loading.value = true

    try {
      const { data } = await api.post('/auth/login', credentials)
      setSession(data)
      return data
    } catch (error) {
      throw normalizeErrors(error)
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true

    try {
      const { data } = await api.post('/auth/register', payload)
      setSession(data)
      return data
    } catch (error) {
      throw normalizeErrors(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) {
      return null
    }

    try {
      // Reidrata o usuario autenticado a partir do token salvo.
      const { data } = await api.get('/auth/me')
      user.value = data
      return data
    } catch (error) {
      clearSession()
      throw error
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await api.post('/auth/logout')
      }
    } catch {
      // Mantemos a limpeza local mesmo se o token ja estiver invalido.
    } finally {
      clearSession()
    }
  }

  function clearSession() {
    user.value = null
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
    // O feed tambem precisa ser limpo para evitar posts "sobrando" entre contas.
    feedStore.resetFeed()
  }

  function syncUser(nextUser) {
    // Usado quando perfil/avatar muda e precisamos refletir isso sem novo login.
    user.value = nextUser
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchMe,
    clearSession,
    syncUser,
  }
})
