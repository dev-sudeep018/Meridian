/**
 * Client-side PDF generation for MERIDIAN discovery reports.
 * Uses jsPDF to create downloadable reports as data URIs.
 */
import { jsPDF } from 'jspdf'

const COLORS = {
  bg: [13, 13, 13],
  card: [20, 20, 20],
  accent: [78, 205, 196],
  text: [245, 245, 245],
  muted: [160, 160, 160],
  section: [30, 30, 30],
}

export function generateDiscoveryPDF(data) {
  const {
    brief, frustration, frontier, bridge, rejectedBridges,
    reality, specification, pythonCode, verifier, market,
    launchPack, scores,
  } = data

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = 210
  const margin = 15
  const contentW = pageW - margin * 2
  let y = margin

  // Helper functions
  const setColor = (rgb) => doc.setTextColor(rgb[0], rgb[1], rgb[2])
  const addPage = () => { doc.addPage(); y = margin }
  const checkPage = (needed = 30) => { if (y + needed > 280) addPage() }

  // ——— COVER PAGE ———
  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, 210, 297, 'F')

  // Title
  doc.setFontSize(32)
  setColor(COLORS.accent)
  doc.text('MERIDIAN', pageW / 2, 60, { align: 'center' })

  doc.setFontSize(10)
  setColor(COLORS.muted)
  doc.text('AUTONOMOUS INNOVATION DISCOVERY', pageW / 2, 70, { align: 'center' })

  // Innovation name
  if (specification?.libraryName) {
    doc.setFontSize(24)
    setColor(COLORS.text)
    doc.text(specification.libraryName, pageW / 2, 100, { align: 'center' })

    doc.setFontSize(12)
    setColor(COLORS.muted)
    const oneLiner = doc.splitTextToSize(specification.oneLiner || '', contentW - 20)
    doc.text(oneLiner, pageW / 2, 112, { align: 'center' })
  }

  // Scores
  y = 140
  doc.setFontSize(11)
  setColor(COLORS.accent)
  doc.text(`TRAJECTORY: ${scores?.trajectory || '-'}/10`, pageW / 2, y, { align: 'center' })
  doc.text(`CREDIBILITY: ${scores?.credibility || '-'}/10`, pageW / 2, y + 8, { align: 'center' })
  doc.text(`NOVELTY: ${scores?.novelty || '-'}/10`, pageW / 2, y + 16, { align: 'center' })

  // Bridge
  if (bridge) {
    y = 180
    doc.setFontSize(10)
    setColor(COLORS.muted)
    doc.text(`Cross-domain bridge: ${bridge.field}`, pageW / 2, y, { align: 'center' })
    doc.text(`Mechanism: ${bridge.mechanism}`, pageW / 2, y + 7, { align: 'center' })
  }

  // Date
  doc.setFontSize(9)
  setColor(COLORS.muted)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageW / 2, 270, { align: 'center' })

  // ——— PAGE 2: Problem & Research ———
  addPage()
  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, 210, 297, 'F')

  const sectionTitle = (title) => {
    checkPage(20)
    doc.setFontSize(14)
    setColor(COLORS.accent)
    doc.text(title, margin, y)
    y += 3
    doc.setDrawColor(...COLORS.accent)
    doc.setLineWidth(0.3)
    doc.line(margin, y, margin + contentW, y)
    y += 7
  }

  const bodyText = (text, maxW = contentW) => {
    doc.setFontSize(10)
    setColor(COLORS.text)
    const lines = doc.splitTextToSize(text || 'N/A', maxW)
    checkPage(lines.length * 5 + 5)
    doc.text(lines, margin, y)
    y += lines.length * 5 + 4
  }

  const label = (lbl, val) => {
    checkPage(12)
    doc.setFontSize(9)
    setColor(COLORS.accent)
    doc.text(lbl, margin, y)
    doc.setFontSize(10)
    setColor(COLORS.text)
    const lines = doc.splitTextToSize(String(val || 'N/A'), contentW - 5)
    doc.text(lines, margin, y + 5)
    y += 5 + lines.length * 5 + 3
  }

  sectionTitle('1. Problem Statement')
  bodyText(brief?.problemStatement)
  label('Target Persona', brief?.targetPersona)
  label('Prior Attempts', brief?.priorAttempts)

  sectionTitle('2. Developer Frustration')
  label('Problem', frustration?.problemTitle)
  bodyText(frustration?.painDescription)
  if (frustration?.soQuestionUrl) {
    label('Stack Overflow', `${frustration.soQuestionTitle} (${frustration.upvoteCount} upvotes)`)
  }

  sectionTitle('3. Frontier Capability')
  label('Capability', frontier?.capabilityName)
  bodyText(frontier?.description)
  label('Source', frontier?.sourceUrl || 'N/A')

  // ——— PAGE 3: Bridge & Validation ———
  addPage()
  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, 210, 297, 'F')

  sectionTitle('4. Cross-Domain Bridge')
  label('Field', bridge?.field)
  label('Mechanism', bridge?.mechanism)
  bodyText(bridge?.structuralAnalogy)
  label('Approval Reason', bridge?.approvalReason)

  if (rejectedBridges?.length) {
    checkPage(20)
    doc.setFontSize(9)
    setColor(COLORS.muted)
    doc.text('Rejected bridges:', margin, y)
    y += 5
    rejectedBridges.forEach((rb) => {
      checkPage(10)
      doc.text(`  - ${rb.field}: ${rb.mechanism} (${rb.rejectionReason})`, margin, y)
      y += 5
    })
    y += 3
  }

  sectionTitle('5. Reality Check')
  label('Validation Strength', reality?.validationStrength)
  if (reality?.validationEntries?.length) {
    reality.validationEntries.forEach((v, i) => {
      checkPage(15)
      label(`Developer ${i + 1} (${v.platform})`, `@${v.username}: "${v.exactQuote}"`)
    })
  }

  // ——— PAGE 4: Technical Spec ———
  addPage()
  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, 210, 297, 'F')

  sectionTitle('6. Technical Specification')
  label('Library Name', specification?.libraryName)
  label('One-liner', specification?.oneLiner)
  bodyText(specification?.coreAlgorithm)
  label('Primary Use Case', specification?.primaryUseCase)
  label('Limitations', specification?.limitations)

  if (specification?.apiSurface?.length) {
    checkPage(15)
    doc.setFontSize(9)
    setColor(COLORS.accent)
    doc.text('API Surface:', margin, y)
    y += 5
    specification.apiSurface.forEach((api) => {
      checkPage(10)
      setColor(COLORS.text)
      doc.setFontSize(9)
      doc.text(`  ${api.method}(${api.params}) -> ${api.returns}`, margin, y)
      y += 5
    })
    y += 3
  }

  // ——— PAGE 5: Code ———
  if (pythonCode) {
    addPage()
    doc.setFillColor(...COLORS.bg)
    doc.rect(0, 0, 210, 297, 'F')

    sectionTitle('7. Generated Code')
    label('Verification', verifier?.verdict === 'pass' ? 'PASSED' : 'REVIEW NEEDED')

    doc.setFontSize(7)
    setColor([200, 200, 200])
    // Clean code from markdown fences
    const cleanCode = pythonCode.replace(/```python\n?/g, '').replace(/```\n?/g, '').trim()
    const codeLines = doc.splitTextToSize(cleanCode.substring(0, 3000), contentW)
    codeLines.forEach((line) => {
      checkPage(4)
      doc.text(line, margin, y)
      y += 3.5
    })
  }

  // ——— PAGE 6: Market & Launch ———
  addPage()
  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, 210, 297, 'F')

  sectionTitle('8. Market Analysis')
  bodyText(market?.marketGap)
  if (market?.competitors?.length) {
    market.competitors.forEach((c) => {
      checkPage(15)
      label(c.name, `${c.description} | Gap: ${c.specificGap}`)
    })
  }

  if (launchPack?.hnPost) {
    sectionTitle('9. Show HN Post')
    bodyText(launchPack.hnPost)
  }

  // Return as data URI
  return doc.output('datauristring')
}
