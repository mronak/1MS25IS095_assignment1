/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, Database, Calendar, Users, BookOpen, Quote } from 'lucide-react';
import type { PaperMetadata, AnalysisDepth } from '../types/research.ts';

interface MetadataSectionProps {
  metadata: PaperMetadata;
  analysisDepth: AnalysisDepth;
  sourceNotice: string;
}

export const MetadataSection: React.FC<MetadataSectionProps> = ({
  metadata,
  analysisDepth,
  sourceNotice,
}) => {
  const isDoiUrl = metadata.doi && metadata.doi.startsWith('http');
  const doiDisplay = metadata.doi ? metadata.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '') : 'Unavailable';
  const doiLink = isDoiUrl ? metadata.doi : metadata.doi ? `https://doi.org/${metadata.doi}` : null;

  return (
    <div className="border border-[#E7E5E4] bg-white rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
      {/* Scope Transparency Banner */}
      <div className={`p-3.5 rounded border text-xs ${
        analysisDepth === 'full_document'
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono uppercase font-bold tracking-wider text-[11px]">
            {analysisDepth === 'full_document' ? 'Scope: Full Document Ingested' : 'Scope: Abstract & Academic Extract'}
          </span>
        </div>
        <p className="leading-relaxed">
          {sourceNotice}
        </p>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Title */}
        <div className="sm:col-span-2 border-b border-[#E7E5E4] pb-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
            Official Research Title
          </span>
          <p className="font-editorial text-base font-bold text-[#1C1917]">
            {metadata.title}
          </p>
        </div>

        {/* Authors */}
        <div className="sm:col-span-2 border-b border-[#E7E5E4] pb-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
            Authors
          </span>
          <p className="text-[#44403C]">
            {metadata.authors && metadata.authors.length > 0
              ? metadata.authors.join(' · ')
              : 'Authors not documented in open record'}
          </p>
        </div>

        {/* Venue */}
        <div className="border-b border-[#E7E5E4] pb-3 sm:border-b-0">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
            Publication Venue / Journal
          </span>
          <p className="text-[#1C1917] font-medium">
            {metadata.venue || 'Peer-Reviewed Conference / Journal'}
          </p>
        </div>

        {/* Year */}
        <div className="border-b border-[#E7E5E4] pb-3 sm:border-b-0">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
            Publication Year
          </span>
          <p className="font-mono text-[#1C1917]">
            {metadata.year || 'Unavailable'}
          </p>
        </div>

        {/* DOI */}
        <div className="border-b border-[#E7E5E4] pb-3 sm:border-b-0">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
            Digital Object Identifier (DOI)
          </span>
          {doiLink ? (
            <a
              href={doiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[#C2410C] hover:underline inline-flex items-center gap-1"
            >
              <span>{doiDisplay}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="font-mono text-[#78716C]">Unavailable</span>
          )}
        </div>

        {/* Citations */}
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
            Verified Citation Count
          </span>
          <p className="font-mono text-[#1C1917] font-semibold">
            {metadata.citationCount}
          </p>
        </div>
      </div>

      {/* Retrieval Source & Date */}
      <div className="pt-3 border-t border-[#E7E5E4] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-[#78716C] gap-1">
        <span>Verified Source: {metadata.retrievalSource}</span>
        <span>Retrieved: {metadata.retrievalDate}</span>
      </div>
    </div>
  );
};
