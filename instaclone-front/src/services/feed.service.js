import api from '@/services/api'

export function getFeed(params = {}) {
  return api.get('/feed', { params }).then((response) => response.data)
}
