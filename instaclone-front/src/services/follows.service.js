import api from '@/services/api'

// POST /users/:id/follow: cria a relacao "eu sigo esse usuario".
export function followUser(userId) {
  return api.post(`/users/${userId}/follow`).then((response) => response.data)
}

// DELETE /users/:id/unfollow: remove a relacao de seguir.
export function unfollowUser(userId) {
  return api.delete(`/users/${userId}/unfollow`).then((response) => response.data)
}

// GET /users/:id/followers: lista quem segue o usuario.
export function getUserFollowers(userId, params = {}) {
  return api.get(`/users/${userId}/followers`, { params }).then((response) => response.data)
}

// GET /users/:id/following: lista quem o usuario esta seguindo.
export function getUserFollowing(userId, params = {}) {
  return api.get(`/users/${userId}/following`, { params }).then((response) => response.data)
}

// GET /users/:id/is-following: verifica se a conta logada ja segue esse perfil.
export function getIsFollowing(userId) {
  return api.get(`/users/${userId}/is-following`).then((response) => response.data)
}
