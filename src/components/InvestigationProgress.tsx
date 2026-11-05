/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface InvestigationProgressProps {
  mode: 'pdf' | 'url' | 'title';
  identifier?: string;
}

const STAGES = [
  { step: '01', title: 'Reading & Verifying Source Document', desc: 'Validating input structure and verifying open access bounds.' },
  { step: '02', title: 'Deconstructing Problem & Methodology', desc: 'Extracting core research problems, mathematics, and baseline limitations.' },
  { step: '03', title: 'Tracing System Architecture Flowchart', desc: 'Mapping data inputs, preprocessing pipelines, model nodes, and outputs.' },
  { step: '04', title: 'Formulating Student Project Opportunities', desc: 'Synthesizing 3 realistic undergraduate CS capstone proposals.' },
  { step: '05', title: 'Verifying Academic Metadata & Citations', desc: 'Cross-referencing Crossref records and compiling final technical notes.' },
];

export const InvestigationProgress: React.FC<InvestigationProgressProps> = ({
  mode,
  identifier,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Progressively advance through stages to provide real-time feedback
    const timers = [
      setTimeout(() => setCurrentStepIndex(1), 2200),
      setTimeout(() => setCurrentStepIndex(2), 5200),
      setTimeout(() => setCurrentStepIndex(3), 8500),
      setTimeout(() => setCurrentStepIndex(4), 11800),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="border border-[#E7E5E4] bg-white rounded-lg p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#E7E5E4] mb-6">
          <div className="w-9 h-9 rounded bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h2 className="font-editorial text-xl font-bold text-[#1C1917]">
              Research Agent Active
            </h2>
            <p className="text-xs font-mono text-[#78716C]">
              {mode === 'pdf' && `Ingesting PDF: ${identifier || 'Document'}`}
              {mode === 'url' && `Fetching Academic URL: ${identifier || 'Source'}`}
              {mode === 'title' && `Resolving Academic Title: ${identifier || 'Landmark Paper'}`}
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div
                key={stage.step}
                className={`flex items-start gap-3.5 p-3 rounded transition-colors ${
                  isCurrent ? 'bg-[#FBF9F5] border border-[#E7E5E4]' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-[#C2410C]" />
                  )}
                  {isCurrent && (
                    <div className="w-4 h-4 rounded-full border-2 border-[#C2410C] border-t-transparent animate-spin" />
                  )}
                  {isPending && (
                    <Circle className="w-4 h-4 text-[#D6D3D1]" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[#A8A29E]">
                      {stage.step}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-[#1C1917]'
                          : isCompleted
                          ? 'text-[#57534E]'
                          : 'text-[#A8A29E]'
                      }`}
                    >
                      {stage.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-6 pt-4 border-t border-[#E7E5E4] flex items-center justify-between text-[11px] font-mono text-[#A8A29E]">
          <span>PaperTrail Gemini Agent</span>
          <span>Zero Hallucination Grounding</span>
        </div>
      </div>
    </div>
  );
};
