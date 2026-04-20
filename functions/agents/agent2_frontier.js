/**
 * Agent 2 — Frontier Detector
 * Finds capabilities that became possible in the last 90 days.
 * APIs: arXiv, HuggingFace, Tavily
 * LLM: Gemini 2.5 Flash (synthesis)
 */
const { callGemini } = require("../lib/gemini");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");
const { searchArxiv } = require("../apis/arxiv");
const { searchHuggingFaceModels } = require("../apis/huggingFace");
const { searchTavily } = require("../apis/tavily");

async function runAgent2(brief) {
  const searchQuery = brief.problemStatement.substring(0, 100);

  const [arxivResults, hfResults, tavilyResults] = await Promise.all([
    searchArxiv(searchQuery, { maxResults: 5 }).catch(() => []),
    searchHuggingFaceModels(searchQuery, { limit: 5 }).catch(() => []),
    searchTavily(`new breakthrough ${searchQuery}`, { maxResults: 3 }).catch(() => ({ results: [] })),
  ]);

  const prompt = `You are the Frontier Detector for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}

RESEARCH BRIEF: ${JSON.stringify(brief)}

ARXIV PAPERS (recent): ${JSON.stringify(arxivResults)}
HUGGINGFACE MODELS (recent): ${JSON.stringify(hfResults)}
TAVILY WEB SEARCH: ${JSON.stringify(tavilyResults)}

Your task: Identify a single capability, technique, or tool that became available in the last 90 days AND is directly relevant to the problem in the brief. The capability must exist with real evidence (paper, model, or tool).

Respond with JSON only:
{
  "capabilityName": "Name of the capability",
  "description": "2-3 sentences describing what it does",
  "publicationDate": "YYYY-MM-DD or approximate",
  "weeksAgo": number (how many weeks ago it appeared),
  "sourceUrl": "URL to the paper, model, or tool",
  "sourceType": "arxiv" | "huggingface" | "web",
  "whyRelevant": "2 sentences explaining why this matters for the problem"
}`;

  return await callGemini(prompt, { jsonMode: true, temperature: 0.3 });
}

module.exports = { runAgent2 };
