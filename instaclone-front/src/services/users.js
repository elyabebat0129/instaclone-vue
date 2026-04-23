import api from '@/services/api'

export async function fetchAllFollowingIds(userId) {
  if (!userId) {
    return new Set()
  }

  const ids = new Set()
  let page = 1
  let lastPage = 1

  do {
    const { data } = await api.get(`/users/${userId}/following`, {
      params: {
        page,
        per_page: 50,
      },
    })

    for (const user of data.data || []) {
      ids.add(user.id)
    }

    lastPage = data.last_page || 1
    page += 1
  } while (page <= lastPage)

  return ids
}
