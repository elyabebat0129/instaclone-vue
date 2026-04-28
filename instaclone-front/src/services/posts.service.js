import api from '@/services/api'

export function createPostRequest(formData) {
  return api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((response) => response.data)
}

export function getPostById(postId) {
  return api.get(`/posts/${postId}`).then((response) => response.data)
}

export function deletePost(postId) {
  return api.delete(`/posts/${postId}`).then((response) => response.data)
}
