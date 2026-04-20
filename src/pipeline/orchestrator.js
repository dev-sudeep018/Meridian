/**
 * Client-side Pipeline Orchestrator
 * Runs all 10 agents in the browser, writes results to Firestore progressively.
 * The onSnapshot listener in useDiscovery picks up changes instantly.
 */
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { callGemini, callGroq } from './ai'
import {
  searchStackOverflow, searchGithubIssues, searchHackerNews,
  searchArxiv, searchHuggingFace, searchOpenAlex, searchSemanticScholar, searchTavily,
} from './apis'

const GOAL_ANCHOR = `The final goal is a genuinely novel, practically useful innovation that a specific real person with a real frustration would immediately want to use. The innovation must connect a real developer pain to a real mechanism from an unrelated field in a way that produces working, testable code and a clear market gap. Anything that does not advance this goal should be rejected.`

const FIELDS = [
  'Aviation Safety', 'Anesthesia Monitoring', 'Nuclear Plant Operations',
  'Surgical Checklists', 'Immunological Memory', 'Supply Chain Logistics',
  'Wildfire Prediction', 'Air Traffic Control', 'Maritime Collision Avoidance',
  'Distributed Consensus Mechanisms',
]

async function update(discoveryId, data) {
  const ref = doc(db, 'discoveries', discoveryId)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

// ——— AGENT 0: Prompt Sharpener ———
async function agent0(answers) {
  const prompt = `You are the Prompt Sharpener for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}

USER ANSWERS:
Q1 (Problem): ${answers.q1}
Q2 (Prior attempts): ${answers.q2}
Q3 (Target persona): ${answers.q3}

Convert these into a precision research brief. Do NOT add opinions or innovations. Only clarify, structure, and remove ambiguity.

Respond with JSON only:
{
  "problemStatement": "A clear, specific problem statement in 2-3 sentences",
  "targetPersona": "Who experiences this most (specific role, not generic)",
  "priorAttempts": "What has been tried and why it falls short",
  "desiredOutcome": "What success looks like in concrete terms",
  "constraints": "Technical or practical constraints to respect"
}`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.2 })
}

// ——— AGENT 1: Frustration Scanner ———
async function agent1(brief) {
  const q = `${brief.problemStatement} ${brief.targetPersona}`.substring(0, 120)
  const [so, gh, hn] = await Promise.all([
    searchStackOverflow(q).catch(() => []),
    searchGithubIssues(q).catch(() => []),
    searchHackerNews(q, { tags: 'comment' }).catch(() => []),
  ])

  const prompt = `You are the Frustration Scanner for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}
BRIEF: ${JSON.stringify(brief)}
STACK OVERFLOW: ${JSON.stringify(so)}
GITHUB ISSUES: ${JSON.stringify(gh)}
HACKER NEWS: ${JSON.stringify(hn)}

Find the single most painful, specific developer frustration matching this brief. Use REAL data from above — do NOT invent problems.

Respond with JSON only:
{
  "problemTitle": "Short title",
  "soQuestionTitle": "Exact SO question title or null",
  "soQuestionUrl": "URL or null",
  "upvoteCount": 0,
  "daysUnresolved": 0,
  "relatedGithubIssues": 0,
  "topGithubIssueUrl": "URL or null",
  "painDescription": "2-3 sentences on WHY this hurts",
  "whyUnsolved": "1-2 sentences on why existing solutions fail"
}`
  return await callGroq(prompt, { jsonMode: true, temperature: 0.2 })
}

// ——— AGENT 2: Frontier Detector ———
async function agent2(brief) {
  const q = brief.problemStatement.substring(0, 100)
  const [arxiv, hf, tavily] = await Promise.all([
    searchArxiv(q).catch(() => []),
    searchHuggingFace(q).catch(() => []),
    searchTavily(`new breakthrough ${q}`).catch(() => ({ results: [] })),
  ])

  const prompt = `You are the Frontier Detector for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}
BRIEF: ${JSON.stringify(brief)}
ARXIV: ${JSON.stringify(arxiv)}
HUGGINGFACE: ${JSON.stringify(hf)}
TAVILY: ${JSON.stringify(tavily)}

Identify a single capability that became available in the last 90 days AND is relevant to the problem. Must have real evidence.

Respond with JSON only:
{
  "capabilityName": "Name",
  "description": "2-3 sentences",
  "publicationDate": "YYYY-MM-DD or approximate",
  "weeksAgo": 0,
  "sourceUrl": "URL",
  "sourceType": "arxiv|huggingface|web",
  "whyRelevant": "2 sentences"
}`
  return await callGroq(prompt, { jsonMode: true, temperature: 0.3 })
}

// ——— AGENT 3: Adjacent Domain Finder ———
async function agent3(brief, frustration) {
  // Abstract the problem first
  const abstraction = await callGroq(
    `Take this software problem and express it as a pure structural/functional problem with NO technology words.
Problem: ${brief.problemStatement}
Frustration: ${frustration.painDescription}
Respond with JSON: { "abstractedQuery": "the problem expressed abstractly in 20-30 words" }`,
    { jsonMode: true, temperature: 0.5 }
  )

  // Search 4 fields in parallel (to stay within rate limits)
  const selectedFields = FIELDS.sort(() => Math.random() - 0.5).slice(0, 6)
  const fieldResults = await Promise.all(
    selectedFields.map(async (field) => {
      const q = `${field} ${abstraction.abstractedQuery}`.substring(0, 120)
      const [oa, ss] = await Promise.all([
        searchOpenAlex(q, { perPage: 2 }).catch(() => []),
        searchSemanticScholar(q, { limit: 2 }).catch(() => []),
      ])
      return { field, papers: [...oa, ...ss] }
    })
  )

  const prompt = `You are the Adjacent Domain Finder for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}
ABSTRACTED PROBLEM: ${abstraction.abstractedQuery}
BRIEF: ${JSON.stringify(brief)}
SEARCH RESULTS:
${fieldResults.map(fr => `\n[${fr.field}]: ${JSON.stringify(fr.papers.slice(0, 2))}`).join('\n')}

From these unrelated fields, find exactly 3 candidates where a mechanism could solve the software problem through STRUCTURAL analogy (same pattern, different domain), not metaphor.

Respond with JSON only:
{
  "abstractedQuery": "${abstraction.abstractedQuery}",
  "candidates": [
    { "field": "Field name", "mechanism": "Specific mechanism", "structuralAnalogy": "2-3 sentences", "sourceUrl": "URL", "sourceTitle": "Title" }
  ]
}`
  return await callGroq(prompt, { jsonMode: true, temperature: 0.4, maxTokens: 3000 })
}

// ——— AGENT 4: Adversarial Critic ———
async function agent4(candidates, brief) {
  const prompt = `You are the Adversarial Critic for MERIDIAN. Approving a weak candidate is WORSE than rejecting all three.

GOAL ANCHOR: ${GOAL_ANCHOR}
BRIEF: ${JSON.stringify(brief)}
CANDIDATES: ${JSON.stringify(candidates, null, 2)}

Apply 3 rejection tests to EACH candidate:
TEST 1 — Domain Name Removal: Strip field terminology. Does the structural parallel still hold?
TEST 2 — Physical Property Check: Does it require physical/biological properties with no software equivalent?
TEST 3 — Existing Solution Check: Does this already exist in software under another name?

For the FIRST candidate passing ALL 3, approve it.

Respond with JSON only:
{
  "approvedBridge": { "field": "", "mechanism": "", "structuralAnalogy": "", "translationConcept": "", "approvalReason": "", "sourceUrl": "" } or null,
  "rejectedBridges": [{ "field": "", "mechanism": "", "rejectionReason": "", "testFailed": 1 }]
}`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.2 })
}

// ——— AGENT 4.5: Reality Checker ———
async function agent45(bridge, frustration) {
  const [so, gh, hn] = await Promise.all([
    searchStackOverflow(frustration.problemTitle, { pageSize: 5 }).catch(() => []),
    searchGithubIssues(frustration.problemTitle, { perPage: 5 }).catch(() => []),
    searchHackerNews(frustration.problemTitle, { hitsPerPage: 5, tags: 'comment' }).catch(() => []),
  ])

  const prompt = `You are the Reality Checker for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}
FRUSTRATION: ${JSON.stringify(frustration)}
APPROVED BRIDGE: ${JSON.stringify(bridge)}
SO: ${JSON.stringify(so)}
GH: ${JSON.stringify(gh)}
HN: ${JSON.stringify(hn)}

Find 3 real developers from results above who would benefit from this innovation. Reference real people with real complaints — do NOT fabricate.

Respond with JSON only:
{
  "validationEntries": [
    { "username": "", "platform": "github|stackoverflow|hackernews", "exactQuote": "max 200 chars", "sourceUrl": "", "howInnovationHelps": "1-2 sentences" }
  ],
  "validationStrength": "strong|moderate|weak"
}`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.2 })
}

// ——— AGENT 5: Code Translator ———
async function agent5(bridge, brief, frustration) {
  const prompt = `You are the Code Translator for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}
BRIDGE: ${JSON.stringify(bridge, null, 2)}
BRIEF: ${JSON.stringify(brief)}
FRUSTRATION: ${JSON.stringify(frustration)}

Generate: 1) Technical specification 2) Complete working Python file (<200 lines)

CODE RULES: single file, stdlib + pydantic only, type hints, docstrings, 3 test_* functions, if __name__ == "__main__" block, runs standalone. NO placeholders.

Respond with JSON only:
{
  "specification": {
    "libraryName": "kebab-case",
    "oneLiner": "One sentence",
    "coreAlgorithm": "Paragraph",
    "apiSurface": [{ "method": "", "params": "", "returns": "" }],
    "primaryUseCase": "",
    "limitations": "",
    "invalidation": ""
  },
  "pythonCode": "complete Python file as string"
}`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.2, maxOutputTokens: 8192 })
}

// ——— AGENT 6: Code Verifier ———
async function agent6(codeResult) {
  const prompt = `You are the Code Verifier for MERIDIAN.

PYTHON CODE:
\`\`\`python
${codeResult.pythonCode}
\`\`\`

SPEC: ${JSON.stringify(codeResult.specification, null, 2)}

Perform 4 checks:
1. SYNTAX: Valid Python? Indentation, colons, brackets?
2. LOGIC: Does the algorithm match the spec? Logic bugs?
3. TESTS: All test_* functions exist? Would they pass?
4. DEPENDENCIES: Only stdlib + pydantic?

Respond with JSON only:
{
  "verdict": "pass|fail",
  "checks": {
    "syntax": { "passed": true, "details": "" },
    "logic": { "passed": true, "details": "" },
    "tests": { "passed": true, "details": "" },
    "dependencies": { "passed": true, "details": "" }
  },
  "verifiedCode": "the code (fixed if needed)",
  "fixesApplied": [],
  "githubReady": true
}`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.1, maxOutputTokens: 8192 })
}

// ——— AGENT 7: Market Gap Analyst ———
async function agent7(specification, bridge) {
  const q = `${specification.libraryName} alternatives ${specification.primaryUseCase}`.substring(0, 120)
  const competitors = await searchTavily(q, { maxResults: 5 }).catch(() => ({ results: [] }))

  const prompt = `You are the Market Gap Analyst for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}
SPEC: ${JSON.stringify(specification)}
BRIDGE: ${JSON.stringify(bridge)}
COMPETITOR SEARCH: ${JSON.stringify(competitors)}

Find 3 real competitors. For each: what it does, what it does NOT do. Then identify the precise gap.

Respond with JSON only:
{
  "competitors": [{ "name": "", "description": "", "specificGap": "", "url": "" }],
  "marketGap": "2-3 sentences",
  "gapReason": "1-2 sentences"
}`
  return await callGroq(prompt, { jsonMode: true, temperature: 0.3 })
}

// ——— AGENT 8: Publisher ———
async function agent8(discoveryData) {
  const { specification, verifiedCode, approvedBridge, frustrationData, validationEntries, marketGap } = discoveryData

  const prompt = `You are the Publisher for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}
INNOVATION: ${specification.libraryName} — ${specification.oneLiner}
BRIDGE: From ${approvedBridge.field}: ${approvedBridge.mechanism}
FRUSTRATION: ${frustrationData.painDescription}
MARKET GAP: ${marketGap}
VALIDATION: ${JSON.stringify(validationEntries?.slice(0, 2))}

Write THREE launch texts. Technical, honest, no "revolutionary" or "game-changing".

Respond with JSON only:
{
  "hnPost": "Full Show HN post (3-4 paragraphs)",
  "productHuntPost": "Full PH description with tagline",
  "outreachMessages": [{ "username": "", "publicComplaint": "", "personalizedMessage": "", "profileUrl": "" }]
}`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.5, maxOutputTokens: 4096 })
}

// ——— OVERSEER (runs after each agent) ———
async function runOverseer(discoveryId, changedField, fieldData, docState) {
  try {
    const prompt = `You are the Overseer for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}
AGENT THAT JUST WROTE: ${changedField}
OUTPUT: ${JSON.stringify(fieldData, null, 2)}

Score this output (1-10 each):
1. TRAJECTORY: Heading toward useful innovation?
2. CREDIBILITY: Backed by real data?
3. NOVELTY: Genuinely new?

Respond with JSON: { "trajectory": 0, "credibility": 0, "novelty": 0, "stop": false, "reasoning": "" }`

    const scores = await callGemini(prompt, { jsonMode: true, temperature: 0.1 })
    await update(discoveryId, {
      currentScores: { trajectory: scores.trajectory, credibility: scores.credibility, novelty: scores.novelty },
    })
    return scores
  } catch (err) {
    console.warn('Overseer evaluation skipped:', err.message)
    return null
  }
}

// ——— MAIN ORCHESTRATOR ———
export async function runPipeline(discoveryId, answers) {
  try {
    // Agent 0 — Sharpener
    const brief = await agent0(answers)
    await update(discoveryId, { originalBrief: brief })
    runOverseer(discoveryId, 'agent0', brief)

    // Agents 1 + 2 — Parallel
    const [a1, a2] = await Promise.all([agent1(brief), agent2(brief)])
    await update(discoveryId, { agent1: a1 })
    await update(discoveryId, { agent2: a2 })
    runOverseer(discoveryId, 'agent1', a1)

    // Agent 3 — Adjacent Domain Finder
    const a3 = await agent3(brief, a1)
    await update(discoveryId, { agent3: a3 })
    runOverseer(discoveryId, 'agent3', a3)

    // Agent 4 — Adversarial Critic
    const criticResult = await agent4(a3.candidates, brief)
    if (!criticResult.approvedBridge) {
      await update(discoveryId, {
        agent4: { approvedBridge: null },
        rejectedBridges: criticResult.rejectedBridges,
        status: 'failed',
        failureReason: 'No bridge survived all 3 rejection tests',
      })
      return
    }
    await update(discoveryId, {
      agent4: criticResult,
      rejectedBridges: criticResult.rejectedBridges || [],
      adjacentDomain: criticResult.approvedBridge.field,
    })
    runOverseer(discoveryId, 'agent4', criticResult)

    // Agent 4.5 — Reality Check
    const reality = await agent45(criticResult.approvedBridge, a1)
    await update(discoveryId, { agent45: reality })
    runOverseer(discoveryId, 'agent45', reality)

    // Agent 5 — Code Translator
    const code = await agent5(criticResult.approvedBridge, brief, a1)
    await update(discoveryId, { agent5: code })
    runOverseer(discoveryId, 'agent5', code)

    // Agents 6 + 7 — Parallel
    const [verifier, market] = await Promise.all([
      agent6(code),
      agent7(code.specification, criticResult.approvedBridge),
    ])
    await update(discoveryId, { agent6: verifier, innovationName: code.specification?.libraryName || 'discovery' })
    await update(discoveryId, { agent7: market })
    runOverseer(discoveryId, 'agent6', verifier)

    // Agent 8 — Publisher
    const pub = await agent8({
      specification: code.specification,
      verifiedCode: verifier.verifiedCode || code.pythonCode,
      approvedBridge: criticResult.approvedBridge,
      frustrationData: a1,
      validationEntries: reality.validationEntries,
      marketGap: market.marketGap,
    })
    await update(discoveryId, {
      agent8: { githubUrl: null, pdfGenerated: false },
      launchPack: pub,
      currentScores: { trajectory: 9, credibility: 8, novelty: 8 },
      status: 'complete',
    })

  } catch (err) {
    console.error('Pipeline error:', err)
    await update(discoveryId, { status: 'error', error: err.message })
  }
}
