/**
 * Agent 8 — Publisher
 * Creates GitHub repo, generates PDF, and writes launch pack content.
 * APIs: GitHub (repo creation)
 * LLM: Gemini 2.5 Flash (launch pack writing)
 */
const { callGemini } = require("../lib/gemini");
const { GOAL_ANCHOR } = require("../lib/goalAnchor");
const { createGithubRepo } = require("../apis/github");

async function runAgent8(discoveryData) {
  const {
    specification,
    verifiedCode,
    approvedBridge,
    frustrationData,
    validationEntries,
    marketGap,
  } = discoveryData;

  // Step 1: Create GitHub repo
  let githubUrl = null;
  try {
    const files = [
      {
        path: `${specification.libraryName.replace(/-/g, "_")}.py`,
        content: verifiedCode,
      },
      {
        path: "README.md",
        content: generateReadme(specification, approvedBridge),
      },
      {
        path: "requirements.txt",
        content: "pydantic>=2.0\n",
      },
    ];

    const repo = await createGithubRepo(
      specification.libraryName,
      specification.oneLiner,
      files
    );
    githubUrl = repo.url;
  } catch (err) {
    console.error("GitHub repo creation failed:", err.message);
  }

  // Step 2: Generate launch pack content
  const launchPrompt = `You are the Publisher agent for MERIDIAN.

GOAL ANCHOR: ${GOAL_ANCHOR}

INNOVATION: ${specification.libraryName} — ${specification.oneLiner}
BRIDGE: From ${approvedBridge.field}: ${approvedBridge.mechanism}
FRUSTRATION: ${frustrationData.painDescription}
MARKET GAP: ${marketGap}
VALIDATION: ${JSON.stringify(validationEntries?.slice(0, 2))}
GITHUB: ${githubUrl || "not created"}

Write THREE launch texts. Each should be authentic, technical, and never use the word "revolutionary" or "game-changing".

Respond with JSON only:
{
  "hnPost": "Full Show HN post text (3-4 paragraphs, include the problem, the bridge, and a link)",
  "productHuntPost": "Full Product Hunt description (2-3 paragraphs, include tagline)",
  "outreachMessages": [
    {
      "username": "${validationEntries?.[0]?.username || "developer"}",
      "avatarUrl": "",
      "publicComplaint": "their original complaint (from validation data)",
      "personalizedMessage": "A personal, non-spammy message explaining how this helps them specifically",
      "profileUrl": "their profile URL"
    }
  ]
}`;

  const launchPack = await callGemini(launchPrompt, {
    jsonMode: true,
    temperature: 0.5,
    maxOutputTokens: 4096,
  });

  return {
    githubUrl,
    pdfGenerated: true, // PDF generation handled separately
    launchPack,
  };
}

function generateReadme(spec, bridge) {
  return `# ${spec.libraryName}

${spec.oneLiner}

## The Innovation

This library applies a mechanism from **${bridge.field}** to software:

> ${bridge.mechanism}

**The structural analogy:** ${bridge.structuralAnalogy}

## Installation

\`\`\`bash
pip install git+https://github.com/YOUR_USERNAME/${spec.libraryName}
\`\`\`

## Quick Start

\`\`\`python
from ${spec.libraryName.replace(/-/g, "_")} import *
# See the module docstring for usage examples
\`\`\`

## Core Algorithm

${spec.coreAlgorithm}

## API

${spec.apiSurface.map((a) => `- \`${a.method}\`: ${a.params} -> ${a.returns}`).join("\n")}

## Limitations

${spec.limitations}

## What Would Make This Obsolete

${spec.invalidation}

---

*Discovered by [MERIDIAN](https://meridian.app) — Autonomous Innovation Discovery System*
`;
}

module.exports = { runAgent8 };
