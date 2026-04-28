import api from '@/services/api'

export function likePost(postId) {
  return api.post(`/posts/${postId}/like`).then((response) => response.data)
}

export function unlikePost(postId) {
  return api.delete(`/posts/${postId}/unlike`).then((response) => response.data)
}

export function getPostLikes(postId) {
  return api.get(`/posts/${postId}/likes`).then((response) => response.data)
}
