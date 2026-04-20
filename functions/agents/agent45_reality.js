/**
 * Agent 4.5 — Reality Checker
 * Finds real developers who need exactly this innovation.
 * APIs: Stack Overflow, GitHub, HN (re-search with innovation-specific queries)
 * LLM: Gemini 2.5 Flash (synthesis)
 */
const { callGemini } = require("../lib/gemini");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");
const { searchStackOverflow } = require("../apis/stackOverflow");
const { searchGithubIssues } = require("../apis/github");
const { searchHackerNews } = require("../apis/hackerNews");

async function runAgent45(approvedBridge, frustrationData) {
  // Build a targeted query from the approved bridge
  const query = `${frustrationData.problemTitle} ${approvedBridge.mechanism}`.substring(0, 100);

  const [soResults, ghResults, hnResults] = await Promise.all([
    searchStackOverflow(frustrationData.problemTitle, { pageSize: 5 }).catch(() => []),
    searchGithubIssues(frustrationData.problemTitle, { perPage: 5 }).catch(() => []),
    searchHackerNews(frustrationData.problemTitle, { hitsPerPage: 5, tags: "comment" }).catch(() => []),
  ]);

  const prompt = `You are the Reality Checker for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}

FRUSTRATION: ${JSON.stringify(frustrationData)}
APPROVED BRIDGE: ${JSON.stringify(approvedBridge)}

STACK OVERFLOW RESULTS: ${JSON.stringify(soResults)}
GITHUB ISSUES: ${JSON.stringify(ghResults)}
HACKER NEWS COMMENTS: ${JSON.stringify(hnResults)}

Your task: Find exactly 3 real developers from the search results above who would benefit from this innovation. Each entry MUST reference a real person with a real public complaint. Do NOT fabricate usernames or quotes.

Respond with JSON only:
{
  "validationEntries": [
    {
      "username": "their actual username",
      "platform": "github" | "stackoverflow" | "hackernews",
      "exactQuote": "A real quote from their post/comment (max 200 chars)",
      "sourceUrl": "Direct URL to the post/comment",
      "howInnovationHelps": "1-2 sentences on how this specific innovation solves their specific complaint"
    }
  ],
  "validationStrength": "strong" | "moderate" | "weak"
}`;

  return await callGemini(prompt, { jsonMode: true, temperature: 0.2 });
}

module.exports = { runAgent45 };
