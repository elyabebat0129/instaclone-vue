<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ROUTE_NAMES } from '@/router/routeNames'
import { defaultAuthor } from '@/utils/profile'

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
  stacked: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-follow'])

const profileTarget = computed(() => {
  if (props.isSelf) {
    return { name: ROUTE_NAMES.profile }
  }

  return {
    name: ROUTE_NAMES.profile,
    query: { user: props.user.username || '' },
  }
})

const author = computed(() => defaultAuthor(props.user))
</script>

<template>
  <article
    class="surface-card account-card"
    :class="[
      stacked ? 'h-100 d-flex flex-column gap-3' : 'd-flex justify-content-between align-items-center gap-3',
      compact ? 'account-card--compact' : '',
    ]"
  >
    <RouterLink :to="profileTarget" class="account-card__identity d-flex align-items-center gap-3">
      <img
        :src="author.avatar_url"
        :alt="author.username"
        class="suggestion-card__avatar"
      />
      <div class="account-card__text">
        <div class="account-card__name fw-semibold">{{ author.name }}</div>
        <div class="account-card__username muted-copy small">@{{ author.username }}</div>
      </div>
    </RouterLink>

    <template v-if="stacked">
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
    </template>

    <button
      v-else
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
