/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, ZoomIn, ZoomOut, RotateCcw, Code, Eye, AlertTriangle } from 'lucide-react';
import type { ArchitectureSection } from '../types/research.ts';

// Initialize mermaid with editorial warm notebook palette
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'base',
  themeVariables: {
    primaryColor: '#FFFFFF',
    primaryTextColor: '#1C1917',
    primaryBorderColor: '#292524',
    lineColor: '#C2410C',
    secondaryColor: '#FBF9F5',
    tertiaryColor: '#F4F1EA',
    edgeLabelBackground: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: '13px',
    clusterBkg: '#FBF9F5',
    clusterBorder: '#E7E5E4',
  },
});

interface ArchitectureDiagramProps {
  architecture: ArchitectureSection;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  architecture,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRawCode, setShowRawCode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Clean raw mermaid code: remove backticks and markdown fences if any
  const cleanMermaid = architecture.mermaidCode
    ? architecture.mermaidCode
        .replace(/^```mermaid\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()
    : 'graph TD\n  A["Input"] --> B["Processing"] --> C["Output"]';

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      try {
        setRenderError(null);
        const uniqueId = `mermaid-arch-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, cleanMermaid);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.warn('[PaperTrail] Mermaid render error:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Could not render Mermaid diagram syntax.');
        }
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [cleanMermaid]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(cleanMermaid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="border border-[#E7E5E4] bg-white rounded-lg overflow-hidden shadow-xs">
      {/* Diagram Toolbar */}
      <div className="border-b border-[#E7E5E4] bg-[#FBF9F5] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#78716C] font-semibold">
            System Architecture Flowchart
          </span>
          <span className="text-[10px] font-mono text-[#A8A29E] bg-white px-2 py-0.5 rounded border border-[#E7E5E4]">
            Mermaid.js (graph TD)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          {!showRawCode && !renderError && (
            <div className="flex items-center border border-[#E7E5E4] rounded bg-white mr-2">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4F1EA] transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1.5 text-[#78716C]">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4F1EA] transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4F1EA] transition-colors border-l border-[#E7E5E4]"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Raw Code Toggle */}
          <button
            onClick={() => setShowRawCode(!showRawCode)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-[#57534E] hover:text-[#1C1917] bg-white hover:bg-[#F4F1EA] border border-[#E7E5E4] rounded transition-colors"
            title="Toggle Raw Code"
          >
            {showRawCode ? <Eye className="w-3.5 h-3.5 text-[#C2410C]" /> : <Code className="w-3.5 h-3.5" />}
            <span>{showRawCode ? 'Visual View' : 'Mermaid Code'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-[#57534E] hover:text-[#1C1917] bg-white hover:bg-[#F4F1EA] border border-[#E7E5E4] rounded transition-colors"
            title="Copy Mermaid Syntax"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Diagram Canvas / Code View */}
      <div className="p-4 sm:p-6 bg-[#FAF8F5] min-h-[320px] flex items-center justify-center overflow-auto">
        {showRawCode ? (
          <div className="w-full">
            <pre className="font-mono text-xs bg-[#1C1917] text-[#FBF9F5] p-4 rounded overflow-x-auto leading-relaxed">
              <code>{cleanMermaid}</code>
            </pre>
          </div>
        ) : renderError ? (
          <div className="w-full max-w-md p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded text-center">
            <AlertTriangle className="w-6 h-6 text-[#DC2626] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#991B1B] mb-1">
              Mermaid Diagram Render Notice
            </p>
            <p className="text-[11px] text-[#7F1D1D] mb-3">
              {renderError}
            </p>
            <button
              onClick={() => setShowRawCode(true)}
              className="text-xs font-mono underline text-[#991B1B] hover:text-[#7F1D1D]"
            >
              View Raw Diagram Definition
            </button>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className="w-full flex justify-center transition-transform duration-150"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Inferred Components or Missing Details */}
      {architecture.missingOrInferredComponents && (
        <div className="border-t border-[#E7E5E4] bg-[#FFFBEB] p-3.5 px-5 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <div className="text-xs text-[#92400E]">
            <strong className="font-semibold">Omitted / Inferred Architectural Details:</strong>{' '}
            {architecture.missingOrInferredComponents}
          </div>
        </div>
      )}

      {/* Component Highlights */}
      {architecture.componentsSummary && architecture.componentsSummary.length > 0 && (
        <div className="border-t border-[#E7E5E4] p-4 bg-white">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#78716C] mb-2 font-semibold">
            Key Architectural Subsystems
          </h4>
          <ul className="space-y-1.5 text-xs text-[#57534E]">
            {architecture.componentsSummary.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-mono text-[#C2410C] mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
