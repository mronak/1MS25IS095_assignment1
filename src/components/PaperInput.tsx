/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Link2, Type, FileText, AlertCircle, ArrowRight, X } from 'lucide-react';
import type { InputMode } from '../types/research.ts';
import { fileToBase64 } from '../services/apiService.ts';

interface PaperInputProps {
  onInvestigate: (payload: {
    mode: InputMode;
    title?: string;
    url?: string;
    pdfBase64?: string;
    pdfFileName?: string;
  }) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  errorFallback?: 'pdf' | 'url' | 'title' | null;
  onClearError?: () => void;
}

export const PaperInput: React.FC<PaperInputProps> = ({
  onInvestigate,
  isLoading,
  errorMessage,
  errorFallback,
  onClearError,
}) => {
  const [activeTab, setActiveTab] = useState<InputMode>('pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (mode: InputMode) => {
    setActiveTab(mode);
    setValidationError(null);
    if (onClearError) onClearError();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
        setValidationError(null);
        if (onClearError) onClearError();
      } else {
        setValidationError('Please upload a PDF document (.pdf format).');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
        setValidationError(null);
        if (onClearError) onClearError();
      } else {
        setValidationError('Please upload a PDF document (.pdf format).');
      }
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (activeTab === 'pdf') {
      if (!selectedFile) {
        setValidationError('Please select or drag-and-drop a research paper PDF file.');
        return;
      }
      try {
        const base64 = await fileToBase64(selectedFile);
        onInvestigate({
          mode: 'pdf',
          pdfBase64: base64,
          pdfFileName: selectedFile.name,
        });
      } catch (err) {
        setValidationError('Failed to read the PDF file. Please try selecting it again.');
      }
    } else if (activeTab === 'url') {
      const trimmed = urlInput.trim();
      if (!trimmed) {
        setValidationError('Please enter a research paper URL.');
        return;
      }
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        setValidationError('URL must start with http:// or https:// (e.g., https://arxiv.org/abs/1706.03762).');
        return;
      }
      onInvestigate({
        mode: 'url',
        url: trimmed,
      });
    } else if (activeTab === 'title') {
      const trimmed = titleInput.trim();
      if (!trimmed) {
        setValidationError('Please enter a research paper title.');
        return;
      }
      if (trimmed.length < 3) {
        setValidationError('Paper title must be at least 3 characters.');
        return;
      }
      onInvestigate({
        mode: 'title',
        title: trimmed,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
      {/* Compact Introduction */}
      <div className="mb-6">
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] mb-2">
          Go beyond the abstract.
        </h1>
        <p className="text-base text-[#57534E] max-w-2xl leading-relaxed">
          Understand the problem. Trace the architecture. Discover what you could build next.
        </p>
      </div>

      {/* Main Input Container */}
      <div className="border border-[#E7E5E4] bg-white rounded-lg shadow-xs overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="flex border-b border-[#E7E5E4] bg-[#FBF9F5] p-1 gap-1">
          <button
            type="button"
            onClick={() => handleTabChange('pdf')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'pdf'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold border border-[#E7E5E4]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Upload className="w-4 h-4 text-[#C2410C]" />
            <span>Upload PDF</span>
            <span className="hidden md:inline-block text-[10px] font-mono text-[#A8A29E]">
              (Full Document)
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('url')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'url'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold border border-[#E7E5E4]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Link2 className="w-4 h-4 text-[#C2410C]" />
            <span>Paper URL</span>
            <span className="hidden md:inline-block text-[10px] font-mono text-[#A8A29E]">
              (arXiv / Open Access)
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('title')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'title'
                ? 'bg-white text-[#1C1917] shadow-xs font-semibold border border-[#E7E5E4]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Type className="w-4 h-4 text-[#C2410C]" />
            <span>Paper Title</span>
            <span className="hidden md:inline-block text-[10px] font-mono text-[#A8A29E]">
              (Crossref / Abstract)
            </span>
          </button>
        </div>

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* TAB 1: PDF UPLOAD */}
          {activeTab === 'pdf' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload-input"
              />
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                }}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-[#C2410C] bg-[#FFF7ED]'
                    : selectedFile
                    ? 'border-[#D6D3D1] bg-[#FBF9F5]'
                    : 'border-[#E7E5E4] hover:border-[#D6D3D1] bg-[#FBF9F5]/50'
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded bg-[#FED7AA]/40 text-[#C2410C] flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1C1917] max-w-sm truncate">
                        {selectedFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="text-[#78716C] hover:text-[#C2410C] p-1 rounded"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs font-mono text-[#78716C]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for Full Ingestion
                    </span>
                    <span className="text-[11px] text-[#A8A29E] mt-1">
                      Click to replace document
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#F4F1EA] text-[#78716C] flex items-center justify-center">
                      <Upload className="w-5 h-5 text-[#C2410C]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1C1917]">
                        Click to upload or drag and drop paper PDF
                      </p>
                      <p className="text-xs text-[#78716C] mt-1">
                        Native multimodal document analysis up to 20MB
                      </p>
                    </div>
                    <p className="text-[11px] font-mono text-[#A8A29E] mt-2">
                      Direct analysis preserves figures, mathematical formulations, and appendices
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PAPER URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label htmlFor="url-input" className="block text-xs font-mono uppercase tracking-wider text-[#78716C]">
                Research Paper Link
              </label>
              <div className="relative">
                <input
                  id="url-input"
                  type="url"
                  placeholder="e.g. https://arxiv.org/abs/1706.03762 or https://openreview.net/forum?id=..."
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (validationError) setValidationError(null);
                    if (onClearError) onClearError();
                  }}
                  className="w-full px-4 py-3 border border-[#E7E5E4] rounded bg-[#FBF9F5]/40 text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white transition-all font-mono"
                />
              </div>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Direct arXiv URLs (<span className="font-mono text-[#44403C]">arxiv.org/abs/...</span>) are automatically retrieved as full-text open-access PDFs. If an external publisher restricts access via paywall, you will be prompted to upload the PDF.
              </p>
            </div>
          )}

          {/* TAB 3: PAPER TITLE */}
          {activeTab === 'title' && (
            <div className="space-y-3">
              <label htmlFor="title-input" className="block text-xs font-mono uppercase tracking-wider text-[#78716C]">
                Paper Title or Landmark Name
              </label>
              <div className="relative">
                <input
                  id="title-input"
                  type="text"
                  placeholder="e.g. Attention Is All You Need, Raft: In Search of an Understandable Consensus Algorithm..."
                  value={titleInput}
                  onChange={(e) => {
                    setTitleInput(e.target.value);
                    if (validationError) setValidationError(null);
                    if (onClearError) onClearError();
                  }}
                  className="w-full px-4 py-3 border border-[#E7E5E4] rounded bg-[#FBF9F5]/40 text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white transition-all"
                />
              </div>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Queries the <strong>Crossref</strong> and <strong>Semantic Scholar</strong> academic databases to retrieve verified metadata and official abstracts. Clearly discloses abstract-level scope so full paper access is never falsely claimed.
              </p>
            </div>
          )}

          {/* Validation & Server Error Display */}
          {(validationError || errorMessage) && (
            <div className="mt-4 p-3.5 border border-[#FCA5A5] bg-[#FEF2F2] rounded text-xs text-[#991B1B] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{validationError || errorMessage}</p>
                {errorFallback === 'pdf' && activeTab !== 'pdf' && (
                  <button
                    type="button"
                    onClick={() => handleTabChange('pdf')}
                    className="mt-2 text-xs font-semibold underline text-[#991B1B] hover:text-[#7F1D1D] block"
                  >
                    Switch to PDF Upload →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-6 pt-5 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] font-mono text-[#78716C]">
              {activeTab === 'pdf' && (selectedFile ? `Selected: ${selectedFile.name}` : 'No PDF selected')}
              {activeTab === 'url' && (urlInput ? 'URL entered' : 'Paste an accessible paper URL')}
              {activeTab === 'title' && (titleInput ? 'Ready to resolve title' : 'Enter paper title')}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto px-6 py-2.5 rounded text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                isLoading
                  ? 'bg-[#E7E5E4] text-[#A8A29E] cursor-not-allowed'
                  : 'bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C2410C]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Investigating...</span>
                </>
              ) : (
                <>
                  <span>Investigate Paper</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
