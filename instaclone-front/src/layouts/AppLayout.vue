<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppNavigation from '@/components/common/AppNavigation.vue'
import AccountCard from '@/components/profile/AccountCard.vue'
import { ROUTE_NAMES } from '@/router/routeNames'
import { getUserSuggestions } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth'
import { useFollowsStore } from '@/stores/follows'
import { defaultAuthor } from '@/utils/profile'

const route = useRoute()
const authStore = useAuthStore()
const followsStore = useFollowsStore()

const suggestions = ref([])
const loadingSuggestions = ref(false)

const layoutMode = computed(() => (route.meta.navItem === ROUTE_NAMES.feed ? 'feed' : 'default'))
const currentUser = computed(() => defaultAuthor(authStore.user || {}))

async function loadSuggestions() {
  if (layoutMode.value !== 'feed' || !authStore.user?.id) {
    suggestions.value = []
    return
  }

  loadingSuggestions.value = true

  try {
    const [suggestionsData] = await Promise.all([
      getUserSuggestions({ page: 1, per_page: 5 }),
      followsStore.hydrateFollowingIds(authStore.user?.id),
    ])

    suggestions.value = (suggestionsData.data || []).filter((user) => user.id !== authStore.user?.id)
  } finally {
    loadingSuggestions.value = false
  }
}

async function toggleFollow(user) {
  await followsStore.toggleFollow(user.id)
}

onMounted(() => {
  loadSuggestions().catch(() => {})
})

watch(() => [route.meta.navItem, authStore.user?.id], () => {
  loadSuggestions().catch(() => {})
})
</script>

<template>
  <div class="app-shell">
    <div class="container py-3 py-lg-4">
      <div class="row g-4">
        <div class="col-lg-3 d-none d-lg-block">
          <div class="app-panel surface-card app-sidebar">
            <AppNavigation />
          </div>
        </div>

        <div :class="layoutMode === 'feed' ? 'col-lg-6' : 'col-lg-9'">
          <slot />
        </div>

        <div v-if="layoutMode === 'feed'" class="col-lg-3 d-none d-lg-block">
          <div class="d-flex flex-column gap-4">
            <section class="surface-card">
              <div class="brand-wordmark muted-copy small mb-3">Sua conta</div>
              <AccountCard
                :user="currentUser"
                :is-self="true"
                :is-following="false"
                :busy="false"
                compact
              />
            </section>

            <section class="surface-card">
              <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
                <div class="brand-wordmark muted-copy small mb-0">Sugestoes</div>
                <div class="small muted-copy">Para seguir</div>
              </div>

              <div v-if="loadingSuggestions" class="muted-copy small">Carregando...</div>

              <div v-else-if="suggestions.length" class="d-flex flex-column gap-3">
                <AccountCard
                  v-for="user in suggestions"
                  :key="user.id"
                  :user="user"
                  :is-self="user.id === authStore.user?.id"
                  :is-following="followsStore.isFollowing(user.id)"
                  :busy="followsStore.isPending(user.id)"
                  compact
                  @toggle-follow="toggleFollow"
                />
              </div>

              <div v-else class="muted-copy small">
                Nenhuma sugestao disponivel agora.
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

    <div class="mobile-nav d-lg-none">
      <div class="mobile-nav__inner">
        <AppNavigation mobile />
      </div>
    </div>
  </div>
</template>
