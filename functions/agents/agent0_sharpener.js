/**
 * Agent 0 — Prompt Sharpener
 * Takes raw user answers and produces a structured research brief.
 * LLM: Gemini 2.5 Flash
 */
const { callGemini } = require("../lib/gemini");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");

async function runAgent0(userAnswers) {
  const prompt = `You are the Prompt Sharpener for MERIDIAN, an autonomous innovation discovery system.

GOAL ANCHOR: ${GOAL_ANCHOR}

USER ANSWERS:
Q1 (Problem): ${userAnswers.q1}
Q2 (Prior attempts): ${userAnswers.q2}
Q3 (Target persona): ${userAnswers.q3}

Your task: Convert these raw answers into a precision research brief. Do NOT add opinions or innovations. Only clarify, structure, and remove ambiguity.

Respond with JSON only:
{
  "problemStatement": "A clear, specific problem statement in 2-3 sentences",
  "targetPersona": "Who experiences this most (specific role, not generic)",
  "priorAttempts": "What has been tried and why it falls short",
  "desiredOutcome": "What success looks like in concrete terms",
  "constraints": "Technical or practical constraints to respect"
}`;

  return await callGemini(prompt, { jsonMode: true, temperature: 0.2 });
}

module.exports = { runAgent0 };
