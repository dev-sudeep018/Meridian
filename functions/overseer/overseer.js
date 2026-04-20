/**
 * Overseer — Firestore onDocumentUpdated trigger
 * Evaluates every agent write for trajectory, credibility, and novelty.
 * LLM: Gemini 2.5 Flash
 * 
 * IMPORTANT: Checks for specific field changes to avoid infinite loops.
 * Only runs when agent data fields change, not when overseer scores change.
 */
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { callGemini } = require("../lib/gemini");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");

// Fields that trigger overseer evaluation
const AGENT_FIELDS = [
  "originalBrief", "agent1", "agent2", "agent3",
  "agent4", "agent45", "agent5", "agent6", "agent7", "agent8",
];

exports.handler = async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  // Determine which agent field changed
  let changedField = null;
  for (const field of AGENT_FIELDS) {
    const hadBefore = before[field] !== undefined && before[field] !== null;
    const hasAfter = after[field] !== undefined && after[field] !== null;

    if (!hadBefore && hasAfter) {
      changedField = field;
      break;
    }
  }

  // No agent field changed — skip (prevents infinite loop from score updates)
  if (!changedField) return null;

  // Build evaluation prompt
  const prompt = `You are the Overseer for MERIDIAN, a continuous intelligence that evaluates every agent output.

GOAL ANCHOR: ${GOAL_ANCHOR}

THE AGENT THAT JUST WROTE: ${changedField}

THEIR OUTPUT:
${JSON.stringify(after[changedField], null, 2)}

FULL DISCOVERY STATE:
- Brief: ${after.originalBrief ? "present" : "missing"}
- Frustration: ${after.agent1 ? "present" : "missing"}
- Frontier: ${after.agent2 ? "present" : "missing"}
- Adjacent Domains: ${after.agent3 ? "present" : "missing"}
- Critic: ${after.agent4 ? "present" : "missing"}
- Reality Check: ${after.agent45 ? "present" : "missing"}
- Code: ${after.agent5 ? "present" : "missing"}
- Verifier: ${after.agent6 ? "present" : "missing"}
- Market: ${after.agent7 ? "present" : "missing"}
- Publisher: ${after.agent8 ? "present" : "missing"}

Score this agent's output on three dimensions (each 1-10):

1. TRAJECTORY: Is the pipeline still heading toward a genuinely useful innovation?
2. CREDIBILITY: Is this output backed by real data, not fabricated?
3. NOVELTY: Is the emerging innovation genuinely new, not obvious?

Also decide: should the pipeline STOP? Only say yes if the output is fundamentally flawed (e.g., the bridge is purely metaphorical, the code is obviously wrong, or the innovation already exists as-is).

Respond with JSON only:
{
  "trajectory": number,
  "credibility": number,
  "novelty": number,
  "stop": false,
  "reasoning": "1-2 sentences explaining your scores"
}`;

  try {
    const scores = await callGemini(prompt, {
      jsonMode: true,
      temperature: 0.1,
    });

    // Update the discovery with overseer scores
    const db = getFirestore();
    const docRef = db.collection("discoveries").doc(event.params.discoveryId);

    await docRef.update({
      currentScores: {
        trajectory: scores.trajectory,
        credibility: scores.credibility,
        novelty: scores.novelty,
      },
      overseerLog: FieldValue.arrayUnion({
        triggeredBy: changedField,
        trajectory: scores.trajectory,
        credibility: scores.credibility,
        novelty: scores.novelty,
        stop: scores.stop,
        reasoning: scores.reasoning,
        timestamp: new Date().toISOString(),
      }),
    });

    // If overseer says STOP, mark discovery as failed
    if (scores.stop) {
      await docRef.update({
        status: "stopped",
        stopReason: scores.reasoning,
      });
    }
  } catch (err) {
    console.error("Overseer evaluation failed:", err.message);
  }

  return null;
};
