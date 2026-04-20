# MERIDIAN — Autonomous Innovation Discovery System

A web application that autonomously discovers innovations by finding structural bridges between unrelated fields, validates them against real developer pain, and builds working code.

## Architecture

- **Frontend**: React 19 + Vite, Firebase SDK (modular)
- **Backend**: Firebase Cloud Functions v2, Firestore, Storage
- **Design**: Dark cinematic aesthetic (#0D1117 + #4ECDC4 teal)

## Project Structure

```
meridian/
  src/                     # React frontend
    components/
      shared/              # Logo, Button, CopyButton, ShareableLink
      landing/             # Hero, SocialProof, ProblemComparison, HowItWorks, Footer
      app/                 # Header, ConversationPanel, AgentStatusFeed, OverseerBar,
                           # DiscoveryBoard, HistoryPanel
      cards/               # ProblemCard, FrontierCard, BridgeCard, ValidationCard,
                           # CodeCard, MarketGapCard
      launchpack/          # LaunchPack, HNPostTab, DevOutreachTab, ProductHuntTab
    hooks/                 # useAuth, useDiscovery, useDiscoveryHistory
    pages/                 # LandingPage, AppPage, DiscoveryPage
    config/                # firebase.js
    utils/                 # agentNames.js, formatters.js
  functions/               # Firebase Cloud Functions
    agents/                # 10 agent modules
    apis/                  # 8 external API wrappers
    pipeline/              # orchestrator.js
    overseer/              # overseer.js
    lib/                   # gemini.js, groq.js, goalAnchor.js, pdfGenerator.js
```

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Fill in your Firebase config values

# Start development server
npm run dev
```

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore, Authentication (Google provider), and Storage
3. Upgrade to Blaze plan (required for Cloud Functions, still free within limits)
4. Set secrets:
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   firebase functions:secrets:set GROQ_API_KEY
   firebase functions:secrets:set TAVILY_API_KEY
   firebase functions:secrets:set GITHUB_TOKEN
   ```
5. Deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## The 9 Agent Pipeline

1. **Prompt Sharpener** — Converts raw input into structured research brief
2. **Frustration Scanner** — Searches SO/GitHub/HN for real developer pain
3. **Frontier Detector** — Finds capabilities from the last 90 days
4. **Adjacent Domain Finder** — Searches 10 unrelated fields for structural analogies
5. **Adversarial Critic** — Attacks bridges with 3 rejection tests
6. **Reality Checker** — Finds real developers who need this
7. **Code Translator** — Generates working Python code
8. **Code Verifier** — Independent syntax/logic/test verification
9. **Market Gap Analyst** — Identifies competitor gaps
10. **Publisher** — Creates GitHub repo + PDF + launch pack

## Overseer

A continuous intelligence that scores every agent output on:
- **Trajectory** (1-10): Is the pipeline heading toward useful innovation?
- **Credibility** (1-10): Is output backed by real data?
- **Novelty** (1-10): Is the innovation genuinely new?

Can STOP the pipeline if quality drops.

---

*Built for the Agentathon 2026, April*
