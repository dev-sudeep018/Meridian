import { useState, useRef, useEffect } from 'react'
import { Send, Download, ExternalLink, Sparkles } from 'lucide-react'
import { chatCompletion } from '../../pipeline/ai'
import AgentStatusFeed from './AgentStatusFeed'
import Button from '../shared/Button'
import ShareableLink from '../shared/ShareableLink'
import './ConversationPanel.css'

const SYSTEM_PROMPT = `You are MERIDIAN, an AI innovation discovery assistant. You help developers discover novel solutions to their problems by finding connections from unexpected fields.

Your personality: Sharp, curious, direct. Never generic. You ask incisive questions to deeply understand the user's problem before launching the discovery pipeline.

CONVERSATION FLOW:
1. The user describes their problem (could be vague or specific)
2. You ask smart follow-up questions to understand: the SPECIFIC pain, what's been tried, who suffers most
3. When you have enough context, you extract the key information and signal readiness

RULES:
- Be conversational and natural, not robotic
- Ask ONE question at a time, not a list
- If the user is vague, push for specifics with smart examples
- If the user gives nonsensical input, gently redirect: "That's interesting, but I need a real technical problem to find innovations for. What's frustrating you in your work right now?"
- NEVER ask more than 4-5 follow-up questions total
- When you have enough info (problem + prior attempts + who it affects), end your message with the EXACT string: [READY_TO_DISCOVER]
- Do NOT include [READY_TO_DISCOVER] unless you genuinely have enough information

EXTRACTION FORMAT (include this ONLY when you also say [READY_TO_DISCOVER]):
[EXTRACTION]
PROBLEM: <clear problem statement>
PRIOR_ATTEMPTS: <what's been tried>
WHO: <who experiences this>
[/EXTRACTION]`

export default function ConversationPanel({ messages: externalMessages, phase, discovery, onSendMessage, discoveryId }) {
  const [input, setInput] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Initialize chat history
  useEffect(() => {
    if (chatHistory.length === 0 && phase !== 'running' && phase !== 'complete') {
      setChatHistory([{
        role: 'assistant',
        content: "I'm MERIDIAN. I discover innovations by finding solutions from fields nobody thought to look in. Tell me — what problem are you trying to solve? Be as specific or as vague as you want, I'll dig deeper.",
      }])
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, externalMessages, phase])

  useEffect(() => {
    if (phase !== 'running' && phase !== 'complete') {
      inputRef.current?.focus()
    }
  }, [phase, chatHistory])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isThinking) return

    const userMsg = input.trim()
    setInput('')

    // Add user message to chat
    const newHistory = [...chatHistory, { role: 'user', content: userMsg }]
    setChatHistory(newHistory)

    setIsThinking(true)
    try {
      // Build messages for AI call
      const aiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...newHistory.map(m => ({ role: m.role, content: m.content })),
      ]

      const reply = await chatCompletion(aiMessages, { temperature: 0.7, maxTokens: 512 })

      // Check if AI says ready to discover
      if (reply.includes('[READY_TO_DISCOVER]')) {
        const cleanReply = reply.replace('[READY_TO_DISCOVER]', '').trim()

        // Extract problem info
        const extraction = extractProblemInfo(reply)
        const displayReply = cleanReply.replace(/\[EXTRACTION\][\s\S]*?\[\/EXTRACTION\]/g, '').trim()

        setChatHistory([...newHistory, { role: 'assistant', content: displayReply + '\n\nLaunching discovery agents now...' }])

        // Trigger pipeline
        if (extraction) {
          onSendMessage('__SMART_CHAT__', extraction)
        }
      } else {
        setChatHistory([...newHistory, { role: 'assistant', content: reply }])
      }
    } catch (err) {
      console.error('Chat error:', err)
      setChatHistory([...newHistory, {
        role: 'assistant',
        content: "I had trouble connecting. Let me try again — what's the problem you're working on?",
      }])
    }
    setIsThinking(false)
  }

  const displayMessages = chatHistory.length > 0 ? chatHistory : externalMessages.map(m => ({
    role: m.role,
    content: m.text,
  }))

  const isInputPhase = phase !== 'running' && phase !== 'complete'

  return (
    <div className="conversation-panel" id="conversation-panel">
      <div className="conversation-messages">
        {displayMessages.map((msg, i) => (
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
              {msg.content || msg.text}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="conversation-msg conversation-msg-assistant animate-fade-in-up">
            <div className="conversation-avatar">
              <span className="material-icons" style={{fontSize: '16px', color: '#000'}}>hub</span>
            </div>
            <div className="conversation-bubble conversation-bubble-assistant thinking-bubble">
              <span className="thinking-dots">
                <span></span><span></span><span></span>
              </span>
            </div>
          </div>
        )}

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
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = discovery.pdfUrl
                    link.download = `${discovery.innovationName || 'meridian-discovery'}.pdf`
                    link.click()
                  }}
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

      {/* Input Area */}
      {isInputPhase && (
        <div className="conversation-input-wrapper">
          <form className="conversation-input-area" onSubmit={handleSubmit}>
            <div className={`conversation-input-container ${input.trim() ? 'has-text' : ''}`}>
              <span className="conversation-input-icon material-icons">chat_bubble_outline</span>
              <input
                ref={inputRef}
                type="text"
                className="conversation-input"
                placeholder={isThinking ? 'MERIDIAN is thinking...' : 'Describe your challenge...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isThinking}
                id="conversation-input"
              />
              <button
                type="submit"
                className="conversation-send-btn"
                disabled={!input.trim() || isThinking}
                id="send-button"
              >
                <Send size={16} />
                <span className="send-btn-text">Send</span>
              </button>
            </div>
            <p className="conversation-input-hint">
              <Sparkles size={12} style={{verticalAlign: 'middle', marginRight: '4px'}} />
              Powered by DeepSeek AI — have a natural conversation
            </p>
          </form>
        </div>
      )}
    </div>
  )
}

function extractProblemInfo(text) {
  const match = text.match(/\[EXTRACTION\]([\s\S]*?)\[\/EXTRACTION\]/)
  if (!match) return null

  const block = match[1]
  const problem = block.match(/PROBLEM:\s*(.+)/)?.[1]?.trim() || ''
  const prior = block.match(/PRIOR_ATTEMPTS:\s*(.+)/)?.[1]?.trim() || ''
  const who = block.match(/WHO:\s*(.+)/)?.[1]?.trim() || ''

  if (!problem) return null
  return { q1: problem, q2: prior || 'None mentioned', q3: who || 'Developers' }
}
