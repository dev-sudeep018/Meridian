import CardBase from './CardBase'
import { ExternalLink, Code2, MessageSquare } from 'lucide-react'

const platformIcons = {
  github: <Code2 size={14} />,
  stackoverflow: <MessageSquare size={14} />,
  hackernews: <span style={{ fontWeight: 700, fontSize: '12px', color: '#FF6600' }}>Y</span>,
}

export default function ValidationCard({ data }) {
  return (
    <CardBase
      color="var(--color-card-purple)"
      icon="&#10003;"
      headline="Real people need exactly this"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {data.validationEntries?.map((entry, i) => (
          <div key={i}>
            <div className="card-blockquote">
              "{entry.exactQuote}"
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              {platformIcons[entry.platform] || null}
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                @{entry.username}
              </span>
              {entry.sourceUrl && (
                <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="card-source-link">
                  <ExternalLink size={11} /> source
                </a>
              )}
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
              {entry.howInnovationHelps}
            </p>
          </div>
        ))}
      </div>
    </CardBase>
  )
}
