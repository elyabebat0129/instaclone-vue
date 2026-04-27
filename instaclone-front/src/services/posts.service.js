import api from '@/services/api'

// POST /posts: cria post novo. Usa FormData porque envia imagem junto da legenda.
export function createPostRequest(formData) {
  return api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((response) => response.data)
}

// GET /posts/:id: busca os detalhes de um post especifico.
export function getPostById(postId) {
  return api.get(`/posts/${postId}`).then((response) => response.data)
}

// DELETE /posts/:id: exclui um post pelo id.
export function deletePost(postId) {
  return api.delete(`/posts/${postId}`).then((response) => response.data)
}
