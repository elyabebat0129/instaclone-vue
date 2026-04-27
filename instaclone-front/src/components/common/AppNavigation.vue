<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppIcon from '@/components/layout/AppIcon.vue'
import { ROUTE_NAMES } from '@/router/routeNames'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const links = [
  { label: 'Home', name: ROUTE_NAMES.feed, icon: 'home' },
  { label: 'Buscar', name: ROUTE_NAMES.discover, icon: 'search' },
  { label: 'Criar', name: ROUTE_NAMES.create, icon: 'plusSquare' },
  { label: 'Perfil', name: ROUTE_NAMES.profile, icon: 'person' },
]

defineProps({
  mobile: {
    type: Boolean,
    default: false,
  },
})

const username = computed(() => authStore.user?.username || 'usuario')

async function handleLogout() {
  await authStore.logout()
  router.push({ name: ROUTE_NAMES.login })
}
</script>

<template>
  <div v-if="!mobile" class="d-flex flex-column gap-4">
    <div>
      <div class="brand-wordmark muted-copy small">InstaClone</div>
      <h2 class="h3 mt-2 mb-1">Area autenticada</h2>
      <p class="muted-copy mb-0">
        Navegacao principal do app e sessao de {{ username }}.
      </p>
    </div>

    <nav class="d-flex flex-column gap-2">
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="{ name: link.name }"
        class="nav-pill"
      >
        <span class="d-inline-flex align-items-center gap-3">
          <AppIcon :name="link.icon" class="nav-pill__icon" />
          <span>{{ link.label }}</span>
        </span>
      </RouterLink>
    </nav>

    <button type="button" class="btn btn-ghost-brand" @click="handleLogout">
      Sair
    </button>
  </div>

  <template v-else>
    <RouterLink
      v-for="link in links"
      :key="link.name"
      :to="{ name: link.name }"
      class="mobile-nav__link"
    >
      <AppIcon :name="link.icon" class="mobile-nav__icon" />
      <span>{{ link.label }}</span>
    </RouterLink>
  </template>
</template>
