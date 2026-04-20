/**
 * Agent 7 — Market Gap Analyst
 * Identifies what competitors are missing.
 * APIs: Tavily (for competitor research)
 * LLM: Gemini 2.5 Flash (synthesis)
 */
const { callGemini } = require("../lib/gemini");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");
const { searchTavily } = require("../apis/tavily");

async function runAgent7(specification, approvedBridge) {
  // Search for existing tools in this space
  const searchQuery = `${specification.libraryName} alternatives ${specification.primaryUseCase}`.substring(0, 120);

  const competitorSearch = await searchTavily(searchQuery, { maxResults: 5 }).catch(() => ({ results: [] }));

  const prompt = `You are the Market Gap Analyst for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}

INNOVATION SPECIFICATION: ${JSON.stringify(specification)}
BRIDGE USED: ${JSON.stringify(approvedBridge)}

COMPETITOR SEARCH RESULTS:
${JSON.stringify(competitorSearch)}

Your task: Identify exactly 3 real competitors (existing tools, frameworks, or libraries) and explain what each one is MISSING that this innovation provides.

Respond with JSON only:
{
  "competitors": [
    {
      "name": "Real product/library name",
      "description": "1 sentence of what it does",
      "specificGap": "What it does NOT do that this innovation does",
      "url": "URL to the product"
    }
  ],
  "marketGap": "2-3 sentences describing the overall gap in the market",
  "gapReason": "1-2 sentences explaining why this gap exists"
}`;

  return await callGemini(prompt, { jsonMode: true, temperature: 0.3 });
}

module.exports = { runAgent7 };
