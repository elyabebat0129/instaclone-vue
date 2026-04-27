import api from '@/services/api'

export function loginRequest(payload) {
  return api.post('/auth/login', payload).then((response) => response.data)
}

export function registerRequest(payload) {
  return api.post('/auth/register', payload).then((response) => response.data)
}

export function logoutRequest() {
  return api.post('/auth/logout').then((response) => response.data)
}

export function meRequest() {
  return api.get('/auth/me').then((response) => response.data)
}
