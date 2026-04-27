<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import UserSuggestionCard from '@/components/common/UserSuggestionCard.vue'
import { extractErrorMessage } from '@/services/formatters'
import api from '@/services/api'
import { fetchAllFollowingIds } from '@/services/users'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const suggestions = ref([])
const pagination = reactive({
  currentPage: 1,
  lastPage: 1,
})
const followingIds = ref(new Set())
const busyByUserId = reactive({})
const loading = ref(false)
const error = ref('')

const canGoBack = computed(() => pagination.currentPage > 1)
const canGoNext = computed(() => pagination.currentPage < pagination.lastPage)

async function fetchFollowing() {
  // Carrega todos os ids seguidos para marcar corretamente cada card da tela.
  followingIds.value = await fetchAllFollowingIds(authStore.user?.id)
}

async function fetchSuggestions(page = 1) {
  loading.value = true
  error.value = ''

  try {
    // Sugestoes e ids seguidos sao buscados juntos para montar o estado do botao.
    const [{ data: suggestionsData }] = await Promise.all([
      api.get('/users/suggestions', {
        params: {
          page,
          per_page: 9,
        },
      }),
      fetchFollowing(),
    ])

    suggestions.value = suggestionsData.data || []
    pagination.currentPage = suggestionsData.current_page || page
    pagination.lastPage = suggestionsData.last_page || 1
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel carregar sugestoes.')
  } finally {
    loading.value = false
  }
}

async function toggleFollow(user) {
  busyByUserId[user.id] = true

  try {
    // O Set local evita nova busca completa toda vez que o follow muda.
    if (followingIds.value.has(user.id)) {
      await api.delete(`/users/${user.id}/unfollow`)
      followingIds.value.delete(user.id)
    } else {
      await api.post(`/users/${user.id}/follow`)
      followingIds.value.add(user.id)
    }

    followingIds.value = new Set(followingIds.value)
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel atualizar o follow.')
  } finally {
    busyByUserId[user.id] = false
  }
}

onMounted(() => {
  // A lista e carregada ao entrar na pagina.
  fetchSuggestions().catch(() => {})
})
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <h1>Descobrir</h1>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="loading" class="surface-card">
      <div class="muted-copy">Carregando sugestoes...</div>
    </div>

    <div v-else-if="suggestions.length" class="d-flex flex-column gap-4">
      <div class="row g-4">
        <div v-for="user in suggestions" :key="user.id" class="col-md-6 col-xl-4">
          <UserSuggestionCard
            :user="user"
            :is-following="followingIds.has(user.id)"
            :busy="Boolean(busyByUserId[user.id])"
            :is-self="user.id === authStore.user?.id"
            @toggle-follow="toggleFollow"
          />
        </div>
      </div>

      <div class="surface-card toolbar-card">
        <div class="muted-copy">
          Pagina {{ pagination.currentPage }} de {{ pagination.lastPage }}
        </div>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-ghost-brand"
            :disabled="!canGoBack"
            @click="fetchSuggestions(pagination.currentPage - 1)"
          >
            Voltar
          </button>
          <button
            type="button"
            class="btn btn-brand"
            :disabled="!canGoNext"
            @click="fetchSuggestions(pagination.currentPage + 1)"
          >
            Proxima
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      Nenhuma sugestao disponivel neste momento.
    </div>
  </div>
</template>
