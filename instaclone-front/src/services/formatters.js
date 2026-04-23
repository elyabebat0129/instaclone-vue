export function formatRelativeTime(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const now = new Date()
  const diffInSeconds = Math.max(1, Math.floor((now.getTime() - date.getTime()) / 1000))

  if (diffInSeconds < 60) {
    return `ha ${diffInSeconds}s`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)

  if (diffInMinutes < 60) {
    return `ha ${diffInMinutes}min`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)

  if (diffInHours < 24) {
    return `ha ${diffInHours}h`
  }

  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays < 30) {
    return `ha ${diffInDays}d`
  }

  return date.toLocaleDateString('pt-BR')
}

export function extractErrorMessage(error, fallback = 'Nao foi possivel concluir a operacao.') {
  if (error.response?.data?.errors) {
    const firstEntry = Object.values(error.response.data.errors)[0]

    if (Array.isArray(firstEntry) && firstEntry.length) {
      return firstEntry[0]
    }
  }

  return error.response?.data?.message || error.message || fallback
}
