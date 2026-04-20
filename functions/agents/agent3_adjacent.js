/**
 * Agent 3 — Adjacent Domain Finder
 * Searches 10 unrelated fields for structural analogies.
 * APIs: OpenAlex, Semantic Scholar
 * LLM: Gemini 2.5 Flash (abstraction + search)
 */
const { callGemini } = require("../lib/gemini");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");
const { searchOpenAlex } = require("../apis/openAlex");
const { searchSemanticScholar } = require("../apis/semanticScholar");

const FIELDS = [
  "Aviation Safety", "Anesthesia Monitoring", "Nuclear Plant Operations",
  "Jazz Improvisation", "Ant Colony Optimization", "Origami Engineering",
  "Immunology", "Supply Chain Logistics", "Wildfire Prediction",
  "Fermentation Science",
];

async function runAgent3(brief, frustrationData) {
  // Step 1: Abstract the problem with Gemini
  const abstractionPrompt = `Take this software engineering problem and express it as a pure structural/functional problem with NO technology words.
  
Problem: ${brief.problemStatement}
Frustration: ${frustrationData.painDescription}

Respond with JSON: { "abstractedQuery": "the problem expressed abstractly in 20-30 words" }`;

  const { abstractedQuery } = await callGemini(abstractionPrompt, { jsonMode: true, temperature: 0.5 });

  // Step 2: Search each field in parallel
  const fieldSearches = FIELDS.map(async (field) => {
    const query = `${field} ${abstractedQuery}`.substring(0, 120);
    
    const [oaResults, ssResults] = await Promise.all([
      searchOpenAlex(query, { perPage: 2 }).catch(() => []),
      searchSemanticScholar(query, { limit: 2 }).catch(() => []),
    ]);

    return { field, papers: [...oaResults, ...ssResults] };
  });

  const fieldResults = await Promise.all(fieldSearches);

  // Step 3: Ask Gemini to find the 3 best structural analogies
  const synthesisPrompt = `You are the Adjacent Domain Finder for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}

ABSTRACTED PROBLEM: ${abstractedQuery}

ORIGINAL BRIEF: ${JSON.stringify(brief)}

SEARCH RESULTS BY FIELD:
${fieldResults.map((fr) => `\n[${fr.field}]: ${JSON.stringify(fr.papers.slice(0, 2))}`).join("\n")}

Your task: From these 10 unrelated fields, find exactly 3 candidates where a mechanism from that field could solve the software problem through structural analogy. The analogy must be STRUCTURAL (same pattern, different domain), not metaphorical.

Respond with JSON only:
{
  "abstractedQuery": "${abstractedQuery}",
  "candidates": [
    {
      "field": "Field name",
      "mechanism": "The specific mechanism/protocol/technique from that field",
      "structuralAnalogy": "2-3 sentences explaining the STRUCTURAL parallel",
      "sourceUrl": "URL to the paper or source",
      "sourceTitle": "Title of the source paper"
    }
  ]
}

Return exactly 3 candidates, ordered by strength of structural analogy.`;

  return await callGemini(synthesisPrompt, { jsonMode: true, temperature: 0.4 });
}

module.exports = { runAgent3 };
