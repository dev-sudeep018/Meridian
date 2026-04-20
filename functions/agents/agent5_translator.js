/**
 * Agent 5 — Code Translator
 * Generates technical specification and working Python code.
 * LLM: Gemini 2.5 Flash (code generation)
 */
const { callGemini } = require("../lib/gemini");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");

async function runAgent5(approvedBridge, brief, frustrationData) {
  const prompt = `You are the Code Translator for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}

APPROVED BRIDGE:
${JSON.stringify(approvedBridge, null, 2)}

RESEARCH BRIEF: ${JSON.stringify(brief)}
FRUSTRATION: ${JSON.stringify(frustrationData)}

Your task: Generate TWO things:

1. A technical specification for a Python library that implements the bridge mechanism.
2. A complete, working Python file (single file, < 200 lines) that implements the core algorithm.

RULES FOR THE CODE:
- MUST be syntactically correct Python 3.10+
- Use type hints
- Include inline docstrings
- Use only stdlib + pydantic (no other deps)
- Include 3 test functions (test_* prefix)
- Include an if __name__ == "__main__" block with a demo
- NO placeholders, stubs, or TODO comments

Respond with JSON only:
{
  "specification": {
    "libraryName": "kebab-case name",
    "oneLiner": "One sentence description",
    "coreAlgorithm": "Paragraph explaining the algorithm",
    "apiSurface": [
      { "method": "Class.method()", "params": "param descriptions", "returns": "return type" }
    ],
    "primaryUseCase": "Who uses this and why",
    "limitations": "Known limitations",
    "invalidation": "What would make this approach obsolete"
  },
  "pythonCode": "the complete Python file as a string"
}`;

  return await callGemini(prompt, {
    jsonMode: true,
    temperature: 0.2,
    maxOutputTokens: 8192,
  });
}

module.exports = { runAgent5 };
