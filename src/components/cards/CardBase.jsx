import './CardBase.css'

export default function CardBase({ color, icon, headline, footer, children, className = '', glow = false }) {
  return (
    <div className={`card ${glow ? 'card-glow' : ''} ${className}`}>
      <div className="card-header-bar" style={{ background: color }} />
      <div className="card-body">
        <div className="card-top">
          {icon && <span className="card-icon">{icon}</span>}
          <h3 className="card-headline">{headline}</h3>
        </div>
        <div className="card-content">
          {children}
        </div>
        {footer && (
          <div className="card-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
