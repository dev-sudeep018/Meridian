import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  id,
  ...props
}) {
  return (
    <button
      id={id}
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon btn-icon-left">{icon}</span>}
      {children && <span className="btn-label">{children}</span>}
      {iconRight && <span className="btn-icon btn-icon-right">{iconRight}</span>}
    </button>
  )
}
