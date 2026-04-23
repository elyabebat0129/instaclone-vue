<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  isSelf: {
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

const emit = defineEmits(['toggle-follow'])

const target = computed(() => (props.isSelf ? '/perfil' : `/perfil?user=${props.user.username || ''}`))
</script>

<template>
  <article class="surface-card d-flex justify-content-between align-items-center gap-3">
    <RouterLink :to="target" class="d-flex align-items-center gap-3">
      <img
        :src="user.avatar_url || 'https://placehold.co/72x72/f4ddcf/2d241a?text=%40'"
        :alt="user.username || 'perfil'"
        class="suggestion-card__avatar"
      />
      <div>
        <div class="fw-semibold">{{ user.name }}</div>
        <div class="muted-copy small">@{{ user.username }}</div>
      </div>
    </RouterLink>

    <button
      type="button"
      class="btn"
      :class="isFollowing ? 'btn-ghost-brand' : 'btn-brand'"
      :disabled="busy || isSelf"
      @click="$emit('toggle-follow', user)"
    >
      <span v-if="isSelf">Voce</span>
      <span v-else-if="busy">...</span>
      <span v-else>{{ isFollowing ? 'Seguindo' : 'Seguir' }}</span>
    </button>
  </article>
</template>
