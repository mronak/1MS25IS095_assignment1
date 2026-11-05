/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { PaperInput } from './components/PaperInput.tsx';
import { InvestigationProgress } from './components/InvestigationProgress.tsx';
import { ResearchReport } from './components/ResearchReport.tsx';
import { AboutModal } from './components/AboutModal.tsx';
import { investigatePaper } from './services/apiService.ts';
import type { InputMode, ResearchReportData } from './types/research.ts';

export default function App() {
  const [appState, setAppState] = useState<'input' | 'investigating' | 'report'>('input');
  const [reportData, setReportData] = useState<ResearchReportData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorFallback, setErrorFallback] = useState<'pdf' | 'url' | 'title' | null>(null);
  const [activeInvestigation, setActiveInvestigation] = useState<{
    mode: InputMode;
    identifier?: string;
  }>({ mode: 'pdf' });
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleInvestigate = async (payload: {
    mode: InputMode;
    title?: string;
    url?: string;
    pdfBase64?: string;
    pdfFileName?: string;
  }) => {
    setErrorMessage(null);
    setErrorFallback(null);
    setActiveInvestigation({
      mode: payload.mode,
      identifier: payload.pdfFileName || payload.url || payload.title,
    });
    setAppState('investigating');

    try {
      const data = await investigatePaper(payload);
      setReportData(data);
      setAppState('report');
      // Scroll to top of report
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('[PaperTrail] Investigation failed:', err);
      setErrorMessage(err.message || 'An error occurred during paper investigation.');
      setErrorFallback(err.fallback || null);
      setAppState('input');
    }
  };

  const handleResetWorkspace = () => {
    setAppState('input');
    setReportData(null);
    setErrorMessage(null);
    setErrorFallback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex flex-col font-sans selection:bg-[#FED7AA] selection:text-[#9A3412]">
      {/* Top Navigation */}
      <Header
        onOpenAbout={() => setIsAboutOpen(true)}
        onResetWorkspace={handleResetWorkspace}
        hasActiveReport={appState === 'report'}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {appState === 'input' && (
          <PaperInput
            onInvestigate={handleInvestigate}
            isLoading={false}
            errorMessage={errorMessage}
            errorFallback={errorFallback}
            onClearError={() => {
              setErrorMessage(null);
              setErrorFallback(null);
            }}
          />
        )}

        {appState === 'investigating' && (
          <InvestigationProgress
            mode={activeInvestigation.mode}
            identifier={activeInvestigation.identifier}
          />
        )}

        {appState === 'report' && reportData && (
          <ResearchReport report={reportData} onReset={handleResetWorkspace} />
        )}
      </main>

      {/* Understated Academic Footer */}
      <footer className="border-t border-[#E7E5E4] bg-[#FBF9F5] py-6 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#78716C] font-mono">
          <div className="flex items-center gap-2">
            <span>PaperTrail</span>
            <span>·</span>
            <span>Academic Investigation Workspace</span>
            <span>·</span>
            <span>Computer Science Capstone</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-[#1C1917] transition-colors underline"
            >
              System Prompt & Ethics
            </button>
            <span>Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>

      {/* About & Prompt Engineering Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
