import api from '@/services/api'

// GET /users/:username: busca um perfil publico pelo username.
export function getUserByUsername(username) {
  return api.get(`/users/${username}`).then((response) => response.data)
}

// GET /users/suggestions: busca sugestoes para seguir, usada na lateral/feed e descobrir.
export function getUserSuggestions(params = {}) {
  return api.get('/users/suggestions', { params }).then((response) => response.data)
}

// GET /users/:id/posts: lista posts publicados por um usuario.
export function getUserPosts(userId, params = {}) {
  return api.get(`/users/${userId}/posts`, { params }).then((response) => response.data)
}

// GET /users/:id/followers: lista seguidores de um usuario.
export function getUserFollowers(userId, params = {}) {
  return api.get(`/users/${userId}/followers`, { params }).then((response) => response.data)
}

// GET /users/:id/following: lista perfis que o usuario segue.
export function getUserFollowing(userId, params = {}) {
  return api.get(`/users/${userId}/following`, { params }).then((response) => response.data)
}

// GET /users/:id/is-following: retorna se o usuario logado segue esse perfil.
export function getIsFollowing(userId) {
  return api.get(`/users/${userId}/is-following`).then((response) => response.data)
}

// PUT /users/me: atualiza dados textuais do meu perfil.
export function updateMyProfile(payload) {
  return api.put('/users/me', payload).then((response) => response.data)
}

// POST /users/me/avatar: envia imagem do avatar usando multipart/form-data.
export function uploadMyAvatar(formData) {
  return api.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((response) => response.data)
}
