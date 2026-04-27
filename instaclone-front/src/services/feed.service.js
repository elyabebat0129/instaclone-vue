import api from '@/services/api'

// GET /feed: busca a timeline/feed. params pode levar cursor para carregar mais.
export function getFeed(params = {}) {
  return api.get('/feed', { params }).then((response) => response.data)
}
