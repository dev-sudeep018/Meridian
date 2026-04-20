const { onCall } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");

// Initialize Firebase Admin
initializeApp();

// ===== Pipeline Entry Point =====
exports.startDiscovery = onCall(
  {
    secrets: ["GEMINI_API_KEY", "GROQ_API_KEY", "TAVILY_API_KEY"],
    timeoutSeconds: 540,
    memory: "1GiB",
    maxInstances: 10,
  },
  require("./pipeline/orchestrator").startDiscovery
);

// ===== Overseer — Firestore Trigger =====
exports.overseer = onDocumentUpdated(
  {
    document: "discoveries/{discoveryId}",
    secrets: ["GEMINI_API_KEY"],
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  require("./overseer/overseer").handler
);
