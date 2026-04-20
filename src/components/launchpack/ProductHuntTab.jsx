import CopyButton from '../shared/CopyButton'

export default function ProductHuntTab({ text }) {
  if (!text) return <p style={{ color: 'var(--color-text-muted)' }}>No Product Hunt post generated.</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-md)' }}>
        <CopyButton text={text} label="Copy PH Post" />
      </div>
      <pre style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--font-size-sm)',
        lineHeight: 'var(--line-height-relaxed)',
        color: 'var(--color-text-secondary)',
        background: 'var(--color-bg-primary)',
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-md)',
        border: 'var(--border-subtle)',
      }}>
        {text}
      </pre>
    </div>
  )
}
