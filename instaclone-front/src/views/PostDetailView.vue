<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { extractErrorMessage, formatRelativeTime } from '@/services/formatters'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useFeedStore } from '@/stores/feed'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const feedStore = useFeedStore()

const post = ref(null)
const comments = ref([])
const loading = ref(false)
const commentsLoading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const commentForm = reactive({
  body: '',
  loading: false,
  error: '',
})
const pagination = reactive({
  currentPage: 1,
  lastPage: 1,
})

const postId = computed(() => route.params.postId)
const isOwner = computed(() => post.value?.user_id === authStore.user?.id)

async function loadComments(page = 1, append = false) {
  if (!postId.value) {
    return
  }

  if (append) {
    loadingMore.value = true
  } else {
    commentsLoading.value = true
  }

  try {
    // Quando append=true, acumulamos a proxima pagina abaixo da lista atual.
    const { data } = await api.get(`/posts/${postId.value}/comments`, {
      params: { page, per_page: 10 },
    })

    comments.value = append ? [...comments.value, ...(data.data || [])] : data.data || []
    pagination.currentPage = data.current_page || page
    pagination.lastPage = data.last_page || 1
  } finally {
    commentsLoading.value = false
    loadingMore.value = false
  }
}

async function loadPost() {
  loading.value = true
  error.value = ''

  try {
    // O detalhe do post e os comentarios sao carregados separadamente.
    const { data } = await api.get(`/posts/${postId.value}`)
    post.value = data
    await loadComments()
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel carregar este post.')
  } finally {
    loading.value = false
  }
}

async function toggleLike() {
  if (!post.value) {
    return
  }

  try {
    // Reaproveita a mesma acao de like usada pelo feed.
    await feedStore.toggleLike(post.value.id)
    const { data } = await api.get(`/posts/${post.value.id}`)
    post.value = data
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel atualizar a curtida.')
  }
}

async function submitComment() {
  commentForm.error = ''

  if (!commentForm.body.trim()) {
    commentForm.error = 'Escreva um comentario antes de enviar.'
    return
  }

  commentForm.loading = true

  try {
    // Comentario novo entra no topo da lista para resposta imediata na UI.
    const { data } = await api.post(`/posts/${postId.value}/comments`, {
      body: commentForm.body.trim(),
    })

    comments.value.unshift(data)
    commentForm.body = ''

    if (post.value) {
      post.value.comments_count += 1
    }
  } catch (incomingError) {
    commentForm.error = extractErrorMessage(incomingError, 'Nao foi possivel enviar o comentario.')
  } finally {
    commentForm.loading = false
  }
}

async function removeComment(commentId) {
  try {
    await api.delete(`/comments/${commentId}`)
    comments.value = comments.value.filter((comment) => comment.id !== commentId)

    if (post.value) {
      post.value.comments_count = Math.max(0, post.value.comments_count - 1)
    }
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel excluir o comentario.')
  }
}

async function removePost() {
  try {
    await api.delete(`/posts/${postId.value}`)
    // Depois de excluir o post, retornamos ao feed.
    router.push('/feed')
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel excluir o post.')
  }
}

onMounted(() => {
  loadPost().catch(() => {})
})

watch(() => route.params.postId, () => {
  // Se a rota mudar para outro post, recarregamos o conteudo.
  loadPost().catch(() => {})
})
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <h1>Detalhes do Post</h1>
        <p>Veja o post completo, acompanhe a conversa e participe com comentarios.</p>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="loading" class="surface-card">
      <div class="muted-copy">Carregando post...</div>
    </div>

    <div v-else-if="post" class="d-flex flex-column gap-4">
      <section class="surface-card post-detail-shell p-0 overflow-hidden">
        <div class="post-detail-shell__media">
          <img :src="post.image_url" alt="Post" class="post-detail-shell__image" />
        </div>

        <div class="post-detail-shell__side">
          <div class="post-detail-shell__header">
            <RouterLink :to="`/perfil?user=${post.user?.username || ''}`" class="d-flex align-items-center gap-3">
              <img
                :src="post.user?.avatar_url || 'https://placehold.co/64x64/f4ddcf/2d241a?text=%40'"
                :alt="post.user?.username || 'perfil'"
                class="post-card__avatar"
              />
              <div>
                <div class="fw-semibold">@{{ post.user?.username }}</div>
                <div class="small muted-copy">{{ formatRelativeTime(post.created_at) }}</div>
              </div>
            </RouterLink>

            <button v-if="isOwner" type="button" class="btn btn-outline-danger btn-sm" @click="removePost">
              Excluir
            </button>
          </div>

          <div class="post-detail-shell__body">
            <div class="mb-3">
              <p class="mb-0">
                <strong>@{{ post.user?.username }}</strong>
                {{ post.caption || 'Sem legenda.' }}
              </p>
            </div>

            <div class="d-flex flex-column gap-3">
              <div v-if="commentsLoading" class="muted-copy">Carregando comentarios...</div>

              <div v-else-if="comments.length" class="d-flex flex-column gap-3">
                <article
                  v-for="comment in comments"
                  :key="comment.id"
                  class="post-comment-card"
                >
                  <div class="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <div class="fw-semibold">@{{ comment.user?.username }}</div>
                      <div class="small muted-copy">{{ formatRelativeTime(comment.created_at) }}</div>
                    </div>
                    <button
                      v-if="comment.user_id === authStore.user?.id"
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="removeComment(comment.id)"
                    >
                      Excluir
                    </button>
                  </div>
                  <p class="mb-0 mt-2">{{ comment.body }}</p>
                </article>
              </div>

              <div v-else class="empty-state py-4">
                Nenhum comentario ainda. Seja a primeira pessoa a comentar.
              </div>
            </div>
          </div>

          <div class="post-detail-shell__footer">
            <div class="post-card__actions mb-2">
              <button type="button" class="post-action-btn" @click="toggleLike">
                <i :class="['bi', post.liked_by_me ? 'bi-heart-fill' : 'bi-heart']"></i>
              </button>
              <button type="button" class="post-action-btn">
                <i class="bi bi-chat"></i>
              </button>
            </div>

            <div class="fw-semibold">{{ post.likes_count }} curtidas</div>
            <div class="muted-copy small mb-3">
              {{ post.comments_count }} comentarios
            </div>

            <form class="d-flex flex-column gap-2" @submit.prevent="submitComment">
              <textarea
                v-model="commentForm.body"
                class="form-control"
                rows="3"
                maxlength="2200"
                placeholder="Adicione um comentario..."
              ></textarea>
              <div class="d-flex justify-content-between align-items-center gap-3">
                <div v-if="commentForm.error" class="small text-danger">{{ commentForm.error }}</div>
                <div v-else class="small muted-copy">Converse com quem tambem viu este post.</div>
                <button type="submit" class="btn btn-brand" :disabled="commentForm.loading">
                  {{ commentForm.loading ? 'Enviando...' : 'Comentar' }}
                </button>
              </div>
            </form>

            <div v-if="pagination.currentPage < pagination.lastPage" class="d-flex justify-content-end mt-3">
              <button
                type="button"
                class="btn btn-ghost-brand"
                :disabled="loadingMore"
                @click="loadComments(pagination.currentPage + 1, true)"
              >
                {{ loadingMore ? 'Carregando...' : 'Carregar mais' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
