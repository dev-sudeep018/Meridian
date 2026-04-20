import CopyButton from '../shared/CopyButton'
import { User } from 'lucide-react'

export default function DevOutreachTab({ messages }) {
  if (!messages || messages.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)' }}>No outreach messages generated.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            padding: 'var(--space-lg)',
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: 'var(--border-subtle)',
          }}
        >
          {/* Developer Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-md)',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--color-bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {msg.avatarUrl ? (
                <img
                  src={msg.avatarUrl}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <User size={18} style={{ color: 'var(--color-text-muted)' }} />
              )}
            </div>
            <div>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
              }}>
                @{msg.username}
              </div>
              {msg.profileUrl && (
                <a
                  href={msg.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-accent-teal)' }}
                >
                  View Profile
                </a>
              )}
            </div>
          </div>

          {/* Their complaint */}
          <div className="card-blockquote" style={{ marginBottom: 'var(--space-md)' }}>
            "{msg.publicComplaint}"
          </div>

          {/* Personalized message */}
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-relaxed)',
            marginBottom: 'var(--space-md)',
          }}>
            {msg.personalizedMessage}
          </p>

          <CopyButton text={msg.personalizedMessage} label="Copy Message" />
        </div>
      ))}
    </div>
  )
}
