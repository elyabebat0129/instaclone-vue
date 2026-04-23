<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ConnectionListItem from '@/components/common/ConnectionListItem.vue'
import { extractErrorMessage } from '@/services/formatters'
import api from '@/services/api'
import { fetchAllFollowingIds } from '@/services/users'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const profile = ref(null)
const users = ref([])
const loading = ref(false)
const error = ref('')
const busyByUserId = reactive({})
const followingIds = ref(new Set())
const pagination = reactive({
  currentPage: 1,
  lastPage: 1,
})

const targetUsername = computed(() => route.query.user || authStore.user?.username || '')
const isOwnProfile = computed(() => targetUsername.value === authStore.user?.username)
const type = computed(() => route.params.type === 'seguindo' ? 'seguindo' : 'seguidores')
const title = computed(() => (type.value === 'seguidores' ? 'Seguidores' : 'Seguindo'))
const endpointKey = computed(() => (type.value === 'seguidores' ? 'followers' : 'following'))
const backTarget = computed(() => (isOwnProfile.value ? '/perfil' : `/perfil?user=${targetUsername.value}`))

async function fetchViewerFollowing() {
  followingIds.value = await fetchAllFollowingIds(authStore.user?.id)
}

async function loadConnections(page = 1) {
  if (!targetUsername.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [{ data: profileData }] = await Promise.all([
      api.get(`/users/${targetUsername.value}`),
      fetchViewerFollowing(),
    ])

    profile.value = profileData

    const { data } = await api.get(`/users/${profileData.id}/${endpointKey.value}`, {
      params: { page, per_page: 12 },
    })

    users.value = data.data || []
    pagination.currentPage = data.current_page || page
    pagination.lastPage = data.last_page || 1
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel carregar esta lista.')
  } finally {
    loading.value = false
  }
}

async function toggleFollow(user) {
  busyByUserId[user.id] = true

  try {
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
  loadConnections().catch(() => {})
})

watch(() => [route.query.user, route.params.type], () => {
  loadConnections().catch(() => {})
})
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <h1>{{ title }}</h1>
        <p v-if="profile">Lista de {{ title.toLowerCase() }} de <strong>@{{ profile.username }}</strong>.</p>
      </div>
      <RouterLink :to="backTarget" class="btn btn-ghost-brand">
        Voltar ao perfil
      </RouterLink>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="loading" class="surface-card">
      <div class="muted-copy">Carregando conexoes...</div>
    </div>

    <div v-else-if="users.length" class="d-flex flex-column gap-3">
      <ConnectionListItem
        v-for="user in users"
        :key="user.id"
        :user="user"
        :is-self="user.id === authStore.user?.id"
        :is-following="followingIds.has(user.id)"
        :busy="Boolean(busyByUserId[user.id])"
        @toggle-follow="toggleFollow"
      />

      <div class="surface-card toolbar-card">
        <div class="muted-copy">
          Pagina {{ pagination.currentPage }} de {{ pagination.lastPage }}
        </div>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-ghost-brand"
            :disabled="pagination.currentPage <= 1"
            @click="loadConnections(pagination.currentPage - 1)"
          >
            Voltar
          </button>
          <button
            type="button"
            class="btn btn-brand"
            :disabled="pagination.currentPage >= pagination.lastPage"
            @click="loadConnections(pagination.currentPage + 1)"
          >
            Proxima
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      Nenhum usuario encontrado nesta lista.
    </div>
  </div>
</template>
