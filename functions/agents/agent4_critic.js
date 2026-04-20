/**
 * Agent 4 — Adversarial Critic
 * Attacks each candidate bridge with 3 rejection tests.
 * LLM: Groq Llama 3.3 70B (for diverse perspective from Gemini)
 */
const { callGroq } = require("../lib/groq");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");

async function runAgent4(candidates, brief, maxRetries = 2) {
  let attempt = 0;
  let approvedBridge = null;
  let rejectedBridges = [];

  while (attempt <= maxRetries) {
    const candidatesToTest = attempt === 0
      ? candidates
      : candidates.filter((c) => !rejectedBridges.find((r) => r.field === c.field));

    const prompt = `You are the Adversarial Critic for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}

RESEARCH BRIEF: ${JSON.stringify(brief)}

CANDIDATE BRIDGES TO TEST:
${JSON.stringify(candidatesToTest, null, 2)}

Apply these 3 rejection tests to EACH candidate:

TEST 1 — Domain Name Removal: Remove all field-specific terminology from the analogy. Does the structural parallel still hold? If the analogy only works because of domain-specific language, REJECT.

TEST 2 — Physical Property Check: Does the mechanism require physical/biological/chemical properties that have no computational equivalent? If yes, REJECT.

TEST 3 — Existing Solution Check: Does this exact mechanism already exist in software under a different name? If yes, REJECT (the bridge is not novel).

For the FIRST candidate that passes ALL 3 tests, approve it and provide a translation concept.

Respond with JSON only:
{
  "approvedBridge": {
    "field": "Field name",
    "mechanism": "The mechanism",
    "structuralAnalogy": "Expanded structural analogy (3-4 sentences)",
    "translationConcept": "How to translate this mechanism into software (2-3 sentences)",
    "approvalReason": "Why this passes all 3 tests",
    "sourceUrl": "URL"
  } or null if none pass,
  "rejectedBridges": [
    {
      "field": "Field name",
      "mechanism": "The mechanism",
      "rejectionReason": "Which test failed and why",
      "testFailed": 1 or 2 or 3
    }
  ]
}`;

    const result = await callGroq(prompt, { jsonMode: true, temperature: 0.2 });

    if (result.rejectedBridges) {
      rejectedBridges = [...rejectedBridges, ...result.rejectedBridges];
    }

    if (result.approvedBridge) {
      approvedBridge = result.approvedBridge;
      break;
    }

    attempt++;
  }

  return { approvedBridge, rejectedBridges };
}

module.exports = { runAgent4 };
