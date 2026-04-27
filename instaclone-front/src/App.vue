<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'

const route = useRoute()

const layoutComponent = computed(() => {
  // O layout muda conforme a rota atual. Login/cadastro ficam sem a estrutura
  // da area logada; o restante usa navegacao, sidebar e conteudo principal.
  return route.meta.layout === 'auth' ? AuthLayout : AppLayout
})
</script>

<template>
  <component :is="layoutComponent">
    <!-- RouterView injeta aqui a view da rota atual, como FeedView ou LoginView. -->
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </component>
</template>
