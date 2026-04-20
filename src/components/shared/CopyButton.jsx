import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      className={`copy-btn ${copied ? 'copy-btn-copied' : ''} ${className}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: copied ? 'var(--color-status-complete)' : 'var(--color-text-secondary)',
        background: copied ? 'rgba(39, 174, 96, 0.1)' : 'rgba(255,255,255,0.05)',
        border: '1px solid',
        borderColor: copied ? 'var(--color-status-complete)' : 'rgba(255,255,255,0.1)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  )
}
