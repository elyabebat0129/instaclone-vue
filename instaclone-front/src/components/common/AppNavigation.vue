<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const links = [
  { label: 'Home', to: '/feed', icon: 'bi-house-door' },
  { label: 'Buscar', to: '/descobrir', icon: 'bi-search' },
  { label: 'Criar', to: '/criar', icon: 'bi-plus-square' },
  { label: 'Perfil', to: '/perfil', icon: 'bi-person-circle' },
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
  router.push('/login')
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
        :key="link.to"
        :to="link.to"
        class="nav-pill"
      >
        <span class="d-inline-flex align-items-center gap-3">
          <i :class="['bi', link.icon, 'nav-pill__icon']"></i>
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
      :key="link.to"
      :to="link.to"
      class="mobile-nav__link"
    >
      <i :class="['bi', link.icon, 'mobile-nav__icon']"></i>
      <span>{{ link.label }}</span>
    </RouterLink>
  </template>
</template>
