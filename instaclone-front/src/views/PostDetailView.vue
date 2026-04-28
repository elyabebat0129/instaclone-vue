<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { usePagination } from '@/composables/usePagination'
import AppIcon from '@/components/layout/AppIcon.vue'
import PostCommentForm from '@/components/feed/PostCommentForm.vue'
import PostCommentList from '@/components/feed/PostCommentList.vue'
import { ROUTE_NAMES } from '@/router/routeNames'
import { extractErrorMessage } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { createPostComment, deleteComment, getPostComments } from '@/services/comments.service'
import { useFeedStore } from '@/stores/feed'
import { deletePost, getPostById } from '@/services/posts.service'
import { defaultAuthor } from '@/utils/profile'
import { formatRelative } from '@/utils/dates'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const feedStore = useFeedStore()

const post = ref(null)
const comments = ref([])
const loading = ref(false)
const likeLoading = ref(false)
const commentsLoading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const commentForm = reactive({
  body: '',
  loading: false,
  error: '',
})
const { pagination, canGoNext, setPagination } = usePagination()

const postId = computed(() => route.params.postId)
const isOwner = computed(() => post.value?.user_id === authStore.user?.id)
const author = computed(() => defaultAuthor(post.value?.user))

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
    const data = await getPostComments(postId.value, {
      page,
      per_page: 10,
    })

    comments.value = append ? [...comments.value, ...(data.data || [])] : data.data || []
    setPagination(data, page)
  } finally {
    commentsLoading.value = false
    loadingMore.value = false
  }
}

async function loadPost() {
  loading.value = true
  error.value = ''

  try {
    const data = await getPostById(postId.value)
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

  likeLoading.value = true

  try {
    await feedStore.togglePostLike(post.value)
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel atualizar a curtida.')
  } finally {
    likeLoading.value = false
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
    const data = await createPostComment(postId.value, commentForm.body.trim())
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
    await deleteComment(commentId)
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
    await deletePost(postId.value)
    router.push({ name: ROUTE_NAMES.feed })
  } catch (incomingError) {
    error.value = extractErrorMessage(incomingError, 'Nao foi possivel excluir o post.')
  }
}

onMounted(() => {
  loadPost().catch(() => {})
})

watch(() => route.params.postId, () => {
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
            <RouterLink :to="{ name: ROUTE_NAMES.profile, query: { user: author.username } }" class="d-flex align-items-center gap-3">
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

            <button v-if="isOwner" type="button" class="btn btn-outline-danger btn-sm" @click="removePost">
              Excluir
            </button>
          </div>

          <div class="post-detail-shell__body">
            <div class="mb-3">
              <p class="mb-0">
                <strong>@{{ author.username }}</strong>
                {{ post.caption || 'Sem legenda.' }}
              </p>
            </div>

            <div class="d-flex flex-column gap-3">
              <div v-if="commentsLoading" class="muted-copy">Carregando comentarios...</div>
              <PostCommentList
                v-else
                :comments="comments"
                :current-user-id="authStore.user?.id"
                @delete="removeComment"
              />
            </div>
          </div>

          <div class="post-detail-shell__footer">
            <div class="post-card__actions mb-2">
              <button type="button" class="post-action-btn" :disabled="likeLoading" @click="toggleLike">
                <AppIcon name="heart" :filled="Boolean(post.liked_by_me)" />
              </button>
              <button type="button" class="post-action-btn">
                <AppIcon name="chat" />
              </button>
            </div>

            <div class="fw-semibold">{{ post.likes_count }} curtidas</div>
            <div class="muted-copy small mb-3">
              {{ post.comments_count }} comentarios
            </div>

            <PostCommentForm
              v-model="commentForm.body"
              :error="commentForm.error"
              :loading="commentForm.loading"
              @submit="submitComment"
            />

            <div v-if="canGoNext" class="d-flex justify-content-end mt-3">
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
