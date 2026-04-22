<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const destination = computed(() => (authStore.isAuthenticated ? '/feed' : '/login'))
</script>

<template>
  <div class="auth-card text-center">
    <div class="brand-wordmark muted-copy small mb-3">404</div>
    <h1 class="h2 mb-3">Pagina nao encontrada</h1>
    <p class="muted-copy mb-4">
      A rota que voce tentou abrir nao existe ou ainda nao foi implementada.
    </p>
    <RouterLink :to="destination" class="btn btn-brand">
      Voltar
    </RouterLink>
  </div>
</template>
