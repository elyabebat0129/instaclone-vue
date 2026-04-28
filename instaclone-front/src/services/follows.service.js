import api from '@/services/api'

export function followUser(userId) {
  return api.post(`/users/${userId}/follow`).then((response) => response.data)
}

export function unfollowUser(userId) {
  return api.delete(`/users/${userId}/unfollow`).then((response) => response.data)
}

export function getUserFollowers(userId, params = {}) {
  return api.get(`/users/${userId}/followers`, { params }).then((response) => response.data)
}

export function getUserFollowing(userId, params = {}) {
  return api.get(`/users/${userId}/following`, { params }).then((response) => response.data)
}

export function getIsFollowing(userId) {
  return api.get(`/users/${userId}/is-following`).then((response) => response.data)
}
