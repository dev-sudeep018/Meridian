import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import CardBase from './CardBase'
import './BridgeCard.css'

export default function BridgeCard({ data, rejected = [] }) {
  const [showRejected, setShowRejected] = useState(false)
  const bridge = data.approvedBridge

  if (!bridge) return null

  return (
    <CardBase
      color="var(--color-card-teal)"
      icon="&#128640;"
      headline="The connection nobody made"
      glow={true}
      className="bridge-card"
    >
      {/* Visual Bridge Diagram */}
      <div className="bridge-diagram">
        <div className="bridge-domain bridge-domain-left">
          <div className="bridge-domain-label">Software Problem</div>
          <div className="bridge-domain-name">AI Agent State</div>
        </div>
        <div className="bridge-arrow">
          <div className="bridge-arrow-line" />
          <div className="bridge-arrow-mechanism">
            {bridge.mechanism?.split('—')[0]?.trim() || 'Structural Bridge'}
          </div>
        </div>
        <div className="bridge-domain bridge-domain-right">
          <div className="bridge-domain-label">Adjacent Field</div>
          <div className="bridge-domain-name">{bridge.field}</div>
        </div>
      </div>

      {/* Three Paragraphs */}
      <div className="bridge-sections">
        <div className="bridge-section">
          <h4 className="bridge-section-title">The Field</h4>
          <p>{bridge.field} — {bridge.mechanism}</p>
        </div>
        <div className="bridge-section">
          <h4 className="bridge-section-title">The Structural Analogy</h4>
          <p>{bridge.structuralAnalogy}</p>
        </div>
        <div className="bridge-section">
          <h4 className="bridge-section-title">The Translation</h4>
          <p>{bridge.translationConcept}</p>
        </div>
      </div>

      {/* Critic Verdict */}
      <div className="bridge-critic-box">
        <div className="bridge-critic-label">Critic's Verdict</div>
        <p className="bridge-critic-reason">{bridge.approvalReason}</p>
      </div>

      {/* Rejected Candidates (collapsible) */}
      {rejected.length > 0 && (
        <div className="bridge-rejected">
          <button className="bridge-rejected-toggle" onClick={() => setShowRejected(!showRejected)}>
            {showRejected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{rejected.length} candidate{rejected.length > 1 ? 's' : ''} rejected</span>
          </button>
          {showRejected && (
            <div className="bridge-rejected-list">
              {rejected.map((r, i) => (
                <div key={i} className="bridge-rejected-item">
                  <span className="bridge-rejected-field">{r.field}</span>
                  <span className="bridge-rejected-reason">{r.rejectionReason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </CardBase>
  )
}
