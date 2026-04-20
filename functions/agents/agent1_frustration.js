/**
 * Agent 1 — Frustration Scanner
 * Searches SO, GitHub Issues, and HN for real developer pain.
 * APIs: Stack Overflow, GitHub Issues, Algolia HN
 * LLM: Gemini 2.5 Flash (synthesis)
 */
const { callGemini } = require("../lib/gemini");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");
const { searchStackOverflow } = require("../apis/stackOverflow");
const { searchGithubIssues } = require("../apis/github");
const { searchHackerNews } = require("../apis/hackerNews");

async function runAgent1(brief) {
  // Step 1: Search all three sources in parallel
  const searchQuery = `${brief.problemStatement} ${brief.targetPersona}`.substring(0, 120);

  const [soResults, ghResults, hnResults] = await Promise.all([
    searchStackOverflow(searchQuery, { pageSize: 5 }).catch(() => []),
    searchGithubIssues(searchQuery, { perPage: 5 }).catch(() => []),
    searchHackerNews(searchQuery, { hitsPerPage: 5, tags: "comment" }).catch(() => []),
  ]);

  // Step 2: Synthesize with Gemini
  const prompt = `You are the Frustration Scanner for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}

RESEARCH BRIEF: ${JSON.stringify(brief)}

STACK OVERFLOW RESULTS: ${JSON.stringify(soResults)}
GITHUB ISSUES: ${JSON.stringify(ghResults)}
HACKER NEWS COMMENTS: ${JSON.stringify(hnResults)}

Your task: Find the single most painful, specific, and well-documented developer frustration that matches this brief. Pick the frustration with the most evidence (upvotes, reactions, comments). It MUST be a real problem from the data above — do NOT invent problems.

Respond with JSON only:
{
  "problemTitle": "Short title for the frustration",
  "soQuestionTitle": "Exact title of the best SO question (or null)",
  "soQuestionUrl": "URL (or null)",
  "upvoteCount": number,
  "daysUnresolved": number (days since creation to today),
  "relatedGithubIssues": number of related GH issues found,
  "topGithubIssueUrl": "URL of top GH issue (or null)",
  "painDescription": "2-3 sentences describing WHY this hurts",
  "whyUnsolved": "1-2 sentences on why existing solutions fail"
}`;

  return await callGemini(prompt, { jsonMode: true, temperature: 0.2 });
}

module.exports = { runAgent1 };
