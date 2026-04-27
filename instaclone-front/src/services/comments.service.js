import api from '@/services/api'

// GET /posts/:id/comments: lista comentarios de um post, com suporte a paginacao.
export function getPostComments(postId, params = {}) {
  return api.get(`/posts/${postId}/comments`, { params }).then((response) => response.data)
}

// POST /posts/:id/comments: cria um comentario ligado ao post informado.
export function createPostComment(postId, body) {
  return api.post(`/posts/${postId}/comments`, { body }).then((response) => response.data)
}

// DELETE /comments/:id: remove um comentario pelo id do proprio comentario.
export function deleteComment(commentId) {
  return api.delete(`/comments/${commentId}`).then((response) => response.data)
}
