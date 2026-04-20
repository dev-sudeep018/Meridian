import './Logo.css'

export default function Logo({ size = 'md', linkTo = '/' }) {
  const sizes = {
    sm: { icon: 24, text: 14 },
    md: { icon: 32, text: 18 },
    lg: { icon: 48, text: 28 },
  }
  const s = sizes[size] || sizes.md

  const content = (
    <div className="logo" data-size={size}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-icon"
      >
        <path
          d="M12 52V12L32 36L52 12V52"
          stroke="var(--color-accent-teal)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M38 28L46 14"
          stroke="var(--color-accent-teal)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
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
