import { useState, useRef, useEffect } from 'react'
import { Send, Download, ExternalLink } from 'lucide-react'
import AgentStatusFeed from './AgentStatusFeed'
import Button from '../shared/Button'
import ShareableLink from '../shared/ShareableLink'
import './ConversationPanel.css'

export default function ConversationPanel({ messages, phase, discovery, onSendMessage, discoveryId }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, phase])

  useEffect(() => {
    if (phase === 'q1' || phase === 'q2' || phase === 'q3') {
      inputRef.current?.focus()
    }
  }, [phase])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput('')
  }

  const isConversationPhase = ['q1', 'q2', 'q3'].includes(phase)

  return (
    <div className="conversation-panel" id="conversation-panel">
      <div className="conversation-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`conversation-msg conversation-msg-${msg.role} animate-fade-in-up`}
            style={{ animationDelay: `${Math.min(i * 50, 200)}ms` }}
          >
            {msg.role === 'assistant' && (
              <div className="conversation-avatar">
                <span className="material-icons" style={{fontSize: '16px', color: '#000'}}>hub</span>
              </div>
            )}
            <div className={`conversation-bubble conversation-bubble-${msg.role}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Agent Status Feed — during running phase */}
        {(phase === 'running' || phase === 'complete') && (
          <div className="conversation-status-section animate-fade-in-up">
            <AgentStatusFeed discovery={discovery} />
          </div>
        )}

        {/* Completion Actions */}
        {phase === 'complete' && discovery && (
          <div className="conversation-complete animate-fade-in-up">
            <div className="conversation-msg conversation-msg-assistant">
              <div className="conversation-avatar">
                <span className="material-icons" style={{fontSize: '16px', color: '#000'}}>hub</span>
              </div>
              <div className="conversation-bubble conversation-bubble-assistant">
                Discovery complete. {discovery.innovationName && (
                  <>Innovation found: <strong>{discovery.innovationName}</strong>.</>
                )} All agents have finished. Review the results on the right.
              </div>
            </div>
            <div className="conversation-actions">
              {discovery.pdfUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download size={14} />}
                  onClick={() => window.open(discovery.pdfUrl, '_blank')}
                  id="download-pdf-button"
                >
                  Download PDF
                </Button>
              )}
              {discovery.githubUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ExternalLink size={14} />}
                  onClick={() => window.open(discovery.githubUrl, '_blank')}
                  id="view-github-button"
                >
                  View on GitHub
                </Button>
              )}
            </div>
            {discoveryId && (
              <div className="conversation-share">
                <ShareableLink discoveryId={discoveryId} />
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area — only during conversation phase */}
      {isConversationPhase && (
        <div className="conversation-input-wrapper">
          <form className="conversation-input-area" onSubmit={handleSubmit}>
            <div className={`conversation-input-container ${input.trim() ? 'has-text' : ''}`}>
              <span className="conversation-input-icon material-icons">chat_bubble_outline</span>
              <input
                ref={inputRef}
                type="text"
                className="conversation-input"
                placeholder="Describe your challenge..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                id="conversation-input"
              />
              <button
                type="submit"
                className="conversation-send-btn"
                disabled={!input.trim()}
                id="send-button"
              >
                <Send size={16} />
                <span className="send-btn-text">Send</span>
              </button>
            </div>
            <p className="conversation-input-hint">
              <span className="material-icons" style={{fontSize: '12px', verticalAlign: 'middle', marginRight: '4px'}}>lock</span>
              Your input is private and never stored beyond this session
            </p>
          </form>
        </div>
      )}
    </div>
  )
}
