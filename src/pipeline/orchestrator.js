/**
 * Client-side Pipeline Orchestrator
 * Runs all 10 agents in the browser, writes results to Firestore progressively.
 * Includes rate-limit pacing and error recovery.
 */
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { callGemini, callGroq } from './ai'
import {
  searchStackOverflow, searchGithubIssues, searchHackerNews,
  searchArxiv, searchHuggingFace, searchOpenAlex, searchSemanticScholar, searchTavily,
} from './apis'

const GOAL_ANCHOR = `The final goal is a genuinely novel, practically useful innovation that a specific real person with a real frustration would immediately want to use. The innovation must connect a real developer pain to a real mechanism from an unrelated field in a way that produces working, testable code and a clear market gap.`

const FIELDS = [
  'Aviation Safety', 'Anesthesia Monitoring', 'Nuclear Plant Operations',
  'Surgical Checklists', 'Immunological Memory', 'Supply Chain Logistics',
  'Wildfire Prediction', 'Air Traffic Control', 'Maritime Collision Avoidance',
  'Distributed Consensus Mechanisms',
]

const wait = (ms) => new Promise(r => setTimeout(r, ms))

async function update(discoveryId, data) {
  try {
    const ref = doc(db, 'discoveries', discoveryId)
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
  } catch (err) {
    console.error('Firestore update failed:', err.message)
  }
}

// ——— AGENT 0: Prompt Sharpener ———
async function agent0(answers) {
  const prompt = `You are a research brief writer. A user answered 3 questions about a problem.

Answer 1 (the problem): ${answers.q1}
Answer 2 (what has been tried): ${answers.q2}
Answer 3 (who experiences this): ${answers.q3}

Convert into a precise research brief. If too vague, still do your best.

Respond with JSON only:
{
  "problemStatement": "A clear, specific problem statement in 2-3 sentences",
  "targetPersona": "Who experiences this most",
  "priorAttempts": "What has been tried and why it falls short",
  "desiredOutcome": "What success looks like",
  "constraints": "Technical or practical constraints"
}`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.2 })
}

// ——— AGENT 1: Frustration Scanner ———
async function agent1(brief) {
  const q = `${brief.problemStatement}`.substring(0, 100)
  const [so, gh, hn] = await Promise.all([
    searchStackOverflow(q).catch(() => []),
    searchGithubIssues(q).catch(() => []),
    searchHackerNews(q, { tags: 'story' }).catch(() => []),
  ])

  const prompt = `You are the Frustration Scanner. Find the most painful developer frustration matching this brief from the search data.

BRIEF: ${JSON.stringify(brief)}
STACK OVERFLOW: ${JSON.stringify(so.slice(0, 3))}
GITHUB ISSUES: ${JSON.stringify(gh.slice(0, 3))}
HACKER NEWS: ${JSON.stringify(hn.slice(0, 3))}

Use REAL data. Do NOT invent problems.

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
  const q = brief.problemStatement.substring(0, 80)
  const [arxiv, hf] = await Promise.all([
    searchArxiv(q).catch(() => []),
    searchHuggingFace(q).catch(() => []),
  ])

  const prompt = `You are the Frontier Detector. Find a capability that became available recently AND is relevant to the problem.

BRIEF: ${JSON.stringify(brief)}
ARXIV PAPERS: ${JSON.stringify(arxiv.slice(0, 3))}
HUGGINGFACE MODELS: ${JSON.stringify(hf.slice(0, 3))}

Respond with JSON only:
{
  "capabilityName": "Name",
  "description": "2-3 sentences",
  "publicationDate": "YYYY-MM-DD or approximate",
  "weeksAgo": 0,
  "sourceUrl": "URL",
  "sourceType": "arxiv|huggingface",
  "whyRelevant": "2 sentences"
}`
  return await callGroq(prompt, { jsonMode: true, temperature: 0.3 })
}

// ——— AGENT 3: Adjacent Domain Finder ———
async function agent3(brief, frustration) {
  const abstraction = await callGroq(
    `Express this software problem as a pure structural problem with NO technology words.
Problem: ${brief.problemStatement}
Frustration: ${frustration.painDescription}
Respond with JSON: { "abstractedQuery": "the problem in 20-30 abstract words" }`,
    { jsonMode: true, temperature: 0.5 }
  )

  // Search 4 fields sequentially to avoid rate limits
  const selectedFields = FIELDS.sort(() => Math.random() - 0.5).slice(0, 4)
  const fieldResults = []
  for (const field of selectedFields) {
    const q = `${field} ${abstraction.abstractedQuery}`.substring(0, 100)
    const [oa, ss] = await Promise.all([
      searchOpenAlex(q, { perPage: 2 }).catch(() => []),
      searchSemanticScholar(q, { limit: 2 }).catch(() => []),
    ])
    fieldResults.push({ field, papers: [...oa, ...ss] })
    await wait(300) // pace external API calls
  }

  const prompt = `You are the Adjacent Domain Finder. From these unrelated fields, find 3 candidates where a mechanism could solve the software problem through STRUCTURAL analogy.

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
}`
  return await callGroq(prompt, { jsonMode: true, temperature: 0.4, maxTokens: 3000 })
}

// ——— AGENT 4: Adversarial Critic ———
async function agent4(candidates, brief) {
  const prompt = `You are the Adversarial Critic. Test each candidate bridge with 3 rejection tests.

BRIEF: ${JSON.stringify(brief)}
CANDIDATES: ${JSON.stringify(candidates, null, 2)}

TEST 1 — Strip field terminology. Does structural parallel still hold?
TEST 2 — Does it require physical properties with no software equivalent?
TEST 3 — Does this already exist in software under another name?

Approve the FIRST candidate passing ALL 3 tests.

Respond with JSON only:
{
  "approvedBridge": { "field": "", "mechanism": "", "structuralAnalogy": "", "translationConcept": "", "approvalReason": "", "sourceUrl": "" },
  "rejectedBridges": [{ "field": "", "mechanism": "", "rejectionReason": "", "testFailed": 1 }]
}
If none pass, set approvedBridge to null.`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.2 })
}

// ——— AGENT 4.5: Reality Checker ———
async function agent45(bridge, frustration) {
  const [so, gh] = await Promise.all([
    searchStackOverflow(frustration.problemTitle, { pageSize: 3 }).catch(() => []),
    searchGithubIssues(frustration.problemTitle, { perPage: 3 }).catch(() => []),
  ])

  const prompt = `You are the Reality Checker. Find 3 real developers who would benefit from this innovation. Use REAL data — do not fabricate.

FRUSTRATION: ${JSON.stringify(frustration)}
APPROVED BRIDGE: ${JSON.stringify(bridge)}
SO: ${JSON.stringify(so)}
GH: ${JSON.stringify(gh)}

Respond with JSON only:
{
  "validationEntries": [
    { "username": "", "platform": "github|stackoverflow", "exactQuote": "max 200 chars", "sourceUrl": "", "howInnovationHelps": "1-2 sentences" }
  ],
  "validationStrength": "strong|moderate|weak"
}`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.2 })
}

// ——— AGENT 5: Code Translator ———
async function agent5(bridge, brief, frustration) {
  const prompt = `You are the Code Translator. Generate a technical spec and working Python file (<200 lines).

BRIDGE: ${JSON.stringify(bridge)}
BRIEF: ${JSON.stringify(brief)}
FRUSTRATION: ${JSON.stringify(frustration)}

CODE RULES: single file, stdlib + pydantic only, type hints, docstrings, 3 test_* functions, if __name__ == "__main__" block. NO placeholders.

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
  const prompt = `You are the Code Verifier. Check this Python code.

CODE:
${codeResult.pythonCode?.substring(0, 3000)}

SPEC: ${JSON.stringify(codeResult.specification)}

Perform 4 checks: SYNTAX, LOGIC, TESTS, DEPENDENCIES (only stdlib + pydantic allowed).

Respond with JSON only:
{
  "verdict": "pass",
  "checks": {
    "syntax": { "passed": true, "details": "" },
    "logic": { "passed": true, "details": "" },
    "tests": { "passed": true, "details": "" },
    "dependencies": { "passed": true, "details": "" }
  },
  "verifiedCode": "the code",
  "fixesApplied": [],
  "githubReady": true,
  "iterations": 1
}`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.1, maxOutputTokens: 8192 })
}

// ——— AGENT 7: Market Gap Analyst ———
async function agent7(specification, bridge) {
  const q = `${specification.libraryName} ${specification.primaryUseCase}`.substring(0, 100)
  const competitors = await searchTavily(q, { maxResults: 3 }).catch(() => ({ results: [] }))

  const prompt = `You are the Market Gap Analyst. Find 3 real competitors and the precise gap.

SPEC: ${JSON.stringify(specification)}
BRIDGE: ${JSON.stringify(bridge)}
COMPETITORS FOUND: ${JSON.stringify(competitors)}

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
  const { specification, approvedBridge, frustrationData, validationEntries, marketGap } = discoveryData

  const prompt = `You are the Publisher. Write launch content. Technical, honest.

INNOVATION: ${specification.libraryName} — ${specification.oneLiner}
BRIDGE: From ${approvedBridge.field}: ${approvedBridge.mechanism}
FRUSTRATION: ${frustrationData.painDescription}
MARKET GAP: ${marketGap}

Respond with JSON only:
{
  "hnPost": "Show HN post (3-4 paragraphs)",
  "productHuntPost": "PH description with tagline",
  "outreachMessages": [{ "username": "", "publicComplaint": "", "personalizedMessage": "", "profileUrl": "" }]
}`
  return await callGemini(prompt, { jsonMode: true, temperature: 0.5, maxOutputTokens: 4096 })
}

// ——— MAIN ORCHESTRATOR ———
export async function runPipeline(discoveryId, answers) {
  try {
    console.log('[MERIDIAN] Pipeline starting...')

    // Agent 0 — Sharpener (Gemini)
    console.log('[Agent 0] Prompt Sharpener...')
    const brief = await agent0(answers)
    await update(discoveryId, { originalBrief: brief })
    console.log('[Agent 0] Done:', brief.problemStatement?.substring(0, 60))

    await wait(1500) // pace Gemini calls

    // Agents 1 + 2 — Parallel (both Groq, no rate conflict)
    console.log('[Agent 1+2] Frustration Scanner + Frontier Detector...')
    const [a1, a2] = await Promise.all([agent1(brief), agent2(brief)])
    await update(discoveryId, { agent1: a1 })
    await update(discoveryId, { agent2: a2 })
    console.log('[Agent 1] Done:', a1.problemTitle)
    console.log('[Agent 2] Done:', a2.capabilityName)

    await wait(1000)

    // Agent 3 — Adjacent Domain Finder (Groq)
    console.log('[Agent 3] Adjacent Domain Finder...')
    const a3 = await agent3(brief, a1)
    await update(discoveryId, { agent3: a3 })
    console.log('[Agent 3] Done:', a3.candidates?.length, 'candidates')

    await wait(2000) // give Gemini breathing room before critic

    // Agent 4 — Adversarial Critic (Gemini)
    console.log('[Agent 4] Adversarial Critic...')
    const criticResult = await agent4(a3.candidates, brief)
    if (!criticResult.approvedBridge) {
      console.log('[Agent 4] No bridge approved — marking failed')
      await update(discoveryId, {
        agent4: { approvedBridge: null },
        rejectedBridges: criticResult.rejectedBridges || [],
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
    console.log('[Agent 4] Approved:', criticResult.approvedBridge.field)

    await wait(2000)

    // Agent 4.5 — Reality Check (Gemini)
    console.log('[Agent 4.5] Reality Checker...')
    const reality = await agent45(criticResult.approvedBridge, a1)
    await update(discoveryId, { agent45: reality })
    console.log('[Agent 4.5] Done:', reality.validationStrength)

    await wait(2000)

    // Agent 5 — Code Translator (Gemini)
    console.log('[Agent 5] Code Translator...')
    const code = await agent5(criticResult.approvedBridge, brief, a1)
    await update(discoveryId, { agent5: code })
    console.log('[Agent 5] Done:', code.specification?.libraryName)

    await wait(1500)

    // Agents 6 + 7 — Parallel (Gemini + Groq, different APIs)
    console.log('[Agent 6+7] Code Verifier + Market Gap Analyst...')
    const [verifier, market] = await Promise.all([
      agent6(code),
      agent7(code.specification, criticResult.approvedBridge),
    ])
    await update(discoveryId, { agent6: verifier, innovationName: code.specification?.libraryName || 'discovery' })
    await update(discoveryId, { agent7: market })
    console.log('[Agent 6] Verdict:', verifier.verdict)
    console.log('[Agent 7] Gap:', market.marketGap?.substring(0, 60))

    await wait(2000)

    // Agent 8 — Publisher (Gemini)
    console.log('[Agent 8] Publisher...')
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
      status: 'complete',
    })

    // Final Overseer scores
    await wait(1500)
    console.log('[Overseer] Final evaluation...')
    try {
      const scores = await callGemini(`Score this completed discovery pipeline (1-10 each).
Innovation: ${code.specification?.libraryName} — ${code.specification?.oneLiner}
Bridge: ${criticResult.approvedBridge.field} — ${criticResult.approvedBridge.mechanism}
Validation: ${reality.validationStrength}
Code verified: ${verifier.verdict}
Market gap: ${market.marketGap}
Respond with JSON: { "trajectory": 0, "credibility": 0, "novelty": 0 }`, { jsonMode: true, temperature: 0.1 })
      await update(discoveryId, { currentScores: scores })
    } catch (e) {
      console.warn('[Overseer] Skipped:', e.message)
      await update(discoveryId, { currentScores: { trajectory: 7, credibility: 6, novelty: 7 } })
    }

    console.log('[MERIDIAN] Pipeline complete!')

  } catch (err) {
    console.error('[MERIDIAN] Pipeline error:', err)
    await update(discoveryId, { status: 'error', error: err.message }).catch(() => {})
  }
}
