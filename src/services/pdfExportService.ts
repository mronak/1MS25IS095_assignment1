/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import type { ResearchReportData } from '../types/research.ts';

/**
 * Generates and downloads a publication-grade academic PDF report for PaperTrail.
 */
export function exportReportAsPdf(report: ResearchReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const contentWidth = pageWidth - margin * 2;
  const bottomThreshold = pageHeight - margin - 30;

  let currentY = margin;

  // Color Palette Constants
  const COLOR_CHARCOAL: [number, number, number] = [28, 25, 23];
  const COLOR_BODY: [number, number, number] = [68, 64, 60];
  const COLOR_MUTED: [number, number, number] = [120, 113, 108];
  const COLOR_TERRACOTTA: [number, number, number] = [194, 65, 12];
  const COLOR_BORDER: [number, number, number] = [231, 229, 228];
  const COLOR_IVORY_BG: [number, number, number] = [251, 249, 245];
  const COLOR_GREEN_BG: [number, number, number] = [240, 253, 244];
  const COLOR_GREEN_TEXT: [number, number, number] = [21, 128, 61];
  const COLOR_GREEN_BORDER: [number, number, number] = [187, 247, 208];

  // Page Break & Space Checking Helper
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > bottomThreshold) {
      doc.addPage();
      currentY = margin + 15;
      // Draw subtle running top rule on continuation pages
      doc.setDrawColor(...COLOR_BORDER);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY - 10, pageWidth - margin, currentY - 10);
    }
  };

  // Section Header Helper
  const addSectionHeader = (number: string, title: string) => {
    checkPageBreak(50);
    currentY += 12;

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_TERRACOTTA);
    doc.text(number, margin, currentY);

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLOR_CHARCOAL);
    doc.text(title, margin + 22, currentY);

    currentY += 6;
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.75);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 14;
  };

  // Subsection Label Helper
  const addFieldLabel = (label: string) => {
    checkPageBreak(25);
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(label.toUpperCase(), margin, currentY);
    currentY += 11;
  };

  // Paragraph Text Helper
  const addParagraph = (text: string, fontSize = 9.5, isItalic = false) => {
    const lines = doc.splitTextToSize(text || 'Not specified', contentWidth);
    const lineHeight = fontSize * 1.35;
    checkPageBreak(lines.length * lineHeight + 8);

    doc.setFont('helvetica', isItalic ? 'italic' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...COLOR_BODY);
    doc.text(lines, margin, currentY);
    currentY += lines.length * lineHeight + 8;
  };

  // Callout Box Helper
  const addCalloutBox = (
    text: string,
    bgColor = COLOR_IVORY_BG,
    borderColor = COLOR_BORDER,
    textColor = COLOR_BODY,
    fontFamily = 'helvetica',
    fontSize = 9.5
  ) => {
    const boxPadding = 10;
    const textWidth = contentWidth - boxPadding * 2;
    const lines = doc.splitTextToSize(text || 'Not specified', textWidth);
    const lineHeight = fontSize * 1.35;
    const boxHeight = lines.length * lineHeight + boxPadding * 2;

    checkPageBreak(boxHeight + 10);

    doc.setFillColor(...bgColor);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 3, 3, 'FD');

    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...textColor);
    doc.text(lines, margin + boxPadding, currentY + boxPadding + fontSize * 0.9);

    currentY += boxHeight + 10;
  };

  // ==========================================
  // DOCUMENT COVER / HEADER
  // ==========================================
  // Top brand marker
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_TERRACOTTA);
  doc.text('PAPERTRAIL — RESEARCH PAPER INVESTIGATION WORKSPACE', margin, currentY);
  currentY += 14;

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLOR_CHARCOAL);
  const titleLines = doc.splitTextToSize(report.title, contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 20 + 4;

  // Metadata ribbon
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_MUTED);

  const authorsText = report.metadata.authors?.length
    ? report.metadata.authors.slice(0, 4).join(', ') + (report.metadata.authors.length > 4 ? ' et al.' : '')
    : 'Authors not documented';
  const venueText = `${report.metadata.venue || 'Academic Publication'} (${report.metadata.year || 'Published'})`;
  const metaLine = `${authorsText}  ·  ${venueText}`;
  doc.text(doc.splitTextToSize(metaLine, contentWidth), margin, currentY);
  currentY += 16;

  // Scope & Retrieval Banner
  doc.setFillColor(...COLOR_IVORY_BG);
  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, contentWidth, 26, 3, 3, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_TERRACOTTA);
  doc.text(`SCOPE: ${report.analysisDepth.toUpperCase().replace(/_/g, ' ')}`, margin + 10, currentY + 16);

  doc.setFont('courier', 'normal');
  doc.setTextColor(...COLOR_MUTED);
  const dateStr = `INVESTIGATION DATE: ${report.analyzedAt || new Date().toISOString().split('T')[0]}`;
  const dateWidth = doc.getTextWidth(dateStr);
  doc.text(dateStr, pageWidth - margin - dateWidth - 10, currentY + 16);

  currentY += 34;

  // ==========================================
  // 01 — PAPER OVERVIEW
  // ==========================================
  addSectionHeader('01', 'Paper Overview & Executive Summary');
  addCalloutBox(
    report.executiveSummary,
    COLOR_IVORY_BG,
    COLOR_BORDER,
    COLOR_CHARCOAL,
    'times',
    10.5
  );

  // ==========================================
  // 02 — RESEARCH PROBLEM & MOTIVATION
  // ==========================================
  addSectionHeader('02', 'Research Problem & Motivation');

  addFieldLabel('Core Research Problem');
  addParagraph(report.problem.researchProblem);

  addFieldLabel('Motivation');
  addParagraph(report.problem.motivation);

  addFieldLabel('Main Objective');
  addParagraph(report.problem.mainObjective);

  addFieldLabel('Limitations Addressed in Prior Research');
  addParagraph(report.problem.limitationsAddressed);

  // ==========================================
  // 03 — METHODOLOGY & FORMULATION
  // ==========================================
  addSectionHeader('03', 'Methodology & Algorithmic Formulation');

  addFieldLabel('Proposed Solution');
  addParagraph(report.methodology.proposedSolution);

  addFieldLabel('Main Methodology');
  addParagraph(report.methodology.mainMethodology);

  if (report.methodology.algorithmsOrMath) {
    addFieldLabel('Mathematical Formulations & Algorithms');
    addCalloutBox(
      report.methodology.algorithmsOrMath,
      [248, 250, 252],
      COLOR_BORDER,
      [30, 41, 59],
      'courier',
      8.5
    );
  }

  addFieldLabel('Experimental Results & Baselines');
  addParagraph(report.methodology.experimentalResults);

  if (report.methodology.mainContributions?.length) {
    addFieldLabel('Key Research Contributions');
    report.methodology.mainContributions.forEach((contrib, idx) => {
      addParagraph(`${idx + 1}.  ${contrib}`, 9);
    });
  }

  // ==========================================
  // 04 — TECHNICAL BREAKDOWN
  // ==========================================
  addSectionHeader('04', 'Technical Breakdown & Execution Pipeline');

  addFieldLabel('Input Data Specification');
  addParagraph(report.technicalBreakdown.inputData);

  addFieldLabel('Preprocessing Pipeline');
  addParagraph(report.technicalBreakdown.preprocessing);

  addFieldLabel('Main Models & Algorithmic Mechanics');
  addParagraph(report.technicalBreakdown.mainModelsOrAlgorithms);

  if (report.technicalBreakdown.processingStages?.length) {
    addFieldLabel('Sequential Execution Stages');
    report.technicalBreakdown.processingStages.forEach((stage) => {
      addParagraph(`•  ${stage}`, 9);
    });
  }

  addFieldLabel('System Output');
  addParagraph(report.technicalBreakdown.output);

  if (report.technicalBreakdown.dependencies?.length) {
    addFieldLabel('Dependencies & Environments');
    addParagraph(report.technicalBreakdown.dependencies.join('  ·  '));
  }

  if (report.technicalBreakdown.explicitVsInterpretedNotes) {
    addFieldLabel('Explicit vs. Interpreted Note');
    addParagraph(report.technicalBreakdown.explicitVsInterpretedNotes, 9, true);
  }

  // ==========================================
  // 05 — SYSTEM ARCHITECTURE
  // ==========================================
  addSectionHeader('05', 'System Architecture & Data Flow');

  if (report.architecture.componentsSummary?.length) {
    addFieldLabel('Architectural Highlights');
    report.architecture.componentsSummary.forEach((comp) => {
      addParagraph(`•  ${comp}`, 9);
    });
  }

  if (report.architecture.missingOrInferredComponents) {
    addFieldLabel('Omitted or Inferred Components');
    addParagraph(report.architecture.missingOrInferredComponents, 9, true);
  }

  addFieldLabel('Mermaid.js Flowchart Specification (graph TD)');
  const cleanMermaid = report.architecture.mermaidCode
    ? report.architecture.mermaidCode.replace(/^```mermaid\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    : 'graph TD\n  A[Input] --> B[Processing] --> C[Output]';
  addCalloutBox(cleanMermaid, [24, 24, 27], [39, 39, 42], [244, 244, 245], 'courier', 8);

  // ==========================================
  // 06 — CONTRIBUTIONS & LIMITATIONS
  // ==========================================
  addSectionHeader('06', 'Contributions, Limitations & Unsolved Questions');

  addFieldLabel('State of the Art Prior to This Research');
  addParagraph(report.importance.priorProblem);

  addFieldLabel('Improvements Over Prior Art');
  addParagraph(report.importance.improvementsOverPriorArt);

  addFieldLabel('Significance of Approach');
  addParagraph(report.importance.whyApproachIsUseful);

  addFieldLabel('Acknowledged Research Limitations');
  addParagraph(report.importance.limitations);

  addFieldLabel('Unsolved Research Questions');
  addParagraph(report.importance.unsolvedQuestions);

  // ==========================================
  // 07 — STUDENT PROJECT OPPORTUNITIES
  // ==========================================
  addSectionHeader('07', 'Student Project Opportunities (Undergraduate Portfolio)');

  report.studentProjects.forEach((proj, idx) => {
    checkPageBreak(120);

    // Project Header Box
    doc.setFillColor(...COLOR_IVORY_BG);
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_TERRACOTTA);
    doc.text(`PROJECT 0${idx + 1}:`, margin + 8, currentY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_CHARCOAL);
    doc.text(proj.name, margin + 74, currentY + 16);

    const diffStr = `[${proj.difficulty.toUpperCase()} DIFFICULTY]`;
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    const diffWidth = doc.getTextWidth(diffStr);
    doc.text(diffStr, pageWidth - margin - diffWidth - 8, currentY + 16);

    currentY += 32;

    // Project details
    addFieldLabel('Limitation Addressed');
    addParagraph(proj.gapAddressed, 9);

    addFieldLabel('Proposed Technical Improvement');
    addParagraph(proj.proposedImprovement, 9);

    addFieldLabel('Implementation Mechanism');
    addParagraph(proj.howItWorks, 9);

    // MEASURABLE OUTCOME (CRITICAL FIELD — ALWAYS VISIBLE)
    const outcomeText =
      proj.measurableOutcome?.trim() ||
      proj.expectedOutcome?.trim() ||
      proj.expectedMeasurableOutcome?.trim() ||
      'Not specified';

    addFieldLabel('Expected Measurable Outcome');
    addCalloutBox(
      outcomeText,
      COLOR_GREEN_BG,
      COLOR_GREEN_BORDER,
      COLOR_GREEN_TEXT,
      'courier',
      9
    );

    addFieldLabel('Recommended Technology Stack');
    addParagraph(proj.recommendedStack?.join(', ') || 'Not specified', 9);

    currentY += 6;
  });

  // ==========================================
  // 08 — PAPER METADATA
  // ==========================================
  addSectionHeader('08', 'Paper Metadata & Citation Records');

  addFieldLabel('Verified Title');
  addParagraph(report.metadata.title);

  addFieldLabel('Authors');
  addParagraph(report.metadata.authors?.join(', ') || 'Not listed');

  addFieldLabel('Publication Venue & Year');
  addParagraph(`${report.metadata.venue || 'Academic Venue'} (${report.metadata.year || 'Unavailable'})`);

  addFieldLabel('Digital Object Identifier (DOI)');
  addParagraph(report.metadata.doi || 'Unavailable');

  addFieldLabel('Citation Count & Retrieval Source');
  addParagraph(`${report.metadata.citationCount} (Source: ${report.metadata.retrievalSource}, Retrieved: ${report.metadata.retrievalDate})`);

  // ==========================================
  // RUNNING FOOTERS ON ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Subtle bottom rule
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_MUTED);
    doc.text('PaperTrail Research Workspace · Computer Science Capstone', margin, pageHeight - 20);

    const pageStr = `Page ${i} of ${totalPages}`;
    const pageNumWidth = doc.getTextWidth(pageStr);
    doc.text(pageStr, pageWidth - margin - pageNumWidth, pageHeight - 20);
  }

  // Trigger browser download
  const cleanFilename = `${(report.title || 'research-paper').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-papertrail-report.pdf`;
  doc.save(cleanFilename);
}
