/**
 * Pipeline Orchestrator — Single long-running Cloud Function
 * Coordinates all 10 agents in the correct sequence:
 *   Agent 0 (Sharpener) -> [Agent 1, 2, 3] parallel -> Agent 4 (Critic)
 *   -> Agent 4.5 (Reality) -> Agent 5 (Translator) -> [Agent 6, 7] parallel
 *   -> Agent 8 (Publisher)
 *
 * Each agent's output is written to Firestore immediately,
 * which triggers the Overseer for quality evaluation.
 */
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const { runAgent0 } = require("../agents/agent0_sharpener");
const { runAgent1 } = require("../agents/agent1_frustration");
const { runAgent2 } = require("../agents/agent2_frontier");
const { runAgent3 } = require("../agents/agent3_adjacent");
const { runAgent4 } = require("../agents/agent4_critic");
const { runAgent45 } = require("../agents/agent45_reality");
const { runAgent5 } = require("../agents/agent5_translator");
const { runAgent6 } = require("../agents/agent6_verifier");
const { runAgent7 } = require("../agents/agent7_market");
const { runAgent8 } = require("../agents/agent8_publisher");
const { generatePdf } = require("../lib/pdfGenerator");

exports.startDiscovery = async (request) => {
  const { discoveryId, answers } = request.data;

  if (!discoveryId || !answers) {
    throw new Error("Missing discoveryId or answers");
  }

  const db = getFirestore();
  const docRef = db.collection("discoveries").doc(discoveryId);

  // Helper to update Firestore
  const updateDoc = async (data) => {
    await docRef.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  };

  try {
    // ===== PHASE 1: Agent 0 — Sharpener =====
    const brief = await runAgent0(answers);
    await updateDoc({ originalBrief: brief });

    // ===== PHASE 2: Agents 1, 2, 3 — Parallel =====
    const [agent1Result, agent2Result, agent3Result] = await Promise.all([
      runAgent1(brief),
      runAgent2(brief),
      runAgent3(brief, { painDescription: brief.problemStatement }),
    ]);

    await updateDoc({ agent1: agent1Result });
    await updateDoc({ agent2: agent2Result });
    await updateDoc({ agent3: agent3Result });

    // ===== PHASE 3: Agent 4 — Adversarial Critic =====
    const criticResult = await runAgent4(
      agent3Result.candidates,
      brief
    );

    if (!criticResult.approvedBridge) {
      await updateDoc({
        agent4: { approvedBridge: null },
        rejectedBridges: criticResult.rejectedBridges,
        status: "failed",
        failureReason: "No bridge survived all 3 rejection tests after retries",
      });
      return { success: false, reason: "No bridge approved" };
    }

    await updateDoc({
      agent4: criticResult,
      rejectedBridges: criticResult.rejectedBridges,
      adjacentDomain: criticResult.approvedBridge.field,
    });

    // ===== PHASE 4: Agent 4.5 — Reality Check =====
    const realityResult = await runAgent45(
      criticResult.approvedBridge,
      agent1Result
    );
    await updateDoc({ agent45: realityResult });

    // ===== PHASE 5: Agent 5 — Code Translation =====
    const codeResult = await runAgent5(
      criticResult.approvedBridge,
      brief,
      agent1Result
    );
    await updateDoc({ agent5: codeResult });

    // ===== PHASE 6: Agents 6, 7 — Parallel =====
    const [verifierResult, marketResult] = await Promise.all([
      runAgent6(codeResult),
      runAgent7(codeResult.specification, criticResult.approvedBridge),
    ]);

    await updateDoc({
      agent6: verifierResult,
      innovationName: codeResult.specification?.libraryName || "discovery",
    });
    await updateDoc({ agent7: marketResult });

    // ===== PHASE 7: Agent 8 — Publisher =====
    const publisherResult = await runAgent8({
      specification: codeResult.specification,
      verifiedCode: verifierResult.verifiedCode || codeResult.pythonCode,
      approvedBridge: criticResult.approvedBridge,
      frustrationData: agent1Result,
      validationEntries: realityResult.validationEntries,
      marketGap: marketResult.marketGap,
    });

    await updateDoc({
      agent8: {
        githubUrl: publisherResult.githubUrl,
        pdfGenerated: publisherResult.pdfGenerated,
      },
      launchPack: publisherResult.launchPack,
      githubUrl: publisherResult.githubUrl,
    });

    // ===== PHASE 8: Generate PDF =====
    try {
      const pdfBuffer = generatePdf({
        innovationName: codeResult.specification?.libraryName,
        brief,
        frustration: agent1Result,
        frontier: agent2Result,
        bridge: criticResult.approvedBridge,
        validation: realityResult,
        specification: codeResult.specification,
        code: verifierResult.verifiedCode || codeResult.pythonCode,
        marketGap: marketResult,
      });

      // Upload to Firebase Storage
      const bucket = getStorage().bucket();
      const pdfPath = `pdfs/${discoveryId}.pdf`;
      const file = bucket.file(pdfPath);

      await file.save(pdfBuffer, {
        metadata: { contentType: "application/pdf" },
      });

      // Make publicly readable
      await file.makePublic();
      const pdfUrl = `https://storage.googleapis.com/${bucket.name}/${pdfPath}`;

      await updateDoc({ pdfUrl });
    } catch (pdfErr) {
      console.error("PDF generation failed:", pdfErr.message);
    }

    // ===== COMPLETE =====
    await updateDoc({ status: "complete" });

    return { success: true, discoveryId };
  } catch (err) {
    console.error("Pipeline error:", err);
    await updateDoc({
      status: "error",
      error: err.message,
    });
    return { success: false, error: err.message };
  }
};
