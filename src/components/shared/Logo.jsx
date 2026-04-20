import './Logo.css'

export default function Logo({ size = 'md', linkTo = '/' }) {
  const sizes = {
    sm: { icon: 24, text: 14 },
    md: { icon: 28, text: 18 },
    lg: { icon: 36, text: 28 },
  }
  const s = sizes[size] || sizes.md

  const content = (
    <div className="logo" data-size={size}>
      <span
        className="material-icons logo-icon"
        style={{ fontSize: s.icon }}
      >
        hub
      </span>
      <span className="logo-text" style={{ fontSize: s.text }}>
        MERIDIAN
      </span>
    </div>
  )

  if (linkTo) {
    return <a href={linkTo} className="logo-link">{content}</a>
  }
  return content
}
