import api from '@/services/api'

export function getNotifications() {
  return api.get('/notifications').then((response) => response.data)
}

export function getUnreadNotificationsCount() {
  return api.get('/notifications/unread-count').then((response) => response.data)
}

export function markNotificationsAsRead() {
  return api.put('/notifications/read').then((response) => response.data)
}
