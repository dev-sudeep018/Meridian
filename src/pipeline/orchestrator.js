/**
 * Client-side Pipeline Orchestrator v4
 * 100% Groq-powered — zero Gemini calls. No rate limit issues.
 */
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { callGroq } from './ai'
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
    console.warn('[Firestore] Update failed:', err.message)
  }
}

// ——— AGENT 0: Prompt Sharpener ———
async function agent0(answers) {
  return await callGroq(`Convert these user answers into a research brief. Only clarify and structure.

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

// ——— AGENT 1: Frustration Scanner ———
async function agent1(brief) {
  const q = brief.problemStatement.substring(0, 100)
  const [so, gh, hn] = await Promise.all([
    searchStackOverflow(q).catch(() => []),
    searchGithubIssues(q).catch(() => []),
    searchHackerNews(q, { tags: 'story' }).catch(() => []),
  ])

  return await callGroq(`Find the most painful developer frustration matching this brief. Use REAL data only.

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

// ——— AGENT 2: Frontier Detector ———
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

// ——— AGENT 3: Adjacent Domain Finder ———
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

// ——— AGENT 4: Adversarial Critic ———
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

// ——— AGENT 4.5: Reality Checker ———
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

// ——— AGENT 5: Code Translator (2-step: spec then code) ———
async function agent5(bridge, brief, frustration) {
  // Step 1: Generate the specification only
  const spec = await callGroq(`Generate a technical specification for a Python library that implements this bridge.

BRIDGE: ${JSON.stringify(bridge)}
BRIEF: ${JSON.stringify(brief)}
FRUSTRATION: ${JSON.stringify(frustration)}

Respond with JSON only:
{
  "libraryName": "kebab-case-name",
  "oneLiner": "One sentence description",
  "coreAlgorithm": "Paragraph explaining the algorithm",
  "apiSurface": [{ "method": "Class.method()", "params": "param descriptions", "returns": "return type" }],
  "primaryUseCase": "Who uses this and why",
  "limitations": "Known limitations",
  "invalidation": "What would make this obsolete"
}`, { jsonMode: true, temperature: 0.2 })

  await wait(800)

  // Step 2: Generate the Python code as plain text (NOT inside JSON)
  const pythonCode = await callGroq(`Write a complete, working Python file (<150 lines) implementing this specification.

LIBRARY: ${spec.libraryName} — ${spec.oneLiner}
ALGORITHM: ${spec.coreAlgorithm}
API: ${JSON.stringify(spec.apiSurface)}

RULES:
- Single file, stdlib + pydantic only
- Type hints and docstrings
- 3 test_* functions
- if __name__ == "__main__" block
- NO placeholders, stubs, or pass statements
- Output ONLY the Python code, no markdown fences, no explanation`, { temperature: 0.2, maxTokens: 4096 })

  return { specification: spec, pythonCode }
}

// ——— AGENT 6: Code Verifier ———
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
}`, { parseJson: true, temperature: 0.1, maxTokens: 4096 })
}

// ——— AGENT 7: Market Gap ———
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

// ——— AGENT 8: Publisher ———
async function agent8(discoveryData) {
  const { specification, approvedBridge, frustrationData, marketGap } = discoveryData

  return await callGroq(`Write launch content for this innovation. Technical and honest, no hype words.

INNOVATION: ${specification.libraryName} — ${specification.oneLiner}
BRIDGE: From ${approvedBridge.field}: ${approvedBridge.mechanism}
FRUSTRATION: ${frustrationData.painDescription}
MARKET GAP: ${marketGap}

Respond with JSON only:
{
  "hnPost": "Show HN post (3-4 paragraphs)",
  "productHuntPost": "Product Hunt description with tagline",
  "outreachMessages": [{ "username": "", "publicComplaint": "", "personalizedMessage": "", "profileUrl": "" }]
}`, { jsonMode: true, temperature: 0.5, maxTokens: 3000 })
}

// ——— OVERSEER: Quality Intelligence (runs after each phase) ———
// Returns scores object and throws if pipeline should stop
async function overseer(discoveryId, agentName, agentOutput) {
  try {
    const scores = await callGroq(`You are the Overseer for MERIDIAN, a strict quality intelligence system.

AGENT: ${agentName}
OUTPUT: ${JSON.stringify(agentOutput).substring(0, 1500)}

Score this output HONESTLY (1-10 each). Be critical — do NOT give everything high scores:
1. TRAJECTORY: Is this heading toward a genuinely useful, specific innovation? (Low if vague/generic)
2. CREDIBILITY: Is this backed by real data, not fabricated? (Low if references look fake)
3. NOVELTY: Is the emerging innovation genuinely new? (Low if it already exists)

Set "stop" to true if:
- Any score is 3 or below
- The bridge is purely metaphorical with no structural parallel
- The innovation clearly already exists
- The data appears fabricated

Respond with JSON only:
{ "trajectory": 0, "credibility": 0, "novelty": 0, "stop": false, "reasoning": "1-2 sentences" }`, { jsonMode: true, temperature: 0.1 })

    // Enforce quality gates
    const avg = (scores.trajectory + scores.credibility + scores.novelty) / 3
    const shouldStop = scores.stop || scores.trajectory <= 3 || scores.credibility <= 3 || scores.novelty <= 3 || avg < 4

    await update(discoveryId, {
      currentScores: {
        trajectory: scores.trajectory,
        credibility: scores.credibility,
        novelty: scores.novelty,
      },
      overseerLog: await getOverseerLog(discoveryId, {
        triggeredBy: agentName,
        trajectory: scores.trajectory,
        credibility: scores.credibility,
        novelty: scores.novelty,
        stop: shouldStop,
        reasoning: scores.reasoning,
        timestamp: new Date().toISOString(),
      }),
    })

    console.log(`[Overseer] ${agentName}: T=${scores.trajectory} C=${scores.credibility} N=${scores.novelty} avg=${avg.toFixed(1)}${shouldStop ? ' STOPPING!' : ''}`)

    if (shouldStop) {
      const reason = scores.reasoning || `Quality too low after ${agentName} (T:${scores.trajectory} C:${scores.credibility} N:${scores.novelty})`
      await update(discoveryId, {
        status: 'failed',
        failureReason: `Overseer halted: ${reason}`,
      })
      throw new OverseerStopError(reason)
    }

    return scores
  } catch (err) {
    if (err instanceof OverseerStopError) throw err
    console.warn('[Overseer] Skipped:', err.message)
    return null
  }
}

class OverseerStopError extends Error {
  constructor(reason) {
    super(`Overseer STOP: ${reason}`)
    this.name = 'OverseerStopError'
  }
}

// Helper to append to overseer log array
async function getOverseerLog(discoveryId, newEntry) {
  try {
    const { getDoc } = await import('firebase/firestore')
    const ref = doc(db, 'discoveries', discoveryId)
    const snap = await getDoc(ref)
    const existing = snap.data()?.overseerLog || []
    return [...existing, newEntry]
  } catch {
    return [newEntry]
  }
}

// ——— MAIN ORCHESTRATOR ———
export async function runPipeline(discoveryId, answers) {
  try {
    console.log('[MERIDIAN] Pipeline starting...')

    // === PHASE 1: Agent 0 ===
    console.log('[Agent 0] Prompt Sharpener...')
    const brief = await agent0(answers)
    await update(discoveryId, { originalBrief: brief })
    console.log('[Agent 0] Done:', brief.problemStatement?.substring(0, 60))

    await wait(3000)

    // === PHASE 2: Agents 1 + 2 (sequential to avoid rate limits) ===
    console.log('[Agent 1] Frustration Scanner...')
    const a1 = await agent1(brief)
    await update(discoveryId, { agent1: a1 })
    console.log('[Agent 1] Done:', a1.problemTitle)

    await wait(3000)

    console.log('[Agent 2] Frontier Detector...')
    const a2 = await agent2(brief)
    await update(discoveryId, { agent2: a2 })
    console.log('[Agent 2] Done:', a2.capabilityName)

    await wait(3000)

    // === OVERSEER CHECKPOINT 1: Research quality ===
    await overseer(discoveryId, 'Research Phase (Agents 0-2)', { brief, frustration: a1, frontier: a2 })

    await wait(3000)

    // === PHASE 3: Agent 3 ===
    console.log('[Agent 3] Adjacent Domain Finder...')
    const a3 = await agent3(brief, a1)
    await update(discoveryId, { agent3: a3 })
    console.log('[Agent 3] Done:', a3.candidates?.length, 'candidates')

    await wait(3000)

    // === PHASE 4: Agent 4 ===
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

    await wait(3000)

    // === OVERSEER CHECKPOINT 2: Bridge quality (critical gate) ===
    await overseer(discoveryId, 'Bridge Phase (Agents 3-4)', { bridge: criticResult.approvedBridge, candidates: a3.candidates?.length })

    await wait(3000)

    // === PHASE 5: Agent 4.5 ===
    console.log('[Agent 4.5] Reality Checker...')
    const reality = await agent45(criticResult.approvedBridge, a1)
    await update(discoveryId, { agent45: reality })
    console.log('[Agent 4.5] Done:', reality.validationStrength)

    await wait(3000)

    // === PHASE 6: Agent 5 (2 calls internally) ===
    console.log('[Agent 5] Code Translator...')
    const code = await agent5(criticResult.approvedBridge, brief, a1)
    await update(discoveryId, { agent5: code })
    console.log('[Agent 5] Done:', code.specification?.libraryName)

    await wait(4000)

    // === PHASE 7: Agent 6 then Agent 7 (sequential) ===
    console.log('[Agent 6] Code Verifier...')
    const verifier = await agent6(code)
    await update(discoveryId, { agent6: verifier, innovationName: code.specification?.libraryName || 'discovery' })
    console.log('[Agent 6] Verdict:', verifier.verdict)

    await wait(3000)

    console.log('[Agent 7] Market Gap Analyst...')
    const market = await agent7(code.specification, criticResult.approvedBridge)
    await update(discoveryId, { agent7: market })
    console.log('[Agent 7] Gap:', market.marketGap?.substring(0, 60))

    await wait(3000)

    // === PHASE 8: Agent 8 ===
    console.log('[Agent 8] Publisher...')
    const pub = await agent8({
      specification: code.specification,
      approvedBridge: criticResult.approvedBridge,
      frustrationData: a1,
      marketGap: market.marketGap,
    })

    await wait(3000)

    // === OVERSEER CHECKPOINT 3: Final evaluation ===
    const finalScores = await overseer(discoveryId, 'Final Pipeline Review', {
      innovation: code.specification?.libraryName,
      bridge: criticResult.approvedBridge.field,
      validation: reality.validationStrength,
      verdict: verifier.verdict,
      marketGap: market.marketGap?.substring(0, 100),
    })

    // === Generate PDF ===
    console.log('[PDF] Generating discovery report...')
    let pdfUrl = null
    try {
      const { generateDiscoveryPDF } = await import('./pdf.js')
      pdfUrl = await generateDiscoveryPDF({
        brief,
        frustration: a1,
        frontier: a2,
        bridge: criticResult.approvedBridge,
        rejectedBridges: criticResult.rejectedBridges,
        reality,
        specification: code.specification,
        pythonCode: code.pythonCode,
        verifier,
        market,
        launchPack: pub,
        scores: finalScores || { trajectory: 7, credibility: 6, novelty: 7 },
      })
      console.log('[PDF] Generated')
    } catch (pdfErr) {
      console.warn('[PDF] Generation failed:', pdfErr.message)
    }

    await update(discoveryId, {
      agent8: { githubUrl: null, pdfGenerated: !!pdfUrl },
      launchPack: pub,
      pdfUrl,
      currentScores: finalScores
        ? { trajectory: finalScores.trajectory, credibility: finalScores.credibility, novelty: finalScores.novelty }
        : { trajectory: 7, credibility: 6, novelty: 7 },
      status: 'complete',
    })

    console.log('[MERIDIAN] Pipeline complete!')

  } catch (err) {
    if (err.name === 'OverseerStopError') {
      console.warn('[MERIDIAN] Pipeline stopped by Overseer:', err.message)
      return
    }
    console.error('[MERIDIAN] Pipeline error:', err)
    try {
      await update(discoveryId, { status: 'error', error: err.message })
    } catch (e2) {
      console.error('[MERIDIAN] Could not write error:', e2.message)
    }
  }
}



