import CardBase from './CardBase'
import { ExternalLink, CheckCircle } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CopyButton from '../shared/CopyButton'
import './CodeCard.css'

export default function CodeCard({ data, spec }) {
  const code = data.verifiedCode || ''
  // Show a trimmed version (main class/function interface)
  const displayCode = getCodePreview(code)
  const installCmd = spec?.libraryName
    ? `pip install git+https://github.com/demo/${spec.libraryName}`
    : ''

  return (
    <CardBase
      color="var(--color-card-green)"
      icon="{ }"
      headline="This library now exists"
    >
      {spec && (
        <>
          <div className="code-card-name">{spec.libraryName}</div>
          <p className="code-card-oneliner">{spec.oneLiner}</p>
        </>
      )}

      {/* Code Preview */}
      <div className="code-card-block">
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            lineHeight: '1.5',
            background: '#1E1E1E',
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {displayCode}
        </SyntaxHighlighter>
      </div>

      {/* Badges and Links */}
      <div className="code-card-meta">
        {data.verdict === 'pass' && (
          <span className="card-badge card-badge-green">
            <CheckCircle size={12} /> Tests Passing
          </span>
        )}
        {data.githubReady && (
          <a
            href="https://github.com/demo/agent-readback"
            target="_blank"
            rel="noopener noreferrer"
            className="card-source-link"
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            <ExternalLink size={13} /> View on GitHub
          </a>
        )}
      </div>

      {/* Install Command */}
      {installCmd && (
        <div className="code-card-install">
          <code className="code-card-install-cmd">{installCmd}</code>
          <CopyButton text={installCmd} label="Copy" />
        </div>
      )}
    </CardBase>
  )
}

function getCodePreview(fullCode) {
  if (!fullCode) return '# No code generated yet'
  const lines = fullCode.split('\n')
  // Find the main class definition and show ~25 lines
  const classIdx = lines.findIndex(l => l.startsWith('class ReadbackVerifier'))
  if (classIdx >= 0) {
    return lines.slice(classIdx, classIdx + 25).join('\n')
  }
  // Fallback: show first 25 meaningful lines
  const meaningful = lines.filter(l => l.trim() !== '' && !l.trim().startsWith('#'))
  return meaningful.slice(0, 25).join('\n')
}
