import api from '@/services/api'

// POST /auth/login: envia email/senha e recebe token + usuario.
export function loginRequest(payload) {
  return api.post('/auth/login', payload).then((response) => response.data)
}

// POST /auth/register: cria uma conta nova e ja retorna a sessao autenticada.
export function registerRequest(payload) {
  return api.post('/auth/register', payload).then((response) => response.data)
}

// POST /auth/logout: avisa a API que a sessao atual deve ser encerrada.
export function logoutRequest() {
  return api.post('/auth/logout').then((response) => response.data)
}

// GET /auth/me: busca o usuario atual usando o token enviado pelo interceptor.
export function meRequest() {
  return api.get('/auth/me').then((response) => response.data)
}
