import { AGENT_CONFIG } from '../../utils/agentNames'
import { getStatusColor } from '../../utils/formatters'
import './AgentStatusFeed.css'

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

  // Parallel groups: 1,2,3 run after 0; 6,7 run after 5
  const prevField = fieldMap[agentOrder[Math.max(0, idx - 1)]]
  if (prevField && discovery[prevField] && !discovery[field]) {
    // This agent should be running if its dependency is met
    if (agentId === 'agent1' || agentId === 'agent2' || agentId === 'agent3') {
      if (discovery.originalBrief) return 'running'
    }
    if (agentId === 'agent6' || agentId === 'agent7') {
      if (discovery.agent5) return 'running'
    }
    return 'running'
  }

  return 'waiting'
}

export default function AgentStatusFeed({ discovery }) {
  return (
    <div className="agent-status-feed" id="agent-status-feed">
      <div className="agent-status-header">Agent Pipeline</div>
      <div className="agent-status-list">
        {AGENT_CONFIG.map((agent, i) => {
          const status = getAgentStatus(agent.id, discovery)
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
                <span className="agent-status-state">{status}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
