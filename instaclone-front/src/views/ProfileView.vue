<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfilePostGrid from '@/components/profile/ProfilePostGrid.vue'
import ProfileSummaryCards from '@/components/profile/ProfileSummaryCards.vue'
import { ROUTE_NAMES } from '@/router/routeNames'
import { extractErrorMessage } from '@/services/api'
import { getIsFollowing, getUserByUsername, getUserFollowers, getUserFollowing, getUserPosts } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth'
import { useFollowsStore } from '@/stores/follows'
import { defaultAuthor } from '@/stores/profileUtils'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const followsStore = useFollowsStore()

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
    const userData = await getUserByUsername(targetUsername.value)
    profile.value = defaultAuthor(userData)

    const requests = [
      getUserPosts(userData.id, { page: 1, per_page: 24 }),
      getUserFollowers(userData.id, { page: 1, per_page: 1 }),
      getUserFollowing(userData.id, { page: 1, per_page: 1 }),
      followsStore.hydrateFollowingIds(authStore.user?.id),
    ]

    if (!isOwnProfile.value) {
      requests.push(getIsFollowing(userData.id))
    }

    const [postsResponse, followersResponse, followingResponse, _viewerFollowing, isFollowingResponse] = await Promise.all(requests)

    posts.value = postsResponse.data || []
    postsCount.value = postsResponse.total || posts.value.length
    followersCount.value = followersResponse.total || 0
    followingCount.value = followingResponse.total || 0
    isFollowing.value = isOwnProfile.value ? false : Boolean(isFollowingResponse?.is_following)
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
    await followsStore.toggleFollow(profile.value.id)
    isFollowing.value = followsStore.isFollowing(profile.value.id)

    if (isFollowing.value) {
      followersCount.value += 1
    } else {
      followersCount.value = Math.max(0, followersCount.value - 1)
    }
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel atualizar o follow.')
  } finally {
    followBusy.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: ROUTE_NAMES.login })
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
      <section class="surface-card">
        <div class="row g-4 align-items-center">
          <div class="col-md-auto">
            <img
              :src="profile.avatar_url"
              :alt="profile.username"
              class="profile-hero__avatar"
            />
          </div>

          <div class="col">
            <div class="d-flex flex-column gap-3">
              <ProfileHeader
                :profile="profile"
                :is-own-profile="isOwnProfile"
                :is-following="isFollowing"
                :busy="followBusy"
                @toggle-follow="toggleFollow"
              />
              <p class="mb-0">{{ profile.bio || 'Este perfil ainda nao adicionou uma bio.' }}</p>
              <ProfileSummaryCards
                :username="profile.username"
                :posts-count="postsCount"
                :followers-count="followersCount"
                :following-count="followingCount"
                :is-own-profile="isOwnProfile"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="surface-card">
        <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
          <h2 class="h4 mb-0">Posts</h2>
          <div class="muted-copy small">{{ postsCount }} post(s)</div>
        </div>

        <ProfilePostGrid v-if="posts.length" :posts="posts" />
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
