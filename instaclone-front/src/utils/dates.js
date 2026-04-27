const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const fullDateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const shortDateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDayMonthYear(value) {
  if (!value) {
    return ''
  }

  return shortDateFormatter.format(new Date(value))
}

export function formatFullDateTime(value) {
  if (!value) {
    return ''
  }

  return fullDateTimeFormatter.format(new Date(value))
}

export function formatShortDateTime(value) {
  if (!value) {
    return ''
  }

  return shortDateTimeFormatter.format(new Date(value))
}

export function formatRelative(value) {
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

  return formatDayMonthYear(value)
}
