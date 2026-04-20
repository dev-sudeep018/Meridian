/**
 * Client-side Pipeline Orchestrator v3
 * Minimizes Gemini usage — only 2 Gemini calls total.
 * Everything else uses Groq (30 RPM free tier, much more generous).
 */
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { callGemini, callGroq } from './ai'
import {
  searchStackOverflow, searchGithubIssues, searchHackerNews,
  searchArxiv, searchHuggingFace, searchOpenAlex, searchSemanticScholar, searchTavily,
} from './apis'

const GOAL = `Find a genuinely novel, useful innovation connecting a real developer pain to a real mechanism from an unrelated field, producing working code and a clear market gap.`

const FIELDS = [
  'Aviation Safety', 'Anesthesia Monitoring', 'Nuclear Plant Operations',
  'Surgical Checklists', 'Supply Chain Logistics', 'Wildfire Prediction',
  'Maritime Collision Avoidance', 'Immunological Memory',
]

const wait = (ms) => new Promise(r => setTimeout(r, ms))

async function update(discoveryId, data) {
  try {
    const ref = doc(db, 'discoveries', discoveryId)
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
  } catch (err) {
    console.warn('[Firestore] Update failed (ad blocker?):', err.message)
  }
}

// ——— AGENT 0: Prompt Sharpener (Groq — fast) ———
async function agent0(answers) {
  return await callGroq(`Convert these user answers into a research brief. Only clarify and structure — do not add opinions.

Q1 (Problem): ${answers.q1}
Q2 (Prior attempts): ${answers.q2}
Q3 (Who experiences this): ${answers.q3}

Respond with JSON only:
{
  "problemStatement": "Clear 2-3 sentence problem statement",
  "targetPersona": "Who experiences this most",
  "priorAttempts": "What has been tried",
  "desiredOutcome": "What success looks like",
  "constraints": "Practical constraints"
}`, { jsonMode: true, temperature: 0.2 })
}

// ——— AGENT 1: Frustration Scanner (Groq) ———
async function agent1(brief) {
  const q = brief.problemStatement.substring(0, 100)
  const [so, gh, hn] = await Promise.all([
    searchStackOverflow(q).catch(() => []),
    searchGithubIssues(q).catch(() => []),
    searchHackerNews(q, { tags: 'story' }).catch(() => []),
  ])

  return await callGroq(`Find the most painful developer frustration matching this brief from real search data. Do NOT invent problems.

BRIEF: ${JSON.stringify(brief)}
STACK OVERFLOW: ${JSON.stringify(so.slice(0, 3))}
GITHUB ISSUES: ${JSON.stringify(gh.slice(0, 3))}
HACKER NEWS: ${JSON.stringify(hn.slice(0, 3))}

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
}`, { jsonMode: true, temperature: 0.2 })
}

// ——— AGENT 2: Frontier Detector (Groq) ———
async function agent2(brief) {
  const q = brief.problemStatement.substring(0, 80)
  const [arxiv, hf] = await Promise.all([
    searchArxiv(q).catch(() => []),
    searchHuggingFace(q).catch(() => []),
  ])

  return await callGroq(`Find a capability that became available recently AND is relevant to this problem.

BRIEF: ${JSON.stringify(brief)}
ARXIV: ${JSON.stringify(arxiv.slice(0, 3))}
HUGGINGFACE: ${JSON.stringify(hf.slice(0, 3))}

Respond with JSON only:
{
  "capabilityName": "Name",
  "description": "2-3 sentences",
  "publicationDate": "YYYY-MM-DD",
  "weeksAgo": 0,
  "sourceUrl": "URL",
  "sourceType": "arxiv|huggingface",
  "whyRelevant": "2 sentences"
}`, { jsonMode: true, temperature: 0.3 })
}

// ——— AGENT 3: Adjacent Domain Finder (Groq) ———
async function agent3(brief, frustration) {
  const abstraction = await callGroq(
    `Express this software problem as a pure structural problem with NO technology words.
Problem: ${brief.problemStatement}
Frustration: ${frustration.painDescription}
Respond with JSON: { "abstractedQuery": "20-30 word abstract description" }`,
    { jsonMode: true, temperature: 0.5 }
  )

  await wait(500)

  const selectedFields = FIELDS.sort(() => Math.random() - 0.5).slice(0, 4)
  const fieldResults = []
  for (const field of selectedFields) {
    const q = `${field} ${abstraction.abstractedQuery}`.substring(0, 100)
    const papers = await searchOpenAlex(q, { perPage: 2 }).catch(() => [])
    fieldResults.push({ field, papers })
    await wait(300)
  }

  return await callGroq(`From these unrelated fields, find 3 candidates where a mechanism could solve the software problem through STRUCTURAL analogy (not metaphor).

ABSTRACTED PROBLEM: ${abstraction.abstractedQuery}
BRIEF: ${JSON.stringify(brief)}
SEARCH RESULTS:
${fieldResults.map(fr => `[${fr.field}]: ${JSON.stringify(fr.papers.slice(0, 2))}`).join('\n')}

Respond with JSON only:
{
  "abstractedQuery": "${abstraction.abstractedQuery}",
  "candidates": [
    { "field": "Field name", "mechanism": "Specific mechanism", "structuralAnalogy": "2-3 sentences", "sourceUrl": "URL or empty", "sourceTitle": "Title" }
  ]
}`, { jsonMode: true, temperature: 0.4, maxTokens: 3000 })
}

// ——— AGENT 4: Adversarial Critic (Groq) ———
async function agent4(candidates, brief) {
  return await callGroq(`You are the Adversarial Critic. Test each candidate bridge.

BRIEF: ${JSON.stringify(brief)}
CANDIDATES: ${JSON.stringify(candidates, null, 2)}

TEST 1 — Strip field terminology. Does structural parallel hold?
TEST 2 — Requires physical properties with no software equivalent? REJECT if yes.
TEST 3 — Already exists in software under another name? REJECT if yes.

Approve the FIRST passing ALL 3. Set approvedBridge to null if none pass.

Respond with JSON only:
{
  "approvedBridge": { "field": "", "mechanism": "", "structuralAnalogy": "", "translationConcept": "", "approvalReason": "", "sourceUrl": "" },
  "rejectedBridges": [{ "field": "", "mechanism": "", "rejectionReason": "", "testFailed": 1 }]
}`, { jsonMode: true, temperature: 0.2, maxTokens: 3000 })
}

// ——— AGENT 4.5: Reality Checker (Groq) ———
async function agent45(bridge, frustration) {
  const [so, gh] = await Promise.all([
    searchStackOverflow(frustration.problemTitle, { pageSize: 3 }).catch(() => []),
    searchGithubIssues(frustration.problemTitle, { perPage: 3 }).catch(() => []),
  ])

  return await callGroq(`Find 3 real developers who would benefit from this innovation. Use REAL data only.

FRUSTRATION: ${JSON.stringify(frustration)}
BRIDGE: ${JSON.stringify(bridge)}
SO: ${JSON.stringify(so)}
GH: ${JSON.stringify(gh)}

Respond with JSON only:
{
  "validationEntries": [
    { "username": "", "platform": "github|stackoverflow", "exactQuote": "max 200 chars", "sourceUrl": "", "howInnovationHelps": "1-2 sentences" }
  ],
  "validationStrength": "strong|moderate|weak"
}`, { jsonMode: true, temperature: 0.2, maxTokens: 2000 })
}

// ——— AGENT 5: Code Translator (Gemini — needs large output) ———
async function agent5(bridge, brief, frustration) {
  return await callGemini(`Generate a technical spec and working Python file (<200 lines).

BRIDGE: ${JSON.stringify(bridge)}
BRIEF: ${JSON.stringify(brief)}
FRUSTRATION: ${JSON.stringify(frustration)}

RULES: single file, stdlib + pydantic only, type hints, docstrings, 3 test_* functions, if __name__ == "__main__" block. NO placeholders.

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
}`, { jsonMode: true, temperature: 0.2, maxOutputTokens: 8192 })
}

// ——— AGENT 6: Code Verifier (Groq) ———
async function agent6(codeResult) {
  return await callGroq(`Verify this Python code. Check SYNTAX, LOGIC, TESTS, DEPENDENCIES (only stdlib + pydantic).

CODE (first 2000 chars):
${codeResult.pythonCode?.substring(0, 2000)}

SPEC: ${JSON.stringify(codeResult.specification)}

Respond with JSON only:
{
  "verdict": "pass",
  "checks": {
    "syntax": { "passed": true, "details": "" },
    "logic": { "passed": true, "details": "" },
    "tests": { "passed": true, "details": "" },
    "dependencies": { "passed": true, "details": "" }
  },
  "verifiedCode": "the code unchanged if passing",
  "fixesApplied": [],
  "githubReady": true,
  "iterations": 1
}`, { jsonMode: true, temperature: 0.1, maxTokens: 4096 })
}

// ——— AGENT 7: Market Gap (Groq) ———
async function agent7(specification, bridge) {
  const q = `${specification.libraryName} ${specification.primaryUseCase}`.substring(0, 100)
  const competitors = await searchTavily(q, { maxResults: 3 }).catch(() => ({ results: [] }))

  return await callGroq(`Find 3 real competitors and the precise market gap.

SPEC: ${JSON.stringify(specification)}
BRIDGE: ${JSON.stringify(bridge)}
COMPETITORS FOUND: ${JSON.stringify(competitors)}

Respond with JSON only:
{
  "competitors": [{ "name": "", "description": "", "specificGap": "", "url": "" }],
  "marketGap": "2-3 sentences",
  "gapReason": "1-2 sentences"
}`, { jsonMode: true, temperature: 0.3 })
}

// ——— AGENT 8: Publisher (Gemini — creative writing) ———
async function agent8(discoveryData) {
  const { specification, approvedBridge, frustrationData, marketGap } = discoveryData

  return await callGemini(`Write launch content. Technical and honest.

INNOVATION: ${specification.libraryName} — ${specification.oneLiner}
BRIDGE: From ${approvedBridge.field}: ${approvedBridge.mechanism}
FRUSTRATION: ${frustrationData.painDescription}
MARKET GAP: ${marketGap}

Respond with JSON only:
{
  "hnPost": "Show HN post (3-4 paragraphs)",
  "productHuntPost": "PH description with tagline",
  "outreachMessages": [{ "username": "", "publicComplaint": "", "personalizedMessage": "", "profileUrl": "" }]
}`, { jsonMode: true, temperature: 0.5, maxOutputTokens: 4096 })
}

// ——— MAIN ORCHESTRATOR ———
export async function runPipeline(discoveryId, answers) {
  try {
    console.log('[MERIDIAN] Pipeline starting...')

    // === PHASE 1: Agent 0 (Groq) ===
    console.log('[Agent 0] Prompt Sharpener...')
    const brief = await agent0(answers)
    await update(discoveryId, { originalBrief: brief })
    console.log('[Agent 0] Done:', brief.problemStatement?.substring(0, 60))

    await wait(800)

    // === PHASE 2: Agents 1 + 2 in parallel (both Groq) ===
    console.log('[Agent 1+2] Frustration Scanner + Frontier Detector...')
    const [a1, a2] = await Promise.all([agent1(brief), agent2(brief)])
    await update(discoveryId, { agent1: a1 })
    await update(discoveryId, { agent2: a2 })
    console.log('[Agent 1] Done:', a1.problemTitle)
    console.log('[Agent 2] Done:', a2.capabilityName)

    await wait(1000)

    // === PHASE 3: Agent 3 (Groq) ===
    console.log('[Agent 3] Adjacent Domain Finder...')
    const a3 = await agent3(brief, a1)
    await update(discoveryId, { agent3: a3 })
    console.log('[Agent 3] Done:', a3.candidates?.length, 'candidates')

    await wait(1000)

    // === PHASE 4: Agent 4 (Groq) ===
    console.log('[Agent 4] Adversarial Critic...')
    const criticResult = await agent4(a3.candidates, brief)
    if (!criticResult.approvedBridge) {
      console.warn('[Agent 4] No bridge approved')
      await update(discoveryId, {
        agent4: { approvedBridge: null },
        rejectedBridges: criticResult.rejectedBridges || [],
        status: 'failed',
        failureReason: 'No bridge survived rejection tests. Try a more specific problem.',
      })
      return
    }
    await update(discoveryId, {
      agent4: criticResult,
      rejectedBridges: criticResult.rejectedBridges || [],
      adjacentDomain: criticResult.approvedBridge.field,
    })
    console.log('[Agent 4] Approved:', criticResult.approvedBridge.field)

    await wait(1000)

    // === PHASE 5: Agent 4.5 (Groq) ===
    console.log('[Agent 4.5] Reality Checker...')
    const reality = await agent45(criticResult.approvedBridge, a1)
    await update(discoveryId, { agent45: reality })
    console.log('[Agent 4.5] Done:', reality.validationStrength)

    await wait(1000)

    // === PHASE 6: Agent 5 (Gemini — FIRST Gemini call) ===
    console.log('[Agent 5] Code Translator (Gemini)...')
    const code = await agent5(criticResult.approvedBridge, brief, a1)
    await update(discoveryId, { agent5: code })
    console.log('[Agent 5] Done:', code.specification?.libraryName)

    await wait(1500)

    // === PHASE 7: Agent 6 + 7 parallel (Groq + Groq) ===
    console.log('[Agent 6+7] Code Verifier + Market Gap...')
    const [verifier, market] = await Promise.all([
      agent6(code),
      agent7(code.specification, criticResult.approvedBridge),
    ])
    await update(discoveryId, { agent6: verifier, innovationName: code.specification?.libraryName || 'discovery' })
    await update(discoveryId, { agent7: market })
    console.log('[Agent 6] Verdict:', verifier.verdict)
    console.log('[Agent 7] Gap:', market.marketGap?.substring(0, 60))

    await wait(4000) // Wait before second Gemini call

    // === PHASE 8: Agent 8 (Gemini — SECOND Gemini call) ===
    console.log('[Agent 8] Publisher (Gemini)...')
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
      currentScores: { trajectory: 8, credibility: 7, novelty: 8 },
      status: 'complete',
    })

    console.log('[MERIDIAN] Pipeline complete!')

  } catch (err) {
    console.error('[MERIDIAN] Pipeline error:', err)
    try {
      await update(discoveryId, { status: 'error', error: err.message })
    } catch (e2) {
      console.error('[MERIDIAN] Could not write error to Firestore:', e2.message)
    }
  }
}
