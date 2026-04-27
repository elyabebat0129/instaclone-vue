import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { extractErrorMessage } from '@/services/api'
import { createPostComment } from '@/services/comments.service'
import { getFeed } from '@/services/feed.service'
import { likePost, unlikePost } from '@/services/likes.service'
import { createPostRequest } from '@/services/posts.service'
import { defaultAuthor } from '@/stores/profileUtils'

export const useFeedStore = defineStore('feed', () => {
  // postsById facilita atualizar um post especifico; orderedIds preserva a ordem do feed.
  const postsById = ref({})
  const orderedIds = ref([])
  const nextCursor = ref(null)
  const loading = ref(false)
  const error = ref('')
  const loadingMore = ref(false)

  // A lista final do feed e montada a partir da ordem + dicionario por id.
  const items = computed(() => orderedIds.value.map((id) => postsById.value[id]).filter(Boolean))

  function mergePosts(posts) {
    // Mescla posts novos com os ja carregados sem duplicar ids.
    for (const post of posts) {
      postsById.value[post.id] = {
        ...post,
        user: post.user || defaultAuthor(),
      }

      if (!orderedIds.value.includes(post.id)) {
        orderedIds.value.push(post.id)
      }
    }
  }

  function normalizeComment(comment) {
    // Garante que comentario sempre tenha autor, mesmo se a API nao mandar completo.
    return {
      ...comment,
      user: comment.user || defaultAuthor(),
    }
  }

  function syncUserInPosts(user) {
    // Quando o usuario edita perfil/avatar, os posts ja carregados tambem precisam refletir.
    if (!user?.id) {
      return
    }

    // Atualiza avatar/nome/username nos posts ja carregados do mesmo autor.
    for (const postId of orderedIds.value) {
      const post = postsById.value[postId]

      if (post?.user?.id === user.id) {
        post.user = {
          ...post.user,
          ...user,
        }
      }
    }
  }

  function resetFeed() {
    // Limpa o estado local do feed, usado no logout ou antes de recarregar tudo.
    postsById.value = {}
    orderedIds.value = []
    nextCursor.value = null
    loading.value = false
    loadingMore.value = false
    error.value = ''
  }

  async function fetchFeed() {
    // Carrega a primeira pagina do feed e substitui o estado antigo.
    loading.value = true
    error.value = ''

    try {
      const data = await getFeed()
      resetFeed()
      mergePosts(data.items || data.data || [])
      nextCursor.value = data.next_cursor || null
    } catch (incomingError) {
      error.value = extractErrorMessage(incomingError, 'Nao foi possivel carregar o feed.')
      throw incomingError
    } finally {
      loading.value = false
    }
  }

  async function loadMoreFeed(cursor = nextCursor.value) {
    // Carrega a proxima pagina usando o cursor retornado pela API.
    if (!cursor) {
      return
    }

    // Cursor pagination: a API entrega o ponteiro da proxima "janela" de posts.
    loadingMore.value = true

    try {
      const data = await getFeed({ cursor })
      mergePosts(data.items || data.data || [])
      nextCursor.value = data.next_cursor || null
    } finally {
      loadingMore.value = false
    }
  }

  async function toggleLike(postId) {
    // A curtida altera um post especifico que ja esta salvo no dicionario.
    const post = postsById.value[postId]

    if (!post) {
      return
    }

    const liked = Boolean(post.liked_by_me)
    post.liked_by_me = !liked
    post.likes_count += liked ? -1 : 1

    try {
      // Atualizacao otimista: a interface responde antes da confirmacao da API.
      let response

      if (liked) {
        response = await unlikePost(postId)
      } else {
        response = await likePost(postId)
      }

      if (typeof response?.liked === 'boolean') {
        post.liked_by_me = response.liked
      }

      if (typeof response?.likes_count === 'number') {
        post.likes_count = response.likes_count
      }
    } catch (error) {
      // Se a API falhar, desfazemos a mudanca visual para manter o estado correto.
      post.liked_by_me = liked
      post.likes_count += liked ? 1 : -1
      throw error
    }
  }

  async function addComment(postId, body) {
    // A API cria o comentario; localmente atualizamos apenas o contador do post.
    const data = normalizeComment(await createPostComment(postId, body))
    const post = postsById.value[postId]

    if (post) {
      post.comments_count += 1
    }

    return data
  }

  async function createPost(formData) {
    // Criacao usa FormData porque envolve upload de imagem.
    const data = await createPostRequest(formData)

    // O novo post entra no topo do feed local sem precisar recarregar tudo.
    postsById.value[data.id] = data
    orderedIds.value.unshift(data.id)

    return data
  }

  return {
    postsById,
    orderedIds,
    items,
    nextCursor,
    loading,
    loadingMore,
    error,
    syncUserInPosts,
    resetFeed,
    fetchFeed,
    loadMoreFeed,
    toggleLike,
    normalizeComment,
    addComment,
    createPost,
  }
})
