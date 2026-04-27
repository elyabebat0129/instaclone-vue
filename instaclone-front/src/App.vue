<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'

const route = useRoute()

const layoutComponent = computed(() => {
  // Rotas de auth usam um layout mais simples; o restante usa a area autenticada.
  return route.meta.layout === 'auth' ? AuthLayout : AppLayout
})
</script>

<template>
  <component :is="layoutComponent">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </component>
</template>
