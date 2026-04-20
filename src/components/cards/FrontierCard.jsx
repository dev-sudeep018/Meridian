import CardBase from './CardBase'
import { ExternalLink } from 'lucide-react'

export default function FrontierCard({ data }) {
  return (
    <CardBase
      color="var(--color-card-orange)"
      icon="&#128640;"
      headline={`This became possible ${data.weeksAgo} weeks ago`}
      footer={data.whyRelevant}
    >
      <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)' }}>
        {data.capabilityName}
      </p>
      <p>{data.description}</p>

      {data.sourceUrl && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="card-source-link">
            <ExternalLink size={12} />
            {data.sourceType === 'arxiv' ? 'arXiv Paper' : 'HuggingFace Model'}
          </a>
        </div>
      )}
    </CardBase>
  )
}
