import CardBase from './CardBase'
import { ExternalLink } from 'lucide-react'

export default function MarketGapCard({ data }) {
  return (
    <CardBase
      color="var(--color-card-navy)"
      icon="&#128640;"
      headline="Why nobody has built this yet"
      footer={`This gap exists because ${data.gapReason}`}
    >
      {/* Three Competitor Mini-cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
      }}>
        {data.competitors?.map((comp, i) => (
          <div
            key={i}
            style={{
              padding: 'var(--space-md)',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: 'var(--border-subtle)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-sm)',
            }}>
              <span style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
              }}>
                {comp.name}
              </span>
              {comp.url && (
                <a href={comp.url} target="_blank" rel="noopener noreferrer" className="card-source-link">
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-sm)',
              lineHeight: 'var(--line-height-normal)',
            }}>
              {comp.description}
            </p>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-card-red)',
              fontWeight: 'var(--font-weight-medium)',
              lineHeight: 'var(--line-height-normal)',
            }}>
              Does NOT: {comp.specificGap}
            </p>
          </div>
        ))}
      </div>

      {/* Green Gap Box */}
      <div style={{
        padding: 'var(--space-lg)',
        background: 'rgba(39, 174, 96, 0.06)',
        border: '1px solid rgba(39, 174, 96, 0.2)',
        borderRadius: 'var(--radius-md)',
      }}>
        <div style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-card-green)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 'var(--space-xs)',
        }}>
          The Gap
        </div>
        <p style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-primary)',
          fontWeight: 'var(--font-weight-medium)',
          lineHeight: 'var(--line-height-relaxed)',
        }}>
          {data.marketGap}
        </p>
      </div>
    </CardBase>
  )
}
