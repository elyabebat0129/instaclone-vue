import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useFeedStore = defineStore('feed', () => {
  const postsById = ref({})
  const orderedIds = ref([])
  const nextCursor = ref(null)
  const loading = ref(false)

  const items = computed(() => orderedIds.value.map((id) => postsById.value[id]).filter(Boolean))

  function mergePosts(posts) {
    for (const post of posts) {
      postsById.value[post.id] = post

      if (!orderedIds.value.includes(post.id)) {
        orderedIds.value.push(post.id)
      }
    }
  }

  async function fetchFeed() {
    loading.value = true

    try {
      const { data } = await api.get('/feed')
      postsById.value = {}
      orderedIds.value = []
      mergePosts(data.data || [])
      nextCursor.value = data.next_cursor || null
    } finally {
      loading.value = false
    }
  }

  async function loadMoreFeed(cursor = nextCursor.value) {
    if (!cursor) {
      return
    }

    const { data } = await api.get('/feed', {
      params: {
        cursor,
      },
    })

    mergePosts(data.data || [])
    nextCursor.value = data.next_cursor || null
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
    fetchFeed,
    loadMoreFeed,
    toggleLike,
    addComment,
    createPost,
  }
})
