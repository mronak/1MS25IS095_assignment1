/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Terminal, Target, Wrench, Layers } from 'lucide-react';
import type { StudentProject } from '../types/research.ts';

interface ProjectOpportunitiesProps {
  projects: StudentProject[];
}

export const ProjectOpportunities: React.FC<ProjectOpportunitiesProps> = ({
  projects,
}) => {
  const getDifficultyStyle = (diff: 'Beginner' | 'Intermediate' | 'Advanced') => {
    switch (diff) {
      case 'Beginner':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Intermediate':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Advanced':
        return 'text-[#C2410C] bg-[#FFF7ED] border-[#FED7AA]';
      default:
        return 'text-[#57534E] bg-[#F4F1EA] border-[#E7E5E4]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Notice header */}
      <div className="p-3.5 bg-[#FBF9F5] border border-[#E7E5E4] rounded flex items-center justify-between text-xs">
        <span className="text-[#57534E]">
          <strong>Capstone Opportunities:</strong> 3 realistic CS undergraduate projects synthesized to extend or benchmark this research.
        </span>
        <span className="font-mono text-[10px] text-[#A8A29E] uppercase tracking-wider hidden sm:inline-block">
          Portfolio-Ready
        </span>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project, index) => (
          <div
            key={project.id || index}
            className="border border-[#E7E5E4] bg-white rounded-lg p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            {/* Project Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-[#C2410C]">
                  0{index + 1}
                </span>
                <h4 className="font-editorial text-lg font-bold text-[#1C1917]">
                  {project.name}
                </h4>
              </div>

              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded border self-start sm:self-center font-medium ${getDifficultyStyle(
                  project.difficulty
                )}`}
              >
                {project.difficulty} Difficulty
              </span>
            </div>

            {/* Content Fields */}
            <div className="space-y-3.5 text-xs">
              {/* Gap Addressed */}
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-0.5">
                  Specific Limitation Addressed
                </span>
                <p className="text-[#44403C] leading-relaxed">
                  {project.gapAddressed}
                </p>
              </div>

              {/* Proposed Improvement */}
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-0.5">
                  Proposed Technical Improvement
                </span>
                <p className="text-[#1C1917] font-medium leading-relaxed">
                  {project.proposedImprovement}
                </p>
              </div>

              {/* How it works */}
              <div className="p-3 bg-[#FBF9F5] rounded border border-[#E7E5E4]">
                <div className="flex items-center gap-1.5 mb-1 text-[#78716C]">
                  <Wrench className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                    Implementation Mechanism
                  </span>
                </div>
                <p className="text-[#44403C] leading-relaxed">
                  {project.howItWorks}
                </p>
              </div>

              {/* Measurable Outcome */}
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                  Expected Measurable Outcome
                </span>
                <p className="text-[#15803D] font-mono text-xs bg-emerald-50/70 p-2.5 rounded border border-emerald-200 leading-relaxed font-medium">
                  {project.measurableOutcome && project.measurableOutcome.trim()
                    ? project.measurableOutcome.trim()
                    : project.expectedOutcome && project.expectedOutcome.trim()
                    ? project.expectedOutcome.trim()
                    : 'Not specified'}
                </p>
              </div>

              {/* Technology Stack */}
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1.5">
                  Recommended Technology Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.recommendedStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="font-mono text-[11px] px-2 py-0.5 bg-[#F4F1EA] text-[#44403C] rounded border border-[#E7E5E4]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
