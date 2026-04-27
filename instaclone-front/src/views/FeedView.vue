<script setup>
import { onMounted, reactive, ref } from 'vue'
import PostCard from '@/components/common/PostCard.vue'
import { extractErrorMessage } from '@/services/formatters'
import { useFeedStore } from '@/stores/feed'

const feedStore = useFeedStore()
const commentForms = reactive({})
const likeLoadingByPost = reactive({})
const pageError = ref('')

function ensureCommentState(postId) {
  // Cada post do feed guarda seu proprio estado de comentario inline.
  if (!commentForms[postId]) {
    commentForms[postId] = {
      body: '',
      loading: false,
      error: '',
    }
  }

  return commentForms[postId]
}

onMounted(() => {
  // Sempre recarregamos ao entrar no feed para manter a lista consistente.
  feedStore.fetchFeed().catch((error) => {
    pageError.value = extractErrorMessage(error, 'Nao foi possivel carregar o feed.')
  })
})

function updateComment(postId, value) {
  const state = ensureCommentState(postId)
  state.body = value
  state.error = ''
}

async function submitComment(postId) {
  const state = ensureCommentState(postId)

  if (!state.body.trim()) {
    state.error = 'Escreva um comentario antes de enviar.'
    return
  }

  state.loading = true
  state.error = ''

  try {
    await feedStore.addComment(postId, state.body.trim())
    state.body = ''
  } catch (error) {
    state.error = extractErrorMessage(error, 'Nao foi possivel comentar.')
  } finally {
    state.loading = false
  }
}

async function toggleLike(postId) {
  likeLoadingByPost[postId] = true

  try {
    await feedStore.toggleLike(postId)
  } catch (error) {
    pageError.value = extractErrorMessage(error, 'Nao foi possivel atualizar a curtida.')
  } finally {
    likeLoadingByPost[postId] = false
  }
}

async function loadMore() {
  try {
    await feedStore.loadMoreFeed()
  } catch (error) {
    pageError.value = extractErrorMessage(error, 'Nao foi possivel carregar mais posts.')
  }
}
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <h1>Feed</h1>
      </div>
    </div>

    <div v-if="pageError || feedStore.error" class="alert alert-danger">
      {{ pageError || feedStore.error }}
    </div>

    <div v-if="feedStore.loading" class="surface-card">
      <div class="muted-copy">Carregando feed...</div>
    </div>

    <div v-else-if="feedStore.items.length" class="d-flex flex-column gap-4">
      <PostCard
        v-for="post in feedStore.items"
        :key="post.id"
        :post="post"
        :comment-state="commentForms[post.id]"
        :like-loading="Boolean(likeLoadingByPost[post.id])"
        @toggle-like="toggleLike"
        @submit-comment="submitComment"
        @update-comment="updateComment"
      />

      <div class="surface-card toolbar-card">
        <div class="muted-copy">
          {{ feedStore.nextCursor ? 'Ainda ha mais posts para carregar.' : 'Voce chegou ao fim do feed.' }}
        </div>
        <button
          v-if="feedStore.nextCursor"
          type="button"
          class="btn btn-brand"
          :disabled="feedStore.loadingMore"
          @click="loadMore"
        >
          {{ feedStore.loadingMore ? 'Carregando...' : 'Carregar mais' }}
        </button>
      </div>
    </div>

    <div v-else class="surface-card">
      <div class="empty-state">
        Nenhum post no feed ainda. Isso pode acontecer se a conta nao seguir ninguem.
      </div>
    </div>
  </div>
</template>
