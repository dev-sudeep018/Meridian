import { getScoreColor } from '../../utils/formatters'
import './OverseerBar.css'

const dimensions = [
  { key: 'trajectory', label: 'Trajectory' },
  { key: 'credibility', label: 'Credibility' },
  { key: 'novelty', label: 'Novelty' },
]

export default function OverseerBar({ scores }) {
  if (!scores) return null

  return (
    <div className="overseer-bar" id="overseer-bar">
      {dimensions.map(({ key, label }) => {
        const score = scores[key] ?? 0
        const color = getScoreColor(score)
        const width = `${(score / 10) * 100}%`

        return (
          <div key={key} className="overseer-bar-item">
            <div className="overseer-bar-track">
              <div
                className="overseer-bar-fill"
                style={{
                  width,
                  background: color,
                  '--bar-width': width,
                }}
              />
            </div>
            <div className="overseer-bar-meta">
              <span className="overseer-bar-label">{label}</span>
              <span className="overseer-bar-score" style={{ color }}>
                {score}/10
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
