<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AccountCard from '@/components/profile/AccountCard.vue'
import { CONNECTION_LIST_TYPES, ROUTE_NAMES } from '@/router/routeNames'
import { extractErrorMessage } from '@/services/api'
import { getUserFollowers, getUserFollowing } from '@/services/follows.service'
import { getUserByUsername } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth'
import { useFollowsStore } from '@/stores/follows'
import { defaultAuthor } from '@/stores/profileUtils'

const route = useRoute()
const authStore = useAuthStore()
const followsStore = useFollowsStore()

const profile = ref(null)
const users = ref([])
const loading = ref(false)
const error = ref('')
const pagination = reactive({
  currentPage: 1,
  lastPage: 1,
})

const targetUsername = computed(() => route.query.user || authStore.user?.username || '')
const isOwnProfile = computed(() => targetUsername.value === authStore.user?.username)
const type = computed(() => (
  route.params.type === CONNECTION_LIST_TYPES.following
    ? CONNECTION_LIST_TYPES.following
    : CONNECTION_LIST_TYPES.followers
))
const title = computed(() => (type.value === CONNECTION_LIST_TYPES.followers ? 'Seguidores' : 'Seguindo'))
const backTarget = computed(() => ({
  name: ROUTE_NAMES.profile,
  query: isOwnProfile.value ? undefined : { user: targetUsername.value },
}))

async function loadConnections(page = 1) {
  if (!targetUsername.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [profileData] = await Promise.all([
      getUserByUsername(targetUsername.value),
      followsStore.hydrateFollowingIds(authStore.user?.id),
    ])

    profile.value = defaultAuthor(profileData)

    const data = type.value === CONNECTION_LIST_TYPES.followers
      ? await getUserFollowers(profileData.id, { page, per_page: 12 })
      : await getUserFollowing(profileData.id, { page, per_page: 12 })

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
  try {
    await followsStore.toggleFollow(user.id)
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel atualizar o follow.')
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
      <AccountCard
        v-for="user in users"
        :key="user.id"
        :user="user"
        :is-self="user.id === authStore.user?.id"
        :is-following="followsStore.isFollowing(user.id)"
        :busy="followsStore.isPending(user.id)"
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
