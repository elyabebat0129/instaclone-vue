<script setup>
import { RouterLink } from 'vue-router'
import { ROUTE_NAMES } from '@/router/routeNames'
import { defaultAuthor } from '@/utils/profile'

defineProps({
  profile: {
    type: Object,
    required: true,
  },
  isOwnProfile: {
    type: Boolean,
    default: false,
  },
  isFollowing: {
    type: Boolean,
    default: false,
  },
  busy: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle-follow'])
</script>

<template>
  <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
    <div>
      <div class="brand-wordmark muted-copy small">Perfil</div>
      <h1 class="h2 mb-1">{{ profile.name }}</h1>
      <div class="muted-copy">@{{ profile.username }}</div>
    </div>

    <div class="d-flex gap-2">
      <RouterLink
        v-if="isOwnProfile"
        :to="{ name: ROUTE_NAMES.profileEdit }"
        class="btn btn-brand"
      >
        Editar perfil
      </RouterLink>
      <button
        v-else
        type="button"
        class="btn"
        :class="isFollowing ? 'btn-ghost-brand' : 'btn-brand'"
        :disabled="busy"
        @click="$emit('toggle-follow')"
      >
        {{ busy ? 'Atualizando...' : isFollowing ? 'Seguindo' : 'Seguir' }}
      </button>
    </div>
  </div>
</template>
