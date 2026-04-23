<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  isFollowing: {
    type: Boolean,
    default: false,
  },
  busy: {
    type: Boolean,
    default: false,
  },
  isSelf: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-follow'])

const profileTarget = computed(() => {
  if (props.isSelf) {
    return '/perfil'
  }

  return `/perfil?user=${props.user.username || ''}`
})
</script>

<template>
  <article class="surface-card h-100 d-flex flex-column gap-3">
    <RouterLink :to="profileTarget" class="d-flex align-items-center gap-3">
      <img
        :src="user.avatar_url || 'https://placehold.co/80x80/f4ddcf/2d241a?text=%40'"
        :alt="user.username || 'usuario'"
        class="suggestion-card__avatar"
      />
      <div>
        <div class="fw-semibold">{{ user.name }}</div>
        <div class="muted-copy small">@{{ user.username }}</div>
      </div>
    </RouterLink>

    <p class="muted-copy small mb-0 flex-grow-1">
      {{ user.bio || 'Este perfil ainda nao adicionou uma bio.' }}
    </p>

    <div class="d-flex gap-2">
      <RouterLink :to="profileTarget" class="btn btn-ghost-brand flex-fill">
        Ver perfil
      </RouterLink>
      <button
        type="button"
        class="btn flex-fill"
        :class="isFollowing ? 'btn-ghost-brand' : 'btn-brand'"
        :disabled="busy || isSelf"
        @click="$emit('toggle-follow', user)"
      >
        <span v-if="isSelf">Voce</span>
        <span v-else-if="busy">...</span>
        <span v-else>{{ isFollowing ? 'Seguindo' : 'Seguir' }}</span>
      </button>
    </div>
  </article>
</template>
