<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PostGrid from '@/components/common/PostGrid.vue'
import ProfileHero from '@/components/common/ProfileHero.vue'
import { extractErrorMessage } from '@/services/formatters'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const profile = ref(null)
const posts = ref([])
const postsCount = ref(0)
const followersCount = ref(0)
const followingCount = ref(0)
const isFollowing = ref(false)
const followBusy = ref(false)

const targetUsername = computed(() => route.query.user || authStore.user?.username || '')
const isOwnProfile = computed(() => targetUsername.value === authStore.user?.username)

async function loadProfile() {
  if (!targetUsername.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { data: userData } = await api.get(`/users/${targetUsername.value}`)
    profile.value = userData

    const requests = [
      api.get(`/users/${userData.id}/posts`, { params: { page: 1, per_page: 24 } }),
      api.get(`/users/${userData.id}/followers`, { params: { page: 1, per_page: 1 } }),
      api.get(`/users/${userData.id}/following`, { params: { page: 1, per_page: 1 } }),
    ]

    if (!isOwnProfile.value) {
      requests.push(api.get(`/users/${userData.id}/is-following`))
    }

    const [postsResponse, followersResponse, followingResponse, isFollowingResponse] = await Promise.all(requests)

    posts.value = postsResponse.data.data || []
    postsCount.value = postsResponse.data.total || posts.value.length
    followersCount.value = followersResponse.data.total || 0
    followingCount.value = followingResponse.data.total || 0
    isFollowing.value = isOwnProfile.value ? false : Boolean(isFollowingResponse?.data?.is_following)
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel carregar este perfil.')
  } finally {
    loading.value = false
  }
}

async function toggleFollow() {
  if (!profile.value || isOwnProfile.value) {
    return
  }

  followBusy.value = true

  try {
    if (isFollowing.value) {
      await api.delete(`/users/${profile.value.id}/unfollow`)
      isFollowing.value = false
      followersCount.value = Math.max(0, followersCount.value - 1)
    } else {
      await api.post(`/users/${profile.value.id}/follow`)
      isFollowing.value = true
      followersCount.value += 1
    }
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel atualizar o follow.')
  } finally {
    followBusy.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadProfile().catch(() => {})
})

watch(() => route.query.user, () => {
  loadProfile().catch(() => {})
})
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <h1>Perfil</h1>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="loading" class="surface-card">
      <div class="muted-copy">Carregando perfil...</div>
    </div>

    <div v-else-if="profile" class="d-flex flex-column gap-4">
      <ProfileHero
        :profile="profile"
        :posts-count="postsCount"
        :followers-count="followersCount"
        :following-count="followingCount"
        :is-own-profile="isOwnProfile"
        :is-following="isFollowing"
        :busy="followBusy"
        @toggle-follow="toggleFollow"
      />

      <section class="surface-card">
        <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
          <h2 class="h4 mb-0">Posts</h2>
          <div class="muted-copy small">{{ postsCount }} post(s)</div>
        </div>

        <PostGrid v-if="posts.length" :posts="posts" />
        <div v-else class="empty-state">
          Nenhum post encontrado para este perfil.
        </div>
      </section>

      <button
        v-if="isOwnProfile"
        type="button"
        class="btn btn-ghost-brand w-100 d-lg-none"
        @click="handleLogout"
      >
        Sair da conta
      </button>
    </div>
  </div>
</template>
