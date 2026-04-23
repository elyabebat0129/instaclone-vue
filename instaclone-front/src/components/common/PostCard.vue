<script setup>
import { computed, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { formatRelativeTime } from '@/services/formatters'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  commentState: {
    type: Object,
    default: () => ({ body: '', loading: false, error: '' }),
  },
  likeLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-like', 'submit-comment', 'update-comment'])

const fallbackState = reactive({
  body: '',
  loading: false,
  error: '',
})

const state = computed(() => props.commentState || fallbackState)
const profileTarget = computed(() => `/perfil?user=${props.post.user?.username || ''}`)
const relativeTime = computed(() => formatRelativeTime(props.post.created_at))

function handleCommentSubmit() {
  emit('submit-comment', props.post.id)
}
</script>

<template>
  <article class="surface-card post-card">
    <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
      <RouterLink :to="profileTarget" class="d-flex align-items-center gap-3">
        <img
          :src="post.user?.avatar_url || 'https://placehold.co/64x64/f4ddcf/2d241a?text=%40'"
          :alt="post.user?.username || 'avatar'"
          class="post-card__avatar"
        />
        <div>
          <div class="fw-semibold">@{{ post.user?.username || 'usuario' }}</div>
          <div class="small muted-copy">{{ relativeTime }}</div>
        </div>
      </RouterLink>

      <div class="small muted-copy">
        {{ post.comments_count }} comentario(s)
      </div>
    </div>

    <RouterLink :to="`/posts/${post.id}`" class="d-block mb-3">
      <img :src="post.image_url" alt="Post" class="post-card__image" />
    </RouterLink>

    <div class="post-card__actions mb-3">
      <button
        type="button"
        class="post-action-btn"
        :disabled="likeLoading"
        @click="$emit('toggle-like', post.id)"
      >
        <i :class="['bi', post.liked_by_me ? 'bi-heart-fill' : 'bi-heart']"></i>
      </button>
      <RouterLink :to="`/posts/${post.id}`" class="post-action-btn">
        <i class="bi bi-chat"></i>
      </RouterLink>
      <RouterLink :to="profileTarget" class="post-action-btn ms-auto">
        <i class="bi bi-person"></i>
      </RouterLink>
    </div>

    <div class="mb-3">
      <div class="fw-semibold">{{ post.likes_count }} curtidas</div>
      <p class="mb-0 mt-2">
        <strong>@{{ post.user?.username || 'usuario' }}</strong>
        {{ post.caption || 'Sem legenda.' }}
      </p>
    </div>

    <form class="d-flex flex-column gap-2" @submit.prevent="handleCommentSubmit">
      <textarea
        :value="state.body"
        class="form-control"
        rows="2"
        maxlength="2200"
        placeholder="Adicione um comentario..."
        @input="$emit('update-comment', post.id, $event.target.value)"
      ></textarea>

      <div class="d-flex justify-content-between align-items-center gap-3">
        <div v-if="state.error" class="small text-danger">
          {{ state.error }}
        </div>
        <div v-else class="small muted-copy">
          Comente sem sair do feed.
        </div>

        <button type="submit" class="btn btn-sm btn-brand" :disabled="state.loading">
          {{ state.loading ? 'Enviando...' : 'Comentar' }}
        </button>
      </div>
    </form>
  </article>
</template>
