import api from '@/services/api'

// POST /posts/:id/like: cria uma curtida no post.
export function likePost(postId) {
  return api.post(`/posts/${postId}/like`).then((response) => response.data)
}

// DELETE /posts/:id/unlike: remove a curtida do usuario logado.
export function unlikePost(postId) {
  return api.delete(`/posts/${postId}/unlike`).then((response) => response.data)
}

// GET /posts/:id/likes: consulta a lista/contagem de curtidas do post.
export function getPostLikes(postId) {
  return api.get(`/posts/${postId}/likes`).then((response) => response.data)
}
