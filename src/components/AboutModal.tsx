/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck, Cpu, Code2, Layers, BookCheck, ExternalLink } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-[#FBF9F5] border border-[#D6D3D1] rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#FBF9F5] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 id="about-modal-title" className="font-serif text-xl font-bold text-[#1C1917]">
              About PaperTrail & Research Agent
            </h2>
            <p className="text-xs font-mono text-[#78716C] mt-0.5">
              CS Capstone Project · Practical Generative AI & Prompt Engineering
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-[#E7E5E4] transition-colors focus-visible:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-6 text-sm text-[#44403C] leading-relaxed">
          {/* Mission */}
          <div className="border border-[#E7E5E4] bg-white p-4 rounded">
            <h3 className="font-serif text-base font-semibold text-[#1C1917] mb-1">
              "Go beyond the abstract."
            </h3>
            <p className="text-[#57534E]">
              PaperTrail is a student-built research notebook engineered to help undergraduate computer science students deconstruct dense academic literature into understandable technical workflows, render authentic system architectures, and identify portfolio-ready development opportunities.
            </p>
          </div>

          {/* Prompt Engineering Techniques */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold mb-3">
              Prompt Engineering Architecture
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-[#E7E5E4] p-3 rounded bg-[#FBF9F5]">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-4 h-4 text-[#C2410C]" />
                  <span className="font-semibold text-xs text-[#1C1917]">Role-Based Prompting</span>
                </div>
                <p className="text-xs text-[#78716C]">
                  Directs the model as an expert Computer Science research analyst specializing in algorithmic mechanics, systems architecture, and undergraduate mentoring.
                </p>
              </div>

              <div className="border border-[#E7E5E4] p-3 rounded bg-[#FBF9F5]">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-[#C2410C]" />
                  <span className="font-semibold text-xs text-[#1C1917]">Task Decomposition</span>
                </div>
                <p className="text-xs text-[#78716C]">
                  Breaks analysis into 6 discrete stages (Understanding, Workflow, Architecture, Importance, Student Projects, and Metadata) preventing cognitive overload.
                </p>
              </div>

              <div className="border border-[#E7E5E4] p-3 rounded bg-[#FBF9F5]">
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="w-4 h-4 text-[#C2410C]" />
                  <span className="font-semibold text-xs text-[#1C1917]">Few-Shot Exemplars</span>
                </div>
                <p className="text-xs text-[#78716C]">
                  Provides canonical structure demonstrating exact formatting, balanced technical rigor, and valid Mermaid diagram syntax without biasing paper content.
                </p>
              </div>

              <div className="border border-[#E7E5E4] p-3 rounded bg-[#FBF9F5]">
                <div className="flex items-center gap-2 mb-1">
                  <BookCheck className="w-4 h-4 text-[#C2410C]" />
                  <span className="font-semibold text-xs text-[#1C1917]">Strict Structured Output</span>
                </div>
                <p className="text-xs text-[#78716C]">
                  Enforces validated JSON schema output consumed by independent UI modules, ensuring predictable formatting and zero markdown chatter.
                </p>
              </div>
            </div>
          </div>

          {/* Reliability & Guardrails */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold mb-2">
              Academic Reliability & Scope Transparency
            </h4>
            <ul className="space-y-2 text-xs text-[#57534E]">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Hallucination Mandate:</strong> The agent strictly distinguishes between explicitly documented mechanisms and reasonable conceptual inferences.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                <span>
                  <strong>Citation & DOI Grounding:</strong> Title queries cross-reference live records from Crossref and Semantic Scholar. If citations cannot be verified, "Unavailable" is declared.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                <span>
                  <strong>Full vs. Abstract Disclosure:</strong> When only an abstract or open extract is accessible, the report explicitly states this limitation and never claims full document analysis.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                <span>
                  <strong>Backend Security:</strong> API keys and secrets stay exclusively on the Express backend (<code className="font-mono text-[11px] bg-[#E7E5E4] px-1 py-0.5 rounded">process.env.GEMINI_API_KEY</code>) and are never exposed in bundles or exports.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#E7E5E4] px-6 py-3.5 bg-[#F4F1EA] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#78716C]">
            Model: Google Gemini 3.8 Flash
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#1C1917] text-[#FBF9F5] rounded hover:bg-[#C2410C] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
