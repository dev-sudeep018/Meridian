export function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(timestamp)
}

export function formatNumber(num) {
  if (!num && num !== 0) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function getScoreColor(score) {
  if (score >= 7) return 'var(--color-score-green)'
  if (score >= 4) return 'var(--color-score-orange)'
  return 'var(--color-score-red)'
}

export function getScoreLabel(score) {
  if (score >= 7) return 'Strong'
  if (score >= 4) return 'Moderate'
  return 'Weak'
}

export function getStatusColor(status) {
  switch (status) {
    case 'complete': return 'var(--color-status-complete)'
    case 'running': return 'var(--color-status-running)'
    case 'error': return 'var(--color-status-error)'
    default: return 'var(--color-status-waiting)'
  }
}

export function truncate(str, maxLength = 100) {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trim() + '...'
}
