import CardBase from './CardBase'
import { ExternalLink } from 'lucide-react'
import { formatNumber } from '../../utils/formatters'

export default function ProblemCard({ data }) {
  return (
    <CardBase
      color="var(--color-card-red)"
      icon="&#9889;"
      headline="This is what developers are actually stuck on"
      footer={data.whyUnsolved}
    >
      <p>{data.painDescription}</p>

      <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', margin: 'var(--space-lg) 0' }}>
        <span className="card-stat" style={{ color: 'var(--color-card-red)' }}>
          {formatNumber(data.upvoteCount)} upvotes
        </span>
        <span className="card-stat">
          {Math.floor(data.daysUnresolved / 30)} months unresolved
        </span>
        <span className="card-stat">
          {data.relatedGithubIssues} related issues
        </span>
      </div>

      {data.soQuestionTitle && (
        <div style={{
          padding: 'var(--space-md)',
          background: 'rgba(231, 76, 60, 0.05)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(231, 76, 60, 0.12)',
          marginBottom: 'var(--space-md)',
        }}>
          <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            "{data.soQuestionTitle}"
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {data.soQuestionUrl && (
          <a href={data.soQuestionUrl} target="_blank" rel="noopener noreferrer" className="card-source-link">
            <ExternalLink size={12} /> Stack Overflow
          </a>
        )}
        {data.topGithubIssueUrl && (
          <a href={data.topGithubIssueUrl} target="_blank" rel="noopener noreferrer" className="card-source-link">
            <ExternalLink size={12} /> GitHub Issue
          </a>
        )}
      </div>
    </CardBase>
  )
}
