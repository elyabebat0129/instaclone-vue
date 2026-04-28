import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { extractErrorMessage } from '@/services/api'
import { createPostComment } from '@/services/comments.service'
import { getFeed } from '@/services/feed.service'
import { likePost, unlikePost } from '@/services/likes.service'
import { createPostRequest } from '@/services/posts.service'
import { defaultAuthor } from '@/utils/profile'

export const useFeedStore = defineStore('feed', () => {
  const postsById = ref({})
  const orderedIds = ref([])
  const nextCursor = ref(null)
  const loading = ref(false)
  const error = ref('')
  const loadingMore = ref(false)

  const items = computed(() => orderedIds.value.map((id) => postsById.value[id]).filter(Boolean))

  function mergePosts(posts) {
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
    return {
      ...comment,
      user: comment.user || defaultAuthor(),
    }
  }

  function syncUserInPosts(user) {
    if (!user?.id) {
      return
    }

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
    if (!cursor) {
      return
    }

    loadingMore.value = true

    try {
      const data = await getFeed({ cursor })
      mergePosts(data.items || data.data || [])
      nextCursor.value = data.next_cursor || null
    } finally {
      loadingMore.value = false
    }
  }

  async function togglePostLike(post) {
    if (!post) {
      return
    }

    const liked = Boolean(post.liked_by_me)
    const previousCount = post.likes_count
    post.liked_by_me = !liked
    post.likes_count += liked ? -1 : 1

    try {
      let response

      if (liked) {
        response = await unlikePost(post.id)
      } else {
        response = await likePost(post.id)
      }

      if (typeof response?.liked === 'boolean') {
        post.liked_by_me = response.liked
      }

      if (typeof response?.likes_count === 'number') {
        post.likes_count = response.likes_count
      }

      if (postsById.value[post.id] && postsById.value[post.id] !== post) {
        postsById.value[post.id].liked_by_me = post.liked_by_me
        postsById.value[post.id].likes_count = post.likes_count
      }
    } catch (error) {
      post.liked_by_me = liked
      post.likes_count = previousCount
      throw error
    }
  }

  async function toggleLike(postId) {
    return togglePostLike(postsById.value[postId])
  }

  async function addComment(postId, body) {
    const data = normalizeComment(await createPostComment(postId, body))
    const post = postsById.value[postId]

    if (post) {
      post.comments_count += 1
    }

    return data
  }

  async function createPost(formData) {
    const data = await createPostRequest(formData)

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
    togglePostLike,
    toggleLike,
    normalizeComment,
    addComment,
    createPost,
  }
})
