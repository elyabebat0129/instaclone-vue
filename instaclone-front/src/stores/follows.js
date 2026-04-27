import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { followUser, getUserFollowing, unfollowUser } from '@/services/follows.service'

export const useFollowsStore = defineStore('follows', () => {
  const followingIds = ref(new Set())
  const pendingIds = ref(new Set())

  const followingList = computed(() => Array.from(followingIds.value))

  function replaceFollowingIds(ids) {
    followingIds.value = new Set(ids)
  }

  function isFollowing(userId) {
    return followingIds.value.has(userId)
  }

  function isPending(userId) {
    return pendingIds.value.has(userId)
  }

  function setPending(userId, pending) {
    const nextPending = new Set(pendingIds.value)

    if (pending) {
      nextPending.add(userId)
    } else {
      nextPending.delete(userId)
    }

    pendingIds.value = nextPending
  }

  async function hydrateFollowingIds(viewerId) {
    if (!viewerId) {
      replaceFollowingIds([])
      return followingIds.value
    }

    let page = 1
    let lastPage = 1
    const ids = new Set()

    do {
      const data = await getUserFollowing(viewerId, { page, per_page: 50 })

      for (const user of data.data || []) {
        ids.add(user.id)
      }

      lastPage = data.last_page || 1
      page += 1
    } while (page <= lastPage)

    followingIds.value = ids
    return ids
  }

  async function toggleFollow(userId) {
    setPending(userId, true)

    try {
      const nextFollowing = new Set(followingIds.value)

      if (nextFollowing.has(userId)) {
        await unfollowUser(userId)
        nextFollowing.delete(userId)
      } else {
        await followUser(userId)
        nextFollowing.add(userId)
      }

      followingIds.value = nextFollowing
    } finally {
      setPending(userId, false)
    }
  }

  return {
    followingIds,
    followingList,
    pendingIds,
    replaceFollowingIds,
    hydrateFollowingIds,
    isFollowing,
    isPending,
    toggleFollow,
  }
})
