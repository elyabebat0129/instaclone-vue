import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import { extractErrorMessage } from '@/services/formatters'

export const useFeedStore = defineStore('feed', () => {
  const postsById = ref({})
  const orderedIds = ref([])
  const nextCursor = ref(null)
  const loading = ref(false)
  const error = ref('')
  const loadingMore = ref(false)

  // A lista final do feed e montada a partir da ordem + dicionario por id.
  const items = computed(() => orderedIds.value.map((id) => postsById.value[id]).filter(Boolean))

  function mergePosts(posts) {
    for (const post of posts) {
      postsById.value[post.id] = post

      if (!orderedIds.value.includes(post.id)) {
        orderedIds.value.push(post.id)
      }
    }
  }

  function syncUserInPosts(user) {
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
    postsById.value = {}
    orderedIds.value = []
    nextCursor.value = null
    loading.value = false
    loadingMore.value = false
    error.value = ''
  }

  async function fetchFeed() {
    loading.value = true
    error.value = ''

    try {
      const { data } = await api.get('/feed')
      resetFeed()
      mergePosts(data.data || [])
      nextCursor.value = data.next_cursor || null
    } catch (incomingError) {
      error.value = extractErrorMessage(incomingError, 'Nao foi possivel carregar o feed.')
      throw incomingError
    } finally {
      loading.value = false
    }
  }

  async function loadMoreFeed(cursor = nextCursor.value) {
    if (!cursor) {
      return
    }

    // Cursor pagination: a API entrega o ponteiro da proxima "janela" de posts.
    loadingMore.value = true

    try {
      const { data } = await api.get('/feed', {
        params: {
          cursor,
        },
      })

      mergePosts(data.data || [])
      nextCursor.value = data.next_cursor || null
    } finally {
      loadingMore.value = false
    }
  }

  async function toggleLike(postId) {
    const post = postsById.value[postId]

    if (!post) {
      return
    }

    const liked = Boolean(post.liked_by_me)
    post.liked_by_me = !liked
    post.likes_count += liked ? -1 : 1

    try {
      // Atualizacao otimista: a interface responde antes da confirmacao da API.
      if (liked) {
        await api.delete(`/posts/${postId}/unlike`)
      } else {
        await api.post(`/posts/${postId}/like`)
      }
    } catch (error) {
      post.liked_by_me = liked
      post.likes_count += liked ? 1 : -1
      throw error
    }
  }

  async function addComment(postId, body) {
    const { data } = await api.post(`/posts/${postId}/comments`, { body })
    const post = postsById.value[postId]

    if (post) {
      post.comments_count += 1
    }

    return data
  }

  async function createPost(formData) {
    const { data } = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

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
    addComment,
    createPost,
  }
})
