import { useState } from 'react'
import { X, Search, Download, Link, ExternalLink } from 'lucide-react'
import { useDiscoveryHistory } from '../../hooks/useDiscoveryHistory'
import { formatDate, getScoreColor } from '../../utils/formatters'
import CopyButton from '../shared/CopyButton'
import './HistoryPanel.css'

export default function HistoryPanel({ userId, onClose, onSelectDiscovery }) {
  const { discoveries, loading } = useDiscoveryHistory(userId)
  const [search, setSearch] = useState('')

  const filtered = discoveries.filter(d => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      (d.innovationName || '').toLowerCase().includes(s) ||
      (d.adjacentDomain || '').toLowerCase().includes(s)
    )
  })

  return (
    <>
      {/* Overlay */}
      <div className="history-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="history-panel animate-slide-in-right" id="history-panel">
        <div className="history-header">
          <h2 className="history-title">Discovery History</h2>
          <button className="history-close" onClick={onClose} aria-label="Close history">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="history-search">
          <Search size={16} className="history-search-icon" />
          <input
            type="text"
            placeholder="Search by name or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="history-search-input"
            id="history-search"
          />
        </div>

        {/* List */}
        <div className="history-list">
          {loading ? (
            <div className="history-empty">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="history-empty">
              {discoveries.length === 0
                ? 'No discoveries yet. Start your first one!'
                : 'No matches found.'}
            </div>
          ) : (
            filtered.map((d) => (
              <div
                key={d.id}
                className="history-entry"
                onClick={() => onSelectDiscovery(d.id)}
              >
                <div className="history-entry-top">
                  <span className="history-entry-name">
                    {d.innovationName || 'Discovery'}
                  </span>
                  <span className="history-entry-date">
                    {formatDate(d.createdAt)}
                  </span>
                </div>
                <div className="history-entry-domain">
                  {d.adjacentDomain || 'Processing...'}
                </div>
                {d.finalScores && (
                  <div className="history-entry-scores">
                    {['trajectory', 'credibility', 'novelty'].map(key => (
                      <div
                        key={key}
                        className="history-entry-score-dot"
                        style={{ background: getScoreColor(d.finalScores[key] || 0) }}
                        title={`${key}: ${d.finalScores[key]}/10`}
                      />
                    ))}
                  </div>
                )}
                <div className="history-entry-actions" onClick={e => e.stopPropagation()}>
                  <CopyButton
                    text={`${window.location.origin}/discovery/${d.id}`}
                    label="Link"
                    className="history-action-btn"
                  />
                  {d.pdfUrl && (
                    <a
                      href={d.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="history-action-link"
                      title="Download PDF"
                    >
                      <Download size={13} /> PDF
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
