/**
 * Agent 6 — Code Verifier
 * Checks syntax, logic, tests, and dependencies of generated code.
 * LLM: Groq Llama 3.3 70B (different model for independent verification)
 * Retry loop: up to 3 iterations with Agent 5.
 */
const { callGroq } = require("../lib/groq");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");

async function runAgent6(codeOutput, maxIterations = 3) {
  let currentCode = codeOutput.pythonCode;
  let iteration = 0;
  let lastResult = null;

  while (iteration < maxIterations) {
    const prompt = `You are the Code Verifier for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}

PYTHON CODE TO VERIFY:
\`\`\`python
${currentCode}
\`\`\`

SPECIFICATION:
${JSON.stringify(codeOutput.specification, null, 2)}

Perform these 4 checks:

1. SYNTAX: Is the code syntactically valid Python? Check indentation, colons, brackets.
2. LOGIC: Does the main algorithm actually implement the mechanism described in the spec? Are there logic bugs?
3. TESTS: Do all test functions exist? Do they start with test_? Would they pass if run?
4. DEPENDENCIES: Does the code only use stdlib + pydantic? No other external deps?

Respond with JSON only:
{
  "verdict": "pass" | "fail",
  "checks": {
    "syntax": { "passed": true/false, "details": "..." },
    "logic": { "passed": true/false, "details": "..." },
    "tests": { "passed": true/false, "details": "..." },
    "dependencies": { "passed": true/false, "details": "..." }
  },
  "verifiedCode": "the code (unchanged if passing, or fixed version if you can fix minor issues)",
  "fixesApplied": ["list of fixes made"] or [],
  "githubReady": true/false
}`;

    lastResult = await callGroq(prompt, {
      jsonMode: true,
      temperature: 0.1,
      maxTokens: 4096,
    });

    if (lastResult.verdict === "pass") {
      lastResult.iterations = iteration + 1;
      return lastResult;
    }

    // Use the verified/fixed code for the next iteration
    if (lastResult.verifiedCode) {
      currentCode = lastResult.verifiedCode;
    }

    iteration++;
  }

  // Return last result even if not passing after max iterations
  lastResult.iterations = maxIterations;
  return lastResult;
}

module.exports = { runAgent6 };
