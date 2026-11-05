/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AnalysisDepth = 'full_document' | 'abstract_and_extract' | 'metadata_only';

export type InputMode = 'pdf' | 'url' | 'title';

export interface ProblemSection {
  researchProblem: string;
  motivation: string;
  mainObjective: string;
  limitationsAddressed: string;
}

export interface MethodologySection {
  proposedSolution: string;
  mainMethodology: string;
  algorithmsOrMath: string;
  experimentalResults: string;
  mainContributions: string[];
}

export interface TechnicalBreakdownSection {
  inputData: string;
  preprocessing: string;
  mainModelsOrAlgorithms: string;
  processingStages: string[];
  output: string;
  dependencies: string[];
  explicitVsInterpretedNotes: string;
}

export interface ArchitectureSection {
  mermaidCode: string;
  componentsSummary: string[];
  missingOrInferredComponents?: string;
}

export interface ImportanceSection {
  priorProblem: string;
  improvementsOverPriorArt: string;
  whyApproachIsUseful: string;
  limitations: string;
  unsolvedQuestions: string;
}

export interface StudentProject {
  id: string;
  name: string;
  gapAddressed: string;
  proposedImprovement: string;
  howItWorks: string;
  measurableOutcome: string;
  recommendedStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expectedOutcome?: string;
  expectedMeasurableOutcome?: string;
}

export interface PaperMetadata {
  title: string;
  authors: string[];
  venue: string;
  year: string;
  doi: string;
  citationCount: string;
  retrievalSource: string;
  retrievalDate: string;
}

export interface ResearchReportData {
  title: string;
  analysisDepth: AnalysisDepth;
  sourceNotice: string;
  sourceType: InputMode;
  sourceIdentifier: string;
  analyzedAt: string;
  executiveSummary: string;
  problem: ProblemSection;
  methodology: MethodologySection;
  technicalBreakdown: TechnicalBreakdownSection;
  architecture: ArchitectureSection;
  importance: ImportanceSection;
  studentProjects: StudentProject[];
  metadata: PaperMetadata;
}

export interface AnalysisRequestPayload {
  mode: InputMode;
  title?: string;
  url?: string;
  pdfBase64?: string;
  pdfFileName?: string;
}

export interface AnalysisErrorResponse {
  success: false;
  error: string;
  code?: 'ACCESS_RESTRICTED' | 'INVALID_INPUT' | 'EXTRACTION_FAILED' | 'API_ERROR';
  fallback?: 'pdf' | 'url' | 'title';
  details?: string;
}
