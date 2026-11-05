/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, FileText, Info } from 'lucide-react';

interface HeaderProps {
  onOpenAbout: () => void;
  onResetWorkspace: () => void;
  hasActiveReport: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAbout,
  onResetWorkspace,
  hasActiveReport,
}) => {
  return (
    <header className="border-b border-[#E7E5E4] bg-[#FBF9F5] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand & Sub-label */}
        <div className="flex items-center gap-3">
          <button
            onClick={onResetWorkspace}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]"
            title="PaperTrail Home"
          >
            <div className="w-8 h-8 rounded bg-[#1C1917] text-[#FBF9F5] flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#1C1917] group-hover:text-[#C2410C] transition-colors">
                PaperTrail
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#78716C] uppercase -mt-1">
                Research Workspace
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-[#57534E]">
          <button
            onClick={onResetWorkspace}
            className={`hover:text-[#1C1917] transition-colors py-1 border-b-2 ${
              !hasActiveReport ? 'border-[#C2410C] text-[#1C1917]' : 'border-transparent'
            }`}
          >
            Workspace
          </button>
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1.5 hover:text-[#1C1917] transition-colors py-1 border-b-2 border-transparent"
          >
            <Info className="w-3.5 h-3.5 text-[#78716C]" />
            <span>About Agent</span>
          </button>
        </nav>

        {/* Zone 3: Academic Identifier Action */}
        <div className="flex items-center gap-3">
          {hasActiveReport && (
            <button
              onClick={onResetWorkspace}
              className="text-xs font-mono text-[#78716C] hover:text-[#C2410C] transition-colors py-1.5 px-3 border border-[#E7E5E4] rounded bg-white hover:bg-[#F4F1EA]"
            >
              + New Investigation
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#A8A29E] bg-[#F4F1EA] px-2.5 py-1 rounded border border-[#E7E5E4]">
            CS-AI Capstone
          </span>
        </div>
      </div>
    </header>
  );
};
