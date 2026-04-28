import api from '@/services/api'

export function getPostComments(postId, params = {}) {
  return api.get(`/posts/${postId}/comments`, { params }).then((response) => response.data)
}

export function createPostComment(postId, body) {
  return api.post(`/posts/${postId}/comments`, { body }).then((response) => response.data)
}

export function deleteComment(commentId) {
  return api.delete(`/comments/${commentId}`).then((response) => response.data)
}
