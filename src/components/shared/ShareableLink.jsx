import { Link } from 'lucide-react'
import CopyButton from './CopyButton'

export default function ShareableLink({ discoveryId }) {
  const url = `${window.location.origin}/discovery/${discoveryId}`

  return (
    <div
      className="shareable-link"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md)',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: 'var(--border-subtle)',
      }}
    >
      <Link size={16} style={{ color: 'var(--color-accent-teal)', flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {url}
      </span>
      <CopyButton text={url} label="Copy Link" />
    </div>
  )
}
