import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { TOKEN_KEY } from '@/services/api'
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
} from '@/services/auth.service'
import { useFeedStore } from '@/stores/feed'
import { useFollowsStore } from '@/stores/follows'

function normalizeErrors(error) {
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
  const followsStore = useFollowsStore()

  const user = ref(null)
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  function setSession(payload) {
    token.value = payload.access_token
    user.value = payload.user
    localStorage.setItem(TOKEN_KEY, payload.access_token)
  }

  async function login(credentials) {
    loading.value = true

    try {
      const data = await loginRequest(credentials)
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
      const data = await registerRequest(payload)
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
      const data = await meRequest()
      user.value = data
      return data
    } catch (error) {
      clearSession()
      throw error
    }
  }

  async function hydrateAuthState() {
    return fetchMe()
  }

  async function logout() {
    try {
      if (token.value) {
        await logoutRequest()
      }
    } catch {
    } finally {
      clearSession()
    }
  }

  function clearSession() {
    user.value = null
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
    feedStore.resetFeed()
    followsStore.replaceFollowingIds([])
  }

  function syncUser(nextUser) {
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
    hydrateAuthState,
    clearSession,
    syncUser,
  }
})
