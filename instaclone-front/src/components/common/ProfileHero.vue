<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  profile: {
    type: Object,
    required: true,
  },
  postsCount: {
    type: Number,
    default: 0,
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
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

const emit = defineEmits(['toggle-follow'])

const querySuffix = computed(() => {
  if (props.isOwnProfile || !props.profile?.username) {
    return ''
  }

  return `?user=${props.profile.username}`
})
</script>

<template>
  <section class="surface-card">
    <div class="row g-4 align-items-center">
      <div class="col-md-auto">
        <img
          :src="profile.avatar_url || 'https://placehold.co/160x160/f4ddcf/2d241a?text=%40'"
          :alt="profile.username || 'perfil'"
          class="profile-hero__avatar"
        />
      </div>

      <div class="col">
        <div class="d-flex flex-column gap-3">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
              <div class="brand-wordmark muted-copy small">Perfil</div>
              <h1 class="h2 mb-1">{{ profile.name }}</h1>
              <div class="muted-copy">@{{ profile.username }}</div>
            </div>

            <div class="d-flex gap-2">
              <RouterLink
                v-if="isOwnProfile"
                to="/perfil/editar"
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

          <p class="mb-0">{{ profile.bio || 'Este perfil ainda nao adicionou uma bio.' }}</p>

          <div class="d-flex flex-wrap gap-3">
            <div class="surface-chip"><strong>{{ postsCount }}</strong> posts</div>
            <RouterLink :to="`/perfil/lista/seguidores${querySuffix}`" class="surface-chip">
              <strong>{{ followersCount }}</strong> seguidores
            </RouterLink>
            <RouterLink :to="`/perfil/lista/seguindo${querySuffix}`" class="surface-chip">
              <strong>{{ followingCount }}</strong> seguindo
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
