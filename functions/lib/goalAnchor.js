const GOAL_ANCHOR = `The final goal is a genuinely novel, practically useful innovation that a specific real person with a real frustration would immediately want to use. The innovation must connect a real developer pain to a real mechanism from an unrelated field in a way that produces working, testable code and a clear market gap. Anything that does not advance this goal should be rejected and the agent should flag itself to the Overseer.`;

function buildSelfCheckPrompt(agentOutput, agentName) {
  return `You are the self-check module for ${agentName}.

GOAL ANCHOR: ${GOAL_ANCHOR}

AGENT OUTPUT:
${JSON.stringify(agentOutput, null, 2)}

Does this output genuinely advance the goal anchor?
Respond with JSON only: { "passes": true/false, "reason": "..." }
If false, explain exactly what is wrong and what should change.`;
}

module.exports = { GOAL_ANCHOR, buildSelfCheckPrompt };
