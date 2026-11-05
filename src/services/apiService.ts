/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AnalysisRequestPayload, ResearchReportData, AnalysisErrorResponse } from '../types/research.ts';

/**
 * Converts a browser File object to a base64 encoded string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Dispatches paper investigation request to the Express backend.
 */
export async function investigatePaper(payload: AnalysisRequestPayload): Promise<ResearchReportData> {
  const response = await fetch('/api/analyze-paper', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorData = data as AnalysisErrorResponse;
    const error = new Error(errorData.error || 'Investigation failed');
    (error as any).code = errorData.code;
    (error as any).fallback = errorData.fallback;
    throw error;
  }

  return data.data as ResearchReportData;
}

/**
 * Downloads a text file to the user's computer.
 */
export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats research report data into a clean, human-readable TXT file.
 */
export function formatReportAsText(report: ResearchReportData): string {
  const divider = '='.repeat(76);
  const subDivider = '-'.repeat(76);

  return `${divider}
PAPERTRAIL — RESEARCH PAPER INVESTIGATION REPORT
${divider}

TITLE: ${report.title}
ANALYSIS DEPTH: ${report.analysisDepth.toUpperCase()}
SOURCE: ${report.sourceNotice}
INVESTIGATION DATE: ${report.analyzedAt}

${subDivider}
01 — EXECUTIVE SUMMARY
${subDivider}
${report.executiveSummary}

${subDivider}
02 — RESEARCH PROBLEM & MOTIVATION
${subDivider}
• Problem:
  ${report.problem.researchProblem}

• Motivation:
  ${report.problem.motivation}

• Main Objective:
  ${report.problem.mainObjective}

• Limitations Addressed in Prior Work:
  ${report.problem.limitationsAddressed}

${subDivider}
03 — METHODOLOGY & PROPOSED SOLUTION
${subDivider}
• Proposed Solution:
  ${report.methodology.proposedSolution}

• Main Methodology:
  ${report.methodology.mainMethodology}

• Algorithmic & Mathematical Techniques:
  ${report.methodology.algorithmsOrMath}

• Experimental Results & Benchmarks:
  ${report.methodology.experimentalResults}

• Key Contributions:
${report.methodology.mainContributions.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}

${subDivider}
04 — TECHNICAL BREAKDOWN & WORKFLOW
${subDivider}
• Input Data:
  ${report.technicalBreakdown.inputData}

• Preprocessing Pipeline:
  ${report.technicalBreakdown.preprocessing}

• Core Models / Algorithms:
  ${report.technicalBreakdown.mainModelsOrAlgorithms}

• Processing Stages:
${report.technicalBreakdown.processingStages.map((s) => `  ${s}`).join('\n')}

• System Output:
  ${report.technicalBreakdown.output}

• Dependencies & Execution Environment:
${report.technicalBreakdown.dependencies.map((d) => `  - ${d}`).join('\n')}

• Explicit vs. Interpreted Workflow Notes:
  ${report.technicalBreakdown.explicitVsInterpretedNotes}

${subDivider}
05 — SYSTEM ARCHITECTURE (MERMAID SPECIFICATION)
${subDivider}
${report.architecture.mermaidCode}

• Architectural Highlights:
${report.architecture.componentsSummary.map((c) => `  - ${c}`).join('\n')}
${report.architecture.missingOrInferredComponents ? `\n• Missing / Inferred Details:\n  ${report.architecture.missingOrInferredComponents}` : ''}

${subDivider}
06 — CONTRIBUTIONS, LIMITATIONS & UNSOLVED QUESTIONS
${subDivider}
• Prior State of the Art:
  ${report.importance.priorProblem}

• Key Improvements:
  ${report.importance.improvementsOverPriorArt}

• Significance of Approach:
  ${report.importance.whyApproachIsUseful}

• Research Limitations:
  ${report.importance.limitations}

• Unsolved Research Questions:
  ${report.importance.unsolvedQuestions}

${subDivider}
07 — STUDENT PROJECT OPPORTUNITIES (UNDERGRADUATE PORTFOLIO)
${subDivider}
${report.studentProjects
  .map(
    (p, i) => `[PROJECT 0${i + 1}] ${p.name} (${p.difficulty.toUpperCase()})
• Limitation Addressed: ${p.gapAddressed}
• Proposed Improvement: ${p.proposedImprovement}
• Mechanism & Implementation: ${p.howItWorks}
• Measurable Outcome: ${p.measurableOutcome?.trim() || p.expectedOutcome?.trim() || p.expectedMeasurableOutcome?.trim() || 'Not specified'}
• Recommended Tech Stack: ${p.recommendedStack?.join(', ') || 'Not specified'}
`
  )
  .join('\n')}
${subDivider}
08 — PAPER METADATA & CITATION VERIFICATION
${subDivider}
• Title: ${report.metadata.title}
• Authors: ${report.metadata.authors.join(', ')}
• Venue / Journal: ${report.metadata.venue}
• Year: ${report.metadata.year}
• DOI / URL: ${report.metadata.doi}
• Citation Count: ${report.metadata.citationCount}
• Retrieval Source: ${report.metadata.retrievalSource}
• Retrieval Date: ${report.metadata.retrievalDate}

${divider}
Generated by PaperTrail Research Workspace — College CS Capstone Assignment
${divider}
`;
}
