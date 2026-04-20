import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../hooks/useAuth'
import { useDiscovery } from '../hooks/useDiscovery'
import Header from '../components/app/Header'
import ConversationPanel from '../components/app/ConversationPanel'
import DiscoveryBoard from '../components/app/DiscoveryBoard'
import HistoryPanel from '../components/app/HistoryPanel'
import SettingsPanel from '../components/app/SettingsPanel'
import './AppPage.css'

export default function AppPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [discoveryId, setDiscoveryId] = useState(null)
  const [phase, setPhase] = useState('q1') // q1, q2, q3, running, complete
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' })
  const [historyOpen, setHistoryOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'I discover innovations by finding solutions from fields that have never spoken to yours. To find something real, I need to understand your specific situation. What problem keeps you up at night — describe it as specifically as you can, including who experiences it and what the current workaround is.',
    },
  ])

  const { discovery } = useDiscovery(discoveryId)

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return

    // Add user message
    const newMessages = [...messages, { role: 'user', text }]
    setMessages(newMessages)

    if (phase === 'q1') {
      setAnswers(prev => ({ ...prev, q1: text }))
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'Good. What have you already tried, or what solutions already exist that are close but not quite right?',
        },
      ])
      setPhase('q2')
    } else if (phase === 'q2') {
      setAnswers(prev => ({ ...prev, q2: text }))
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'One last thing — who is the person experiencing this most painfully? Developer, founder, researcher, someone else?',
        },
      ])
      setPhase('q3')
    } else if (phase === 'q3') {
      const finalAnswers = { q1: answers.q1, q2: answers.q2, q3: text }
      setAnswers(finalAnswers)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'Perfect. I have everything I need. Watch the right side — agents are firing now.',
        },
      ])
      setPhase('running')

      // Create discovery document in Firestore
      try {
        const docRef = await addDoc(collection(db, 'discoveries'), {
          userId: user?.uid || null,
          status: 'running',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          userAnswers: finalAnswers,
          // Agent fields will be added by Cloud Functions
        })
        setDiscoveryId(docRef.id)

        // In production, this would call a Cloud Function:
        // const startDiscovery = httpsCallable(getFunctions(), 'startDiscovery')
        // await startDiscovery({ discoveryId: docRef.id, answers: finalAnswers })

        // For demo: simulate agent completion with mock data
        simulateAgentPipeline(docRef.id, finalAnswers)
      } catch (err) {
        console.error('Failed to start discovery:', err)
        setMessages(prev => [
          ...prev,
          { role: 'assistant', text: 'Something went wrong starting the discovery. Please try again.' },
        ])
        setPhase('q1')
      }
    }
  }, [phase, answers, messages, user])

  // Check if discovery is complete from Firestore updates
  if (discovery?.status === 'complete' && phase === 'running') {
    setPhase('complete')
  }

  return (
    <div className="app-page">
      <Header
        discovery={discovery}
        onToggleHistory={() => setHistoryOpen(!historyOpen)}
        onToggleSettings={() => setSettingsOpen(!settingsOpen)}
        user={user}
      />

      <div className="app-content">
        <ConversationPanel
          messages={messages}
          phase={phase}
          discovery={discovery}
          onSendMessage={handleSendMessage}
          discoveryId={discoveryId}
        />
        <DiscoveryBoard
          discovery={discovery}
          phase={phase}
        />
      </div>

      {historyOpen && (
        <HistoryPanel
          userId={user?.uid}
          onClose={() => setHistoryOpen(false)}
          onSelectDiscovery={(id) => {
            navigate(`/discovery/${id}`)
            setHistoryOpen(false)
          }}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          user={user}
          onClose={() => setSettingsOpen(false)}
          onSignOut={signOut}
        />
      )}
    </div>
  )
}

// Demo simulation — in production, Cloud Functions handle this
async function simulateAgentPipeline(discoveryId, answers) {
  const { doc, updateDoc } = await import('firebase/firestore')
  const wait = (ms) => new Promise(r => setTimeout(r, ms))
  const ref = doc(db, 'discoveries', discoveryId)

  try {
    // Agent 0 — Sharpener
    await wait(2000)
    await updateDoc(ref, {
      originalBrief: {
        problemStatement: `Developers struggle with ${answers.q1.slice(0, 80)}`,
        targetPersona: answers.q3,
        priorAttempts: answers.q2.slice(0, 200),
        desiredOutcome: 'A systematic solution that eliminates this friction',
        constraints: 'Must be implementable with standard Python libraries',
      },
      updatedAt: serverTimestamp(),
    })

    // Agents 1, 2, 3 — parallel
    await wait(3000)
    await updateDoc(ref, {
      agent1: {
        problemTitle: 'State Coherence in Multi-Step AI Agent Tasks',
        soQuestionTitle: 'How to maintain consistent state across chained LLM calls?',
        soQuestionUrl: 'https://stackoverflow.com/questions/78901234',
        upvoteCount: 247,
        daysUnresolved: 547,
        relatedGithubIssues: 18,
        topGithubIssueUrl: 'https://github.com/langchain-ai/langchain/issues/12345',
        painDescription: 'AI agents lose track of their original goal when executing multi-step tasks, leading to drift that compounds with each step.',
        whyUnsolved: 'Current solutions rely on context window stuffing which degrades with task complexity, and no systematic verification protocol exists between steps.',
      },
      updatedAt: serverTimestamp(),
    })

    await wait(1500)
    await updateDoc(ref, {
      agent2: {
        capabilityName: 'Structured State Verification in LLM Pipelines',
        description: 'A new technique for embedding verifiable state checkpoints between LLM inference steps, allowing automatic detection and correction of semantic drift.',
        publicationDate: '2026-03-01',
        weeksAgo: 7,
        sourceUrl: 'https://arxiv.org/abs/2603.01234',
        sourceType: 'arxiv',
        whyRelevant: 'This capability enables the exact type of inter-step verification needed to solve the state coherence problem.',
      },
      updatedAt: serverTimestamp(),
    })

    await wait(2000)
    await updateDoc(ref, {
      agent3: {
        abstractedQuery: 'maintaining consistent state across sequential operations where errors compound and each step is irreversible',
        candidates: [
          {
            field: 'Aviation Safety',
            mechanism: 'Readback protocol — pilots must confirm ATC instructions word-for-word before executing any irreversible action',
            structuralAnalogy: 'Both systems face the same problem: an agent receiving complex instructions must verify understanding before taking irreversible action, and errors compound across sequential operations.',
            sourceUrl: 'https://openalex.org/W2134567890',
            sourceTitle: 'Communication Protocols in Aviation: Preventing Catastrophic Error Chains',
          },
          {
            field: 'Anesthesia Monitoring',
            mechanism: 'Continuous vital sign verification — anesthesiologists check 15 parameters every 5 minutes against baseline',
            structuralAnalogy: 'Both systems must maintain awareness of baseline state while processing real-time changes, with deviation triggering immediate correction.',
            sourceUrl: 'https://openalex.org/W3456789012',
            sourceTitle: 'Vigilance Protocols in Modern Anesthesiology',
          },
          {
            field: 'Nuclear Plant Operations',
            mechanism: 'Triple redundancy verification — three independent systems must agree before any state change is committed',
            structuralAnalogy: 'Both systems cannot afford incorrect state transitions and use redundant verification to prevent cascading failures.',
            sourceUrl: 'https://openalex.org/W4567890123',
            sourceTitle: 'Safety-Critical State Management in Nuclear Operations',
          },
        ],
      },
      updatedAt: serverTimestamp(),
    })

    // Agent 4 — Critic
    await wait(3000)
    await updateDoc(ref, {
      agent4: {
        approvedBridge: {
          field: 'Aviation Safety',
          mechanism: 'Readback protocol — pilots must confirm ATC instructions word-for-word before executing any irreversible action',
          structuralAnalogy: 'Both systems face the same computational problem: an agent receiving complex sequential instructions must verify its understanding of the current state before taking an irreversible action. In aviation, misunderstood instructions cause crashes. In AI agents, misunderstood context causes cascading errors that make the final output useless.',
          translationConcept: 'Implement a readback verification layer between each agent step: before executing, the agent must reconstruct the key parameters of its instruction and have them verified against the original intent. Only matching state allows execution to proceed.',
          approvalReason: 'This passes all three tests: the structural analogy survives domain name removal, the mechanism is purely informational (no physical properties required), and while retry/verification patterns exist in software, the specific readback-and-confirm protocol with state anchoring is meaningfully different from generic error handling.',
          sourceUrl: 'https://openalex.org/W2134567890',
        },
      },
      rejectedBridges: [
        {
          field: 'Anesthesia Monitoring',
          mechanism: 'Continuous vital sign verification',
          rejectionReason: 'Fails Test 2: the mechanism fundamentally requires real-time biological signal processing which has no meaningful software analog. "Checking parameters against baseline" is too generic — it describes any monitoring system.',
          testFailed: 2,
        },
      ],
      adjacentDomain: 'Aviation Safety',
      updatedAt: serverTimestamp(),
    })

    // Agent 4.5 — Reality Check
    await wait(2500)
    await updateDoc(ref, {
      agent45: {
        validationEntries: [
          {
            username: 'sarah-dev-ml',
            platform: 'github',
            exactQuote: 'My agent pipeline keeps drifting from the original task after 3-4 steps. By step 6), it is solving a completely different problem than what the user asked for. I have tried adding the original prompt to every context window but it still drifts.',
            sourceUrl: 'https://github.com/langchain-ai/langchain/issues/12345',
            howInnovationHelps: 'The readback verification layer would catch drift at each step by requiring the agent to reconstruct and verify its understanding of the original goal before proceeding. Drift would be detected at step 3 instead of discovered at step 6.',
          },
          {
            username: 'jchen_architect',
            platform: 'stackoverflow',
            exactQuote: 'We lose about 40% of our multi-agent pipeline runs to what I call "semantic drift" — the agents gradually shift their interpretation of the task with each handoff. There is no systematic way to verify state coherence between steps.',
            sourceUrl: 'https://stackoverflow.com/questions/78901234#answer-78901299',
            howInnovationHelps: 'The aviation readback protocol directly addresses inter-step semantic verification — the exact gap this developer identifies. Each handoff would include a state verification checkpoint.',
          },
          {
            username: 'ml_frustrated',
            platform: 'hackernews',
            exactQuote: 'Every agent framework tells you to "just add more context" but nobody has solved the fundamental problem: how does an agent know if it still understands what it is supposed to be doing? Humans use confirmation — why do not agents?',
            sourceUrl: 'https://news.ycombinator.com/item?id=39012345',
            howInnovationHelps: 'This developer is literally describing the readback protocol without knowing it exists in aviation. The innovation gives agents the exact "confirmation" mechanism this developer is asking for.',
          },
        ],
        validationStrength: 'strong',
      },
      updatedAt: serverTimestamp(),
    })

    // Agent 5 + 6 — Translation + Verification
    await wait(3500)
    const pythonCode = `"""
agent_readback - Aviation-inspired state coherence for AI agent pipelines.

Implements the readback protocol from aviation safety for multi-step AI agents:
before each irreversible action, the agent must reconstruct and verify its 
understanding of the current state against the original intent.
"""

from typing import Any, Callable, Optional
from dataclasses import dataclass, field
from pydantic import BaseModel


class StateAnchor(BaseModel):
    """Immutable reference point for verifying agent state coherence."""
    original_goal: str
    key_parameters: dict[str, Any]
    constraints: list[str]
    success_criteria: str


class ReadbackResult(BaseModel):
    """Result of a readback verification check."""
    coherent: bool
    drift_score: float  # 0.0 = perfectly aligned, 1.0 = completely drifted
    reconstructed_goal: str
    mismatches: list[str]
    corrective_action: Optional[str] = None


class ReadbackVerifier:
    """
    Implements aviation readback protocol for AI agent state verification.
    
    Before each step, the agent must 'read back' its understanding of:
    1. The current goal (does it still match the original?)
    2. Key parameters (have any been silently changed?)
    3. Constraints (are all still being respected?)
    
    If the readback fails, execution halts and the agent receives
    a corrected instruction before proceeding.
    """
    
    def __init__(self, anchor: StateAnchor, threshold: float = 0.3):
        self.anchor = anchor
        self.threshold = threshold
        self.history: list[ReadbackResult] = []
    
    def verify(self, agent_readback: dict[str, Any]) -> ReadbackResult:
        mismatches = []
        drift = 0.0
        
        reconstructed = agent_readback.get("current_goal", "")
        if not self._goals_align(reconstructed, self.anchor.original_goal):
            mismatches.append(f"Goal drift: '{reconstructed}' vs '{self.anchor.original_goal}'")
            drift += 0.4
        
        for key, expected in self.anchor.key_parameters.items():
            actual = agent_readback.get("parameters", {}).get(key)
            if actual != expected:
                mismatches.append(f"Parameter '{key}': expected {expected}, got {actual}")
                drift += 0.2
        
        for constraint in self.anchor.constraints:
            if constraint not in agent_readback.get("active_constraints", []):
                mismatches.append(f"Dropped constraint: {constraint}")
                drift += 0.15
        
        drift = min(drift, 1.0)
        result = ReadbackResult(
            coherent=drift <= self.threshold,
            drift_score=drift,
            reconstructed_goal=reconstructed,
            mismatches=mismatches,
            corrective_action=self._generate_correction(mismatches) if drift > self.threshold else None,
        )
        self.history.append(result)
        return result
    
    def _goals_align(self, reconstructed: str, original: str) -> bool:
        r_words = set(reconstructed.lower().split())
        o_words = set(original.lower().split())
        if not o_words:
            return False
        overlap = len(r_words & o_words) / len(o_words)
        return overlap >= 0.6
    
    def _generate_correction(self, mismatches: list[str]) -> str:
        return f"READBACK FAILED. Correct the following before proceeding: {'; '.join(mismatches)}"


def create_pipeline(anchor: StateAnchor, steps: list[Callable], threshold: float = 0.3):
    """Execute a multi-step pipeline with readback verification between each step."""
    verifier = ReadbackVerifier(anchor, threshold)
    result = None
    
    for i, step in enumerate(steps):
        result = step(result, anchor)
        
        readback = {
            "current_goal": result.get("goal_understanding", anchor.original_goal),
            "parameters": result.get("parameters", {}),
            "active_constraints": result.get("constraints", []),
        }
        
        check = verifier.verify(readback)
        if not check.coherent:
            result["correction"] = check.corrective_action
            result = step(result, anchor)
            
            recheck = verifier.verify({
                "current_goal": result.get("goal_understanding", ""),
                "parameters": result.get("parameters", {}),
                "active_constraints": result.get("constraints", []),
            })
            if not recheck.coherent:
                raise RuntimeError(f"Pipeline halted at step {i}: persistent drift after correction")
    
    return result, verifier.history


# === Tests ===
def test_coherent_readback():
    anchor = StateAnchor(
        original_goal="optimize database query performance",
        key_parameters={"target_latency_ms": 100, "database": "postgresql"},
        constraints=["no schema changes", "backward compatible"],
        success_criteria="p99 latency under 100ms",
    )
    verifier = ReadbackVerifier(anchor)
    result = verifier.verify({
        "current_goal": "optimize database query performance for postgresql",
        "parameters": {"target_latency_ms": 100, "database": "postgresql"},
        "active_constraints": ["no schema changes", "backward compatible"],
    })
    assert result.coherent is True
    assert result.drift_score <= 0.3

def test_drifted_readback():
    anchor = StateAnchor(
        original_goal="optimize database query performance",
        key_parameters={"target_latency_ms": 100},
        constraints=["no schema changes"],
        success_criteria="p99 latency under 100ms",
    )
    verifier = ReadbackVerifier(anchor)
    result = verifier.verify({
        "current_goal": "redesign the entire data model",
        "parameters": {"target_latency_ms": 500},
        "active_constraints": [],
    })
    assert result.coherent is False
    assert result.drift_score > 0.3
    assert len(result.mismatches) > 0

def test_correction_generated():
    anchor = StateAnchor(
        original_goal="build a REST API",
        key_parameters={"framework": "fastapi"},
        constraints=["python only"],
        success_criteria="all endpoints return JSON",
    )
    verifier = ReadbackVerifier(anchor, threshold=0.1)
    result = verifier.verify({
        "current_goal": "build a GraphQL server",
        "parameters": {"framework": "express"},
        "active_constraints": [],
    })
    assert result.corrective_action is not None
    assert "READBACK FAILED" in result.corrective_action


if __name__ == "__main__":
    anchor = StateAnchor(
        original_goal="optimize database query performance",
        key_parameters={"target_latency_ms": 100, "database": "postgresql"},
        constraints=["no schema changes", "backward compatible"],
        success_criteria="p99 latency under 100ms",
    )
    verifier = ReadbackVerifier(anchor)
    
    result = verifier.verify({
        "current_goal": "optimize database query performance for postgresql",
        "parameters": {"target_latency_ms": 100, "database": "postgresql"},
        "active_constraints": ["no schema changes", "backward compatible"],
    })
    print(f"Coherent: {result.coherent}, Drift: {result.drift_score}")
    
    drifted = verifier.verify({
        "current_goal": "redesign the entire database schema",
        "parameters": {"target_latency_ms": 500, "database": "mongodb"},
        "active_constraints": [],
    })
    print(f"Coherent: {drifted.coherent}, Drift: {drifted.drift_score}")
    print(f"Mismatches: {drifted.mismatches}")
    print(f"Correction: {drifted.corrective_action}")
`

    await updateDoc(ref, {
      agent5: {
        specification: {
          libraryName: 'agent-readback',
          oneLiner: 'Aviation-inspired state coherence verification for AI agent pipelines',
          coreAlgorithm: 'Before each step in a multi-step AI agent pipeline, the agent must reconstruct its understanding of the current goal, parameters, and constraints. This readback is compared against an immutable StateAnchor. If drift exceeds a threshold, execution halts and the agent receives a corrective instruction before retrying.',
          apiSurface: [
            { method: 'StateAnchor()', params: 'original_goal, key_parameters, constraints, success_criteria', returns: 'Immutable state reference' },
            { method: 'ReadbackVerifier.verify()', params: 'agent_readback dict', returns: 'ReadbackResult with coherent flag and drift score' },
            { method: 'create_pipeline()', params: 'anchor, steps list, threshold', returns: 'Final result and verification history' },
          ],
          primaryUseCase: 'Multi-step LLM agent pipelines where each step must verify it still understands and respects the original task before proceeding.',
          limitations: 'Goal alignment detection uses word overlap which may miss semantic equivalences. The correction mechanism assumes the step function can accept and use correction instructions.',
          invalidation: 'If LLM agents develop reliable internal state tracking that makes external verification unnecessary, this approach becomes redundant.',
        },
        pythonCode: pythonCode,
      },
      agent6: {
        verdict: 'pass',
        checks: {
          syntax: { passed: true, details: 'No syntax errors found. All indentation consistent. All colons present.' },
          logic: { passed: true, details: 'Main verification logic correctly compares readback against anchor. Drift scoring accumulates properly. Threshold comparison is correct.' },
          tests: { passed: true, details: 'All 3 test functions start with test_. Tests cover coherent readback, drifted readback, and correction generation. All would pass if run.' },
          dependencies: { passed: true, details: 'Only imports: typing (stdlib), dataclasses (stdlib), pydantic. All compliant.' },
        },
        verifiedCode: pythonCode,
        iterations: 1,
        githubReady: true,
      },
      innovationName: 'agent-readback',
      updatedAt: serverTimestamp(),
    })

    // Agent 7 — Market Gap
    await wait(2000)
    await updateDoc(ref, {
      agent7: {
        competitors: [
          {
            name: 'LangChain',
            description: 'Comprehensive LLM application framework with chains, agents, and memory modules.',
            specificGap: 'Has memory modules but no inter-step state verification protocol. Relies on context window stuffing rather than active coherence checking.',
            url: 'https://github.com/langchain-ai/langchain',
          },
          {
            name: 'CrewAI',
            description: 'Multi-agent orchestration framework where agents collaborate on complex tasks.',
            specificGap: 'Focuses on agent role assignment and task delegation. No mechanism to verify individual agents maintain alignment with the original goal across steps.',
            url: 'https://github.com/joaomdmoura/crewai',
          },
          {
            name: 'AutoGen',
            description: 'Microsoft framework for building multi-agent conversational systems.',
            specificGap: 'Provides conversation patterns between agents but no formal state coherence protocol. Agents can drift without any systematic detection.',
            url: 'https://github.com/microsoft/autogen',
          },
        ],
        marketGap: 'No existing agent framework implements a formal state coherence verification protocol between pipeline steps. All three competitors focus on orchestration and communication but treat state consistency as implicit rather than actively verified.',
        gapReason: 'The agent framework ecosystem has focused on capability breadth rather than reliability depth. State coherence is treated as a quality-of-prompt problem rather than a systematic verification protocol.',
      },
      updatedAt: serverTimestamp(),
    })

    // Agent 8 — Publisher
    await wait(3000)
    await updateDoc(ref, {
      agent8: {
        githubUrl: 'https://github.com/demo/agent-readback',
        pdfGenerated: true,
      },
      launchPack: {
        hnPost: `Show HN: agent-readback — Aviation-inspired state coherence for AI agent pipelines

I built a library that applies the aviation readback protocol to multi-step AI agent pipelines. In aviation, pilots must confirm ATC instructions word-for-word before executing. agent-readback does the same for LLM agents: before each step, the agent must reconstruct its understanding of the goal, and execution only continues if it matches the original intent.

The problem: ~40% of multi-agent pipeline runs suffer from "semantic drift" — agents gradually lose track of the original task across sequential steps.

The solution: A StateAnchor holds the immutable goal. A ReadbackVerifier checks agent understanding before each step. If drift exceeds threshold, execution halts with a corrective instruction.

pip install git+https://github.com/demo/agent-readback

Try it: https://meridian.app

Built in 5 minutes by MERIDIAN's autonomous innovation discovery system.`,
        productHuntPost: `agent-readback — Stop your AI agents from forgetting what they are doing

Every multi-agent pipeline has the same problem: by step 4, your agent is solving a completely different problem than what the user asked for.

agent-readback applies aviation's readback protocol to AI agents. Before each step, the agent must verify it still understands the original goal. If it has drifted, execution halts and corrects automatically.

Working Python library. Tests passing. Zero config.

Discovered by MERIDIAN — the autonomous innovation discovery system that found this solution by connecting AI agent research with aviation safety protocols.`,
        outreachMessages: [
          {
            username: 'sarah-dev-ml',
            avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
            publicComplaint: 'My agent pipeline keeps drifting from the original task after 3-4 steps.',
            personalizedMessage: 'Sarah, your issue #12345 on LangChain about agent drift across multi-step pipelines is exactly what agent-readback was built for. It adds aviation-style readback verification between each step — your agents would catch drift at step 3 instead of discovering it at step 6. Would you be open to trying it on your pipeline and sharing what you find?',
            profileUrl: 'https://github.com/sarah-dev-ml',
          },
          {
            username: 'jchen_architect',
            avatarUrl: 'https://avatars.githubusercontent.com/u/23456',
            publicComplaint: 'We lose about 40% of our multi-agent pipeline runs to semantic drift.',
            personalizedMessage: 'Jian, your Stack Overflow answer about losing 40% of pipeline runs to semantic drift resonated hard. agent-readback implements a formal verification protocol between steps — think of it as a pre-flight checklist for each agent operation. The threshold is configurable so you can tune the sensitivity. Would a 15-minute walkthrough of how it integrates with your current stack be useful?',
            profileUrl: 'https://github.com/jchen_architect',
          },
        ],
      },
      pdfUrl: 'https://storage.googleapis.com/meridian-demo/pdfs/sample.pdf',
      githubUrl: 'https://github.com/demo/agent-readback',
      currentScores: { trajectory: 9, credibility: 8, novelty: 8 },
      overseerLog: [
        { triggeredBy: 'agent0', trajectory: 8, credibility: 7, novelty: 7, stop: false, reasoning: 'Brief is specific and actionable.' },
        { triggeredBy: 'agent1', trajectory: 9, credibility: 9, novelty: 7, stop: false, reasoning: 'Strong frustration signal with real data.' },
        { triggeredBy: 'agent4', trajectory: 9, credibility: 8, novelty: 9, stop: false, reasoning: 'Aviation readback is a genuinely novel and translatable bridge.' },
        { triggeredBy: 'agent6', trajectory: 9, credibility: 8, novelty: 8, stop: false, reasoning: 'Code is verified and implements the mechanism authentically.' },
      ],
      finalScores: { trajectory: 9, credibility: 8, novelty: 8 },
      status: 'complete',
      updatedAt: serverTimestamp(),
    })
  } catch (err) {
    console.error('Pipeline simulation error:', err)
  }
}
