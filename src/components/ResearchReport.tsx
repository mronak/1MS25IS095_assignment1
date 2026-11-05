/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  FileDown,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Cpu,
  Layers,
  GitBranch,
  Target,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ResearchReportData } from '../types/research.ts';
import { ArchitectureDiagram } from './ArchitectureDiagram.tsx';
import { ProjectOpportunities } from './ProjectOpportunities.tsx';
import { MetadataSection } from './MetadataSection.tsx';
import { downloadTextFile, formatReportAsText } from '../services/apiService.ts';
import { exportReportAsPdf } from '../services/pdfExportService.ts';

interface ResearchReportProps {
  report: ResearchReportData;
  onReset: () => void;
}

const SECTIONS = [
  { id: 'sec-overview', number: '01', title: 'Paper Overview', icon: BookOpen },
  { id: 'sec-problem', number: '02', title: 'Research Problem', icon: HelpCircle },
  { id: 'sec-methodology', number: '03', title: 'Methodology', icon: Cpu },
  { id: 'sec-breakdown', number: '04', title: 'Technical Breakdown', icon: Layers },
  { id: 'sec-architecture', number: '05', title: 'System Architecture', icon: GitBranch },
  { id: 'sec-importance', number: '06', title: 'Contributions & Limits', icon: Target },
  { id: 'sec-projects', number: '07', title: 'Student Opportunities', icon: Sparkles },
  { id: 'sec-metadata', number: '08', title: 'Paper Metadata', icon: Info },
];

export const ResearchReport: React.FC<ResearchReportProps> = ({ report, onReset }) => {
  const [activeSection, setActiveSection] = useState('sec-overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedMath, setExpandedMath] = useState(true);
  const [expandedWorkflowNotes, setExpandedWorkflowNotes] = useState(false);

  // Scroll spy to highlight active section in sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const copyTextToClipboard = async (text: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed', err);
    }
  };

  const handleDownloadTxt = () => {
    const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-papertrail-notes.txt`;
    const textContent = formatReportAsText(report);
    downloadTextFile(filename, textContent);
  };

  const handleDownloadJson = () => {
    const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-papertrail-data.json`;
    const jsonContent = JSON.stringify(report, null, 2);
    downloadTextFile(filename, jsonContent);
  };

  const handleDownloadPdf = () => {
    exportReportAsPdf(report);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E7E5E4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#78716C] mb-1">
            <span>INVESTIGATION REPORT</span>
            <span>·</span>
            <span className="uppercase text-[#C2410C] font-semibold">{report.analysisDepth.replace(/_/g, ' ')}</span>
            <span>·</span>
            <span>{report.analyzedAt}</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
            {report.title}
          </h2>
          <p className="text-xs text-[#57534E] mt-1">
            {report.metadata.authors && report.metadata.authors.length > 0 ? report.metadata.authors.join(' · ') : 'Academic Authors'} · {report.metadata.venue} ({report.metadata.year || 'Published'})
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#1C1917] bg-white hover:bg-[#F4F1EA] border border-[#E7E5E4] rounded shadow-xs transition-colors"
            title="Download publication-grade academic PDF report"
          >
            <FileDown className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>PDF Report</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#1C1917] bg-white hover:bg-[#F4F1EA] border border-[#E7E5E4] rounded shadow-xs transition-colors"
            title="Download formatted academic text notes"
          >
            <Download className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>TXT Report</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#1C1917] bg-white hover:bg-[#F4F1EA] border border-[#E7E5E4] rounded shadow-xs transition-colors"
            title="Download structured JSON report data"
          >
            <FileText className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>JSON</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#78716C] hover:text-[#C2410C] bg-transparent hover:bg-[#F4F1EA] border border-transparent rounded transition-colors"
            title="Start new paper investigation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Section Sidebar Navigator (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
          <div className="border border-[#E7E5E4] bg-white rounded-lg p-3 shadow-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#A8A29E] px-2 block mb-2 font-semibold">
              Report Sections
            </span>
            <nav className="space-y-0.5">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded transition-colors text-left ${
                      isActive
                        ? 'bg-[#F4F1EA] text-[#C2410C] font-semibold'
                        : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FBF9F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] text-[#A8A29E]">
                        {sec.number}
                      </span>
                      <span className="truncate">{sec.title}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Source Metadata Card */}
          <div className="border border-[#E7E5E4] bg-[#FBF9F5] rounded-lg p-3.5 text-xs space-y-2">
            <div className="font-mono text-[10px] text-[#78716C] uppercase tracking-wider font-semibold">
              Scope & Transparency
            </div>
            <p className="text-[#57534E] leading-relaxed text-[11px]">
              {report.sourceNotice}
            </p>
            <div className="pt-2 border-t border-[#E7E5E4] flex items-center justify-between text-[10px] font-mono text-[#A8A29E]">
              <span>Citations: {report.metadata.citationCount}</span>
              <span>{report.metadata.retrievalDate}</span>
            </div>
          </div>
        </aside>

        {/* Document Content Pane */}
        <div className="lg:col-span-9 space-y-12">
          {/* ========================================== */}
          {/* 01 — PAPER OVERVIEW */}
          {/* ========================================== */}
          <section id="sec-overview" className="border border-[#E7E5E4] bg-white rounded-lg p-6 sm:p-8 shadow-xs scroll-mt-24">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#C2410C]">
                  01
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917]">
                  Paper Overview & Executive Summary
                </h3>
              </div>
              <button
                onClick={() => copyTextToClipboard(report.executiveSummary, 'overview')}
                className="flex items-center gap-1 text-xs font-mono text-[#78716C] hover:text-[#1C1917] transition-colors p-1"
                title="Copy section"
              >
                {copiedSection === 'overview' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'overview' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="prose prose-stone max-w-none text-[#44403C] leading-relaxed space-y-4">
              <p className="text-base font-serif italic text-[#1C1917] border-l-2 border-[#C2410C] pl-4 py-1">
                {report.executiveSummary}
              </p>
            </div>
          </section>

          {/* ========================================== */}
          {/* 02 — RESEARCH PROBLEM */}
          {/* ========================================== */}
          <section id="sec-problem" className="border border-[#E7E5E4] bg-white rounded-lg p-6 sm:p-8 shadow-xs scroll-mt-24">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#C2410C]">
                  02
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917]">
                  Research Problem & Motivation
                </h3>
              </div>
              <button
                onClick={() =>
                  copyTextToClipboard(
                    `Problem: ${report.problem.researchProblem}\nMotivation: ${report.problem.motivation}\nObjective: ${report.problem.mainObjective}`,
                    'problem'
                  )
                }
                className="flex items-center gap-1 text-xs font-mono text-[#78716C] hover:text-[#1C1917] transition-colors p-1"
                title="Copy section"
              >
                {copiedSection === 'problem' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'problem' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                  Core Research Problem
                </span>
                <p className="text-[#1C1917] font-medium leading-relaxed">
                  {report.problem.researchProblem}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E7E5E4]">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    Motivation
                  </span>
                  <p className="text-[#44403C] leading-relaxed">
                    {report.problem.motivation}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    Main Objective
                  </span>
                  <p className="text-[#44403C] leading-relaxed">
                    {report.problem.mainObjective}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7E5E4] bg-[#FBF9F5] p-4 rounded">
                <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                  Limitations Addressed in Prior Research
                </span>
                <p className="text-[#44403C] leading-relaxed text-xs">
                  {report.problem.limitationsAddressed}
                </p>
              </div>
            </div>
          </section>

          {/* ========================================== */}
          {/* 03 — METHODOLOGY */}
          {/* ========================================== */}
          <section id="sec-methodology" className="border border-[#E7E5E4] bg-white rounded-lg p-6 sm:p-8 shadow-xs scroll-mt-24">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#C2410C]">
                  03
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917]">
                  Methodology & Mathematical Formulation
                </h3>
              </div>
              <button
                onClick={() =>
                  copyTextToClipboard(
                    `Solution: ${report.methodology.proposedSolution}\nMethodology: ${report.methodology.mainMethodology}\nMath: ${report.methodology.algorithmsOrMath}`,
                    'methodology'
                  )
                }
                className="flex items-center gap-1 text-xs font-mono text-[#78716C] hover:text-[#1C1917] transition-colors p-1"
                title="Copy section"
              >
                {copiedSection === 'methodology' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'methodology' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                  Proposed Solution
                </span>
                <p className="text-[#1C1917] font-medium leading-relaxed">
                  {report.methodology.proposedSolution}
                </p>
              </div>

              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                  Main Methodology
                </span>
                <p className="text-[#44403C] leading-relaxed">
                  {report.methodology.mainMethodology}
                </p>
              </div>

              {/* Algorithms / Math Formulations Callout */}
              <div className="border border-[#E7E5E4] rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedMath(!expandedMath)}
                  className="w-full bg-[#FBF9F5] px-4 py-3 flex items-center justify-between text-left text-xs font-mono font-semibold text-[#1C1917] hover:bg-[#F4F1EA] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#C2410C] font-bold">∑</span>
                    <span>Algorithms & Mathematical Techniques</span>
                  </span>
                  {expandedMath ? <ChevronUp className="w-4 h-4 text-[#78716C]" /> : <ChevronDown className="w-4 h-4 text-[#78716C]" />}
                </button>
                {expandedMath && (
                  <div className="p-4 bg-white text-xs font-mono text-[#292524] leading-relaxed border-t border-[#E7E5E4] overflow-x-auto whitespace-pre-wrap">
                    {report.methodology.algorithmsOrMath}
                  </div>
                )}
              </div>

              {/* Experimental Results & Benchmarks */}
              <div className="p-4 bg-emerald-50/50 rounded border border-emerald-100">
                <span className="font-mono text-xs uppercase tracking-wider text-emerald-800 font-semibold block mb-1">
                  Experimental Results & Benchmark Baselines
                </span>
                <p className="text-emerald-950 text-xs leading-relaxed">
                  {report.methodology.experimentalResults}
                </p>
              </div>

              {/* Key Contributions Checklist */}
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-2">
                  Key Research Contributions
                </span>
                <ul className="space-y-2">
                  {report.methodology.mainContributions.map((contrib, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#44403C]">
                      <span className="font-mono text-[#C2410C] font-bold mt-0.5">0{idx + 1}.</span>
                      <span className="leading-relaxed">{contrib}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ========================================== */}
          {/* 04 — TECHNICAL BREAKDOWN */}
          {/* ========================================== */}
          <section id="sec-breakdown" className="border border-[#E7E5E4] bg-white rounded-lg p-6 sm:p-8 shadow-xs scroll-mt-24">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#C2410C]">
                  04
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917]">
                  Technical Breakdown & Execution Stages
                </h3>
              </div>
              <button
                onClick={() =>
                  copyTextToClipboard(
                    `Input: ${report.technicalBreakdown.inputData}\nPreprocessing: ${report.technicalBreakdown.preprocessing}\nStages:\n${report.technicalBreakdown.processingStages.join('\n')}`,
                    'breakdown'
                  )
                }
                className="flex items-center gap-1 text-xs font-mono text-[#78716C] hover:text-[#1C1917] transition-colors p-1"
                title="Copy section"
              >
                {copiedSection === 'breakdown' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'breakdown' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#FBF9F5] rounded border border-[#E7E5E4]">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    Input Data
                  </span>
                  <p className="text-xs text-[#44403C] leading-relaxed">
                    {report.technicalBreakdown.inputData}
                  </p>
                </div>

                <div className="p-4 bg-[#FBF9F5] rounded border border-[#E7E5E4]">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    Preprocessing Pipeline
                  </span>
                  <p className="text-xs text-[#44403C] leading-relaxed">
                    {report.technicalBreakdown.preprocessing}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                  Main Models & Algorithms
                </span>
                <p className="text-[#1C1917] font-medium leading-relaxed">
                  {report.technicalBreakdown.mainModelsOrAlgorithms}
                </p>
              </div>

              {/* Sequential Processing Stages */}
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-3">
                  Sequential Processing Pipeline
                </span>
                <div className="space-y-2">
                  {report.technicalBreakdown.processingStages.map((stage, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-[#E7E5E4] rounded flex items-start gap-3 text-xs"
                    >
                      <span className="font-mono text-[11px] text-[#A8A29E] shrink-0 mt-0.5">
                        STAGE {idx + 1}
                      </span>
                      <p className="text-[#292524] leading-relaxed font-mono">
                        {stage}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E7E5E4]">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    Final System Output
                  </span>
                  <p className="text-xs text-[#44403C] leading-relaxed">
                    {report.technicalBreakdown.output}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    Dependencies & Hardware
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {report.technicalBreakdown.dependencies.map((dep, dIdx) => (
                      <span
                        key={dIdx}
                        className="font-mono text-[10px] px-2 py-0.5 bg-[#F4F1EA] text-[#44403C] rounded border border-[#E7E5E4]"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Explicit vs. Interpreted Note */}
              <div className="p-3.5 bg-[#FFFBEB] rounded border border-[#FDE68A] text-xs text-[#92400E]">
                <strong className="font-semibold">Explicit vs. Interpreted Workflow Note:</strong>{' '}
                {report.technicalBreakdown.explicitVsInterpretedNotes}
              </div>
            </div>
          </section>

          {/* ========================================== */}
          {/* 05 — SYSTEM ARCHITECTURE */}
          {/* ========================================== */}
          <section id="sec-architecture" className="scroll-mt-24">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#C2410C]">
                  05
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917]">
                  System Architecture Visualization
                </h3>
              </div>
            </div>

            <ArchitectureDiagram architecture={report.architecture} />
          </section>

          {/* ========================================== */}
          {/* 06 — CONTRIBUTIONS & LIMITATIONS */}
          {/* ========================================== */}
          <section id="sec-importance" className="border border-[#E7E5E4] bg-white rounded-lg p-6 sm:p-8 shadow-xs scroll-mt-24">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#C2410C]">
                  06
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917]">
                  What Makes This Research Important?
                </h3>
              </div>
              <button
                onClick={() =>
                  copyTextToClipboard(
                    `Prior State: ${report.importance.priorProblem}\nImprovements: ${report.importance.improvementsOverPriorArt}\nLimitations: ${report.importance.limitations}`,
                    'importance'
                  )
                }
                className="flex items-center gap-1 text-xs font-mono text-[#78716C] hover:text-[#1C1917] transition-colors p-1"
                title="Copy section"
              >
                {copiedSection === 'importance' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'importance' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                  Problem That Existed Before This Research
                </span>
                <p className="text-[#44403C] leading-relaxed">
                  {report.importance.priorProblem}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E7E5E4]">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    What This Paper Improves Over Prior Art
                  </span>
                  <p className="text-[#1C1917] font-medium leading-relaxed">
                    {report.importance.improvementsOverPriorArt}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    Why Its Approach Is Technically Significant
                  </span>
                  <p className="text-[#44403C] leading-relaxed">
                    {report.importance.whyApproachIsUseful}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E7E5E4]">
                <div className="p-4 bg-[#FBF9F5] rounded border border-[#E7E5E4]">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    Acknowledged Research Limitations
                  </span>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    {report.importance.limitations}
                  </p>
                </div>

                <div className="p-4 bg-[#FBF9F5] rounded border border-[#E7E5E4]">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    What Remains Unsolved in the Field
                  </span>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    {report.importance.unsolvedQuestions}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================== */}
          {/* 07 — STUDENT PROJECT OPPORTUNITIES */}
          {/* ========================================== */}
          <section id="sec-projects" className="scroll-mt-24">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#C2410C]">
                  07
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917]">
                  Student Project Opportunities (Undergraduate Portfolio)
                </h3>
              </div>
            </div>

            <ProjectOpportunities projects={report.studentProjects} />
          </section>

          {/* ========================================== */}
          {/* 08 — PAPER METADATA */}
          {/* ========================================== */}
          <section id="sec-metadata" className="scroll-mt-24">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#C2410C]">
                  08
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917]">
                  Paper Metadata & Citation Records
                </h3>
              </div>
            </div>

            <MetadataSection
              metadata={report.metadata}
              analysisDepth={report.analysisDepth}
              sourceNotice={report.sourceNotice}
            />
          </section>

          {/* Bottom Navigation & Reset Footer */}
          <div className="pt-8 pb-12 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#78716C] font-mono">
              End of PaperTrail Investigation Report · Generated for CS Research
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-medium text-[#1C1917] bg-white hover:bg-[#F4F1EA] border border-[#E7E5E4] rounded transition-colors shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>PDF Report</span>
              </button>
              <button
                onClick={handleDownloadTxt}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-medium text-[#1C1917] bg-white hover:bg-[#F4F1EA] border border-[#E7E5E4] rounded transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>TXT Report</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-medium text-[#1C1917] bg-white hover:bg-[#F4F1EA] border border-[#E7E5E4] rounded transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>JSON</span>
              </button>
              <button
                onClick={onReset}
                className="px-4 py-2 text-xs font-mono font-semibold bg-[#1C1917] hover:bg-[#C2410C] text-white rounded transition-colors shadow-xs ml-1"
              >
                Investigate Another Paper
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
