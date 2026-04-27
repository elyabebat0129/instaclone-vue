<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AccountCard from '@/components/profile/AccountCard.vue'
import { extractErrorMessage } from '@/services/api'
import { getUserSuggestions } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth'
import { useFollowsStore } from '@/stores/follows'

const authStore = useAuthStore()
const followsStore = useFollowsStore()
const suggestions = ref([])
const pagination = reactive({
  currentPage: 1,
  lastPage: 1,
})
const loading = ref(false)
const error = ref('')

const canGoBack = computed(() => pagination.currentPage > 1)
const canGoNext = computed(() => pagination.currentPage < pagination.lastPage)

async function fetchSuggestions(page = 1) {
  loading.value = true
  error.value = ''

  try {
    const [suggestionsData] = await Promise.all([
      getUserSuggestions({
        page,
        per_page: 9,
      }),
      followsStore.hydrateFollowingIds(authStore.user?.id),
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
  try {
    await followsStore.toggleFollow(user.id)
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel atualizar o follow.')
  }
}

onMounted(() => {
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
          <AccountCard
            :user="user"
            :stacked="true"
            :is-following="followsStore.isFollowing(user.id)"
            :busy="followsStore.isPending(user.id)"
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
