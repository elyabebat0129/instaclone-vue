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
  // Padroniza erros de validacao/API para as telas tratarem tudo do mesmo jeito.
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

  // Estado principal da sessao. O token inicia a partir do localStorage para
  // manter o usuario logado quando ele recarrega a pagina.
  const user = ref(null)
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const loading = ref(false)

  // Computed usado pelo router e pelas telas para saber se existe sessao.
  const isAuthenticated = computed(() => Boolean(token.value))

  function setSession(payload) {
    // O backend devolve access_token e user no login/cadastro.
    // Guardamos nos dois lugares: Pinia para reatividade e localStorage para persistencia.
    token.value = payload.access_token
    user.value = payload.user
    localStorage.setItem(TOKEN_KEY, payload.access_token)
  }

  async function login(credentials) {
    // Fluxo de entrada: envia credenciais, recebe a sessao e atualiza a store.
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
    // Cadastro segue a mesma ideia do login: criou a conta, ja inicia a sessao.
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
    // Usado quando ja existe token salvo, mas ainda nao temos o usuario em memoria.
    if (!token.value) {
      return null
    }

    try {
      // Reidrata o usuario autenticado a partir do token salvo.
      const data = await meRequest()
      user.value = data
      return data
    } catch (error) {
      clearSession()
      throw error
    }
  }

  async function hydrateAuthState() {
    // Nome mais semantico para o router: tenta reconstruir a sessao antes de navegar.
    return fetchMe()
  }

  async function logout() {
    // Mesmo que a API falhe no logout, a limpeza local precisa acontecer.
    try {
      if (token.value) {
        await logoutRequest()
      }
    } catch {
      // Mantemos a limpeza local mesmo se o token ja estiver invalido.
    } finally {
      clearSession()
    }
  }

  function clearSession() {
    // Limpa tudo que pertence a sessao atual.
    user.value = null
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
    // O feed tambem precisa ser limpo para evitar posts "sobrando" entre contas.
    feedStore.resetFeed()
    followsStore.replaceFollowingIds([])
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
    hydrateAuthState,
    clearSession,
    syncUser,
  }
})
