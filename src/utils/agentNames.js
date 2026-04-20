export const AGENT_CONFIG = [
  { id: 'agent0', name: 'Prompt Sharpener', shortName: 'Sharpener', description: 'Converting your answers into a precision research brief' },
  { id: 'agent1', name: 'Frustration Scanner', shortName: 'Frustration', description: 'Searching Stack Overflow, GitHub, and Hacker News for real developer pain' },
  { id: 'agent2', name: 'Frontier Detector', shortName: 'Frontier', description: 'Finding capabilities that became possible in the last 90 days' },
  { id: 'agent3', name: 'Adjacent Domain Finder', shortName: 'Adjacent', description: 'Searching 10 unrelated fields for structural analogies' },
  { id: 'agent4', name: 'Adversarial Critic', shortName: 'Critic', description: 'Attacking candidates with 3 rejection tests' },
  { id: 'agent45', name: 'Reality Checker', shortName: 'Reality', description: 'Finding real developers who need exactly this' },
  { id: 'agent5', name: 'Code Translator', shortName: 'Translator', description: 'Generating technical specification and working Python code' },
  { id: 'agent6', name: 'Code Verifier', shortName: 'Verifier', description: 'Checking syntax, logic, tests, and dependencies' },
  { id: 'agent7', name: 'Market Gap Analyst', shortName: 'Market', description: 'Identifying what competitors are missing' },
  { id: 'agent8', name: 'Publisher', shortName: 'Publisher', description: 'Creating GitHub repo, PDF report, and launch pack' },
]

export const AGENT_MAP = Object.fromEntries(AGENT_CONFIG.map(a => [a.id, a]))
