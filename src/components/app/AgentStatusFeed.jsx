import { AGENT_CONFIG } from '../../utils/agentNames'
import { getStatusColor } from '../../utils/formatters'
import './AgentStatusFeed.css'

// Dynamic status messages per agent
const RUNNING_MESSAGES = {
  agent0: 'Understanding your problem...',
  agent1: 'Scanning Stack Overflow, GitHub Issues, Hacker News...',
  agent2: 'Scanning arXiv and HuggingFace for recent breakthroughs...',
  agent3: 'Searching Aviation Safety, Nuclear Operations, Surgical Protocols...',
  agent4: 'Attacking all 3 candidates with rejection tests...',
  agent45: 'Finding real developers who complained about this...',
  agent5: 'Translating mechanism into Python library...',
  agent6: 'Verifying code — Check 1 of 4: Syntax...',
  agent7: 'Finding closest existing solutions...',
  agent8: 'Creating GitHub repository...',
}

function getCompleteSummary(agentId, discovery) {
  if (!discovery) return 'Done'
  const d = discovery

  switch (agentId) {
    case 'agent0':
      return d.originalBrief
        ? `Brief ready — searching for ${d.originalBrief.problemStatement?.substring(0, 40)}...`
        : 'Done'
    case 'agent1':
      return d.agent1
        ? `${d.agent1.upvoteCount || 0} upvotes — ${(d.agent1.problemTitle || d.agent1.soQuestionTitle || '').substring(0, 40)}...`
        : 'Done'
    case 'agent2':
      return d.agent2
        ? `Found: ${d.agent2.capabilityName || ''} — ${d.agent2.publicationDate || ''}`
        : 'Done'
    case 'agent3':
      return d.agent3?.candidates
        ? `3 bridges found across ${d.agent3.candidates.map(c => c.field).join(', ')}`
        : 'Done'
    case 'agent4':
      return d.agent4?.approvedBridge
        ? `Approved: ${d.agent4.approvedBridge.field} bridge`
        : d.agent4 ? 'No bridge survived' : 'Done'
    case 'agent45':
      return d.agent45
        ? `Validated against ${d.agent45.validationEntries?.length || 0} real developer complaints`
        : 'Done'
    case 'agent5':
      return d.agent5?.specification
        ? `${d.agent5.specification.libraryName}.py — ${d.agent5.specification.oneLiner?.substring(0, 40)}...`
        : 'Done'
    case 'agent6':
      return d.agent6
        ? `All 4 checks passed — ${d.agent6.iterations || 1} revision(s)`
        : 'Done'
    case 'agent7':
      return d.agent7
        ? `Gap: ${d.agent7.marketGap?.substring(0, 45)}...`
        : 'Done'
    case 'agent8':
      return d.agent8
        ? 'Discovery complete — GitHub live, PDF ready'
        : 'Done'
    default:
      return 'Done'
  }
}

function getAgentStatus(agentId, discovery) {
  if (!discovery) return 'waiting'

  const fieldMap = {
    agent0: 'originalBrief',
    agent1: 'agent1',
    agent2: 'agent2',
    agent3: 'agent3',
    agent4: 'agent4',
    agent45: 'agent45',
    agent5: 'agent5',
    agent6: 'agent6',
    agent7: 'agent7',
    agent8: 'agent8',
  }

  const field = fieldMap[agentId]
  if (!field) return 'waiting'

  if (discovery[field]) return 'complete'

  // Check if previous agents are complete to determine if this one is running
  const agentOrder = ['agent0', 'agent1', 'agent2', 'agent3', 'agent4', 'agent45', 'agent5', 'agent6', 'agent7', 'agent8']
  const idx = agentOrder.indexOf(agentId)
  if (idx === 0 && !discovery.originalBrief) return 'running'

  // Parallel groups: 1,2 run after 0; 3 runs after 1+2; 6,7 run after 5
  if ((agentId === 'agent1' || agentId === 'agent2') && discovery.originalBrief && !discovery[field]) return 'running'
  if (agentId === 'agent3' && discovery.agent1 && discovery.agent2 && !discovery.agent3) return 'running'
  if (agentId === 'agent4' && discovery.agent3 && !discovery.agent4) return 'running'
  if (agentId === 'agent45' && discovery.agent4 && !discovery.agent45) return 'running'
  if (agentId === 'agent5' && discovery.agent45 && !discovery.agent5) return 'running'
  if ((agentId === 'agent6' || agentId === 'agent7') && discovery.agent5 && !discovery[field]) return 'running'
  if (agentId === 'agent8' && discovery.agent6 && discovery.agent7 && !discovery.agent8) return 'running'

  return 'waiting'
}

export default function AgentStatusFeed({ discovery }) {
  return (
    <div className="agent-status-feed" id="agent-status-feed">
      <div className="agent-status-header">Agent Pipeline</div>
      <div className="agent-status-list">
        {AGENT_CONFIG.map((agent, i) => {
          const status = getAgentStatus(agent.id, discovery)
          const statusText = status === 'complete'
            ? getCompleteSummary(agent.id, discovery)
            : status === 'running'
            ? RUNNING_MESSAGES[agent.id]
            : ''
          return (
            <div
              key={agent.id}
              className={`agent-status-item agent-status-${status}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={`agent-status-dot ${status === 'running' ? 'animate-pulse' : ''}`}
                style={{ background: getStatusColor(status) }}
              />
              <div className="agent-status-info">
                <span className="agent-status-name">{agent.name}</span>
                <span className={`agent-status-state ${status === 'complete' ? 'agent-status-summary' : ''}`}>
                  {statusText || status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
