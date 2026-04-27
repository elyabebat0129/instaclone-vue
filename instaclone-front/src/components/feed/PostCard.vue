<script setup>
import { computed, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/layout/AppIcon.vue'
import { ROUTE_NAMES } from '@/router/routeNames'
import { defaultAuthor } from '@/stores/profileUtils'
import { formatRelative } from '@/utils/dates'

const props = defineProps({
  // Props sao dados recebidos da view pai, neste caso a FeedView.
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

// O card nao altera a store diretamente; ele emite eventos para a tela pai decidir.
const emit = defineEmits(['toggle-like', 'submit-comment', 'update-comment'])

const fallbackState = reactive({
  body: '',
  loading: false,
  error: '',
})

// computed deixa estes valores atualizados sempre que props mudarem.
const state = computed(() => props.commentState || fallbackState)
const author = computed(() => defaultAuthor(props.post.user))
const profileTarget = computed(() => ({
  name: ROUTE_NAMES.profile,
  query: { user: author.value.username },
}))

function handleCommentSubmit() {
  // Envia apenas o id do post; a FeedView conhece o estado do formulario.
  emit('submit-comment', props.post.id)
}
</script>

<template>
  <article class="surface-card post-card">
    <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
      <RouterLink :to="profileTarget" class="d-flex align-items-center gap-3">
        <img
          :src="author.avatar_url"
          :alt="author.username"
          class="post-card__avatar"
        />
        <div>
          <div class="fw-semibold">@{{ author.username }}</div>
          <div class="small muted-copy">{{ formatRelative(post.created_at) }}</div>
        </div>
      </RouterLink>

      <div class="small muted-copy">
        {{ post.comments_count }} comentario(s)
      </div>
    </div>

    <RouterLink :to="{ name: ROUTE_NAMES.postDetails, params: { postId: post.id } }" class="d-block mb-3">
      <img :src="post.image_url" alt="Post" class="post-card__image" />
    </RouterLink>

    <div class="post-card__actions mb-3">
      <!-- Clique no botao avisa o pai para curtir/descurtir. -->
      <button
        type="button"
        class="post-action-btn"
        :disabled="likeLoading"
        @click="$emit('toggle-like', post.id)"
      >
        <AppIcon name="heart" :filled="Boolean(post.liked_by_me)" />
      </button>
      <RouterLink :to="{ name: ROUTE_NAMES.postDetails, params: { postId: post.id } }" class="post-action-btn">
        <AppIcon name="chat" />
      </RouterLink>
      <RouterLink :to="profileTarget" class="post-action-btn ms-auto">
        <AppIcon name="person" />
      </RouterLink>
    </div>

    <div class="mb-3">
      <div class="fw-semibold">{{ post.likes_count }} curtidas</div>
      <p class="mb-0 mt-2">
        <strong>@{{ author.username }}</strong>
        {{ post.caption || 'Sem legenda.' }}
      </p>
    </div>

    <form class="d-flex flex-column gap-2" @submit.prevent="handleCommentSubmit">
      <!-- O textarea recebe valor via prop e avisa mudancas por evento. -->
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
