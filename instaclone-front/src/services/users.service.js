import api from '@/services/api'

export function getUserByUsername(username) {
  return api.get(`/users/${username}`).then((response) => response.data)
}

export function getUserSuggestions(params = {}) {
  return api.get('/users/suggestions', { params }).then((response) => response.data)
}

export function getUserPosts(userId, params = {}) {
  return api.get(`/users/${userId}/posts`, { params }).then((response) => response.data)
}

export function updateMyProfile(payload) {
  return api.put('/users/me', payload).then((response) => response.data)
}

export function uploadMyAvatar(formData) {
  return api.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((response) => response.data)
}
