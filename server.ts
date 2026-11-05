/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { RESEARCH_AGENT_SYSTEM_PROMPT } from './src/prompts/researchAgentPrompt.ts';
import type { ResearchReportData } from './src/types/research.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Generous payload limits for PDF base64 handling
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Server-side Gemini client initialization
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('[PaperTrail] WARNING: GEMINI_API_KEY environment variable is not defined.');
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Query Crossref API
async function queryCrossref(title: string) {
  try {
    const url = `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(title)}&rows=3`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PaperTrail-Academic-Workspace/1.0 (mailto:academic-research@papertrail.local)',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.message?.items?.[0];
    if (!item) return null;

    const cleanTitle = Array.isArray(item.title) ? item.title[0] : item.title || title;
    const authors = Array.isArray(item.author)
      ? item.author.map((a: { given?: string; family?: string }) => [a.given, a.family].filter(Boolean).join(' '))
      : [];
    const venue = Array.isArray(item['container-title']) ? item['container-title'][0] : item['container-title'] || 'Academic Venue';
    const year = item.issued?.['date-parts']?.[0]?.[0]?.toString() || item.created?.['date-parts']?.[0]?.[0]?.toString() || '';
    const doi = item.DOI ? `https://doi.org/${item.DOI}` : '';
    
    // Crossref abstracts often contain JATS XML tags like <jats:p>
    let abstract = '';
    if (item.abstract) {
      abstract = item.abstract.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    return {
      title: cleanTitle,
      authors,
      venue,
      year,
      doi,
      abstract,
      citationCount: item['is-referenced-by-count'] ? String(item['is-referenced-by-count']) : 'Unavailable',
      source: 'Crossref Academic API',
    };
  } catch (err) {
    console.warn('[PaperTrail] Crossref query error:', err);
    return null;
  }
}

// Helper: Query Semantic Scholar API
async function querySemanticScholar(title: string) {
  try {
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(title)}&limit=1&fields=title,authors,year,venue,citationCount,abstract,externalIds`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PaperTrail-Research-Workspace/1.0',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.data?.[0];
    if (!item) return null;

    const authors = Array.isArray(item.authors) ? item.authors.map((a: { name: string }) => a.name) : [];
    const doi = item.externalIds?.DOI ? `https://doi.org/${item.externalIds.DOI}` : item.externalIds?.ArXiv ? `https://arxiv.org/abs/${item.externalIds.ArXiv}` : '';
    
    return {
      title: item.title || title,
      authors,
      venue: item.venue || 'Academic Publication',
      year: item.year ? String(item.year) : '',
      doi,
      abstract: item.abstract || '',
      citationCount: typeof item.citationCount === 'number' ? String(item.citationCount) : 'Unavailable',
      source: 'Semantic Scholar API',
    };
  } catch (err) {
    console.warn('[PaperTrail] Semantic Scholar query error:', err);
    return null;
  }
}

// Health check & diagnostic configuration inspection endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    activeModel: 'gemini-3.1-flash-lite',
    primaryModel: 'gemini-3.8-flash',
    supportedFallbacks: ['gemini-3.1-flash-lite', 'gemini-3-flash-preview'],
    timestamp: new Date().toISOString(),
  });
});

// Primary Paper Investigation Route
app.post('/api/analyze-paper', async (req, res) => {
  try {
    const { mode, title, url, pdfBase64, pdfFileName } = req.body;

    if (!mode || !['pdf', 'url', 'title'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input mode. Must be "pdf", "url", or "title".',
        code: 'INVALID_INPUT',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Server Gemini API key is not configured. Please verify GEMINI_API_KEY environment variable.',
        code: 'API_ERROR',
      });
    }

    const currentDate = new Date().toISOString().split('T')[0];
    let contentsParts: any[] = [];
    let promptInstruction = '';

    // ==========================================
    // MODE 1: PDF UPLOAD
    // ==========================================
    if (mode === 'pdf') {
      if (!pdfBase64 || typeof pdfBase64 !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing PDF document content. Please select a valid PDF file.',
          code: 'INVALID_INPUT',
        });
      }

      // Clean base64 prefix if present (e.g. data:application/pdf;base64,...)
      const cleanedBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

      contentsParts = [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: cleanedBase64,
          },
        },
        {
          text: `You have been provided with the complete original PDF file: "${pdfFileName || 'Uploaded Document'}".
Conduct a rigorous 6-stage investigation following your instructions.
Mark "analysisDepth" as "full_document".
Set "sourceNotice" to: "Full document analyzed via PDF ingestion (${pdfFileName || 'uploaded document'})."
Set "sourceType" to "pdf".
Set "sourceIdentifier" to "${pdfFileName || 'Uploaded Document'}".
Set "analyzedAt" to "${currentDate}".
Ensure all 6 stages are fully detailed, technical, and accurately extracted from this PDF.`,
        },
      ];
    }

    // ==========================================
    // MODE 2: ACADEMIC URL
    // ==========================================
    else if (mode === 'url') {
      if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid HTTP/HTTPS paper URL.',
          code: 'INVALID_INPUT',
        });
      }

      const trimmedUrl = url.trim();

      // Check for arXiv links
      const arxivMatch = trimmedUrl.match(/arxiv\.org\/(abs|pdf)\/([0-9]+\.[0-9]+(v[0-9]+)?)/i);
      
      if (arxivMatch && arxivMatch[2]) {
        const arxivId = arxivMatch[2];
        const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
        console.log(`[PaperTrail] Detected arXiv paper ${arxivId}. Fetching direct PDF...`);

        try {
          const pdfResponse = await fetch(pdfUrl, {
            headers: {
              'User-Agent': 'PaperTrail-Academic-Workspace/1.0 (academic research tool)',
            },
          });

          if (pdfResponse.ok && pdfResponse.headers.get('content-type')?.includes('application/pdf')) {
            const arrayBuffer = await pdfResponse.arrayBuffer();
            const base64Pdf = Buffer.from(arrayBuffer).toString('base64');

            contentsParts = [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Pdf,
                },
              },
              {
                text: `You have been provided with the complete original arXiv research paper PDF (${arxivId}).
Conduct a rigorous 6-stage investigation following your instructions.
Mark "analysisDepth" as "full_document".
Set "sourceNotice" to: "Full document analyzed via direct arXiv open-access PDF retrieval (${arxivId})."
Set "sourceType" to "url".
Set "sourceIdentifier" to "${trimmedUrl}".
Set "analyzedAt" to "${currentDate}".
Ensure all 6 stages are thoroughly detailed and strictly grounded in the document text.`,
              },
            ];
          } else {
            throw new Error(`Failed to download arXiv PDF: HTTP ${pdfResponse.status}`);
          }
        } catch (arxivErr) {
          console.warn('[PaperTrail] Direct arXiv PDF download failed, falling back to abstract page:', arxivErr);
          // Fall through to general URL fetcher
        }
      }

      // If not arXiv or arXiv PDF download fell back, attempt web content retrieval
      if (contentsParts.length === 0) {
        try {
          const pageRes = await fetch(trimmedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PaperTrail/1.0',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          });

          if (pageRes.status === 403 || pageRes.status === 401 || pageRes.status === 429) {
            return res.status(422).json({
              success: false,
              error: `Full-text retrieval is restricted by the publisher (HTTP ${pageRes.status}). Publishers often require institutional authentication or prevent automated scraping. To ensure complete, uncompromised analysis without missing sections, please download the paper and upload the PDF directly.`,
              code: 'ACCESS_RESTRICTED',
              fallback: 'pdf',
            });
          }

          if (!pageRes.ok) {
            return res.status(422).json({
              success: false,
              error: `Unable to access paper URL (HTTP ${pageRes.status} ${pageRes.statusText}). Please check the link or upload the PDF document directly.`,
              code: 'ACCESS_RESTRICTED',
              fallback: 'pdf',
            });
          }

          const contentType = pageRes.headers.get('content-type') || '';

          if (contentType.includes('application/pdf')) {
            const arrayBuffer = await pageRes.arrayBuffer();
            const base64Pdf = Buffer.from(arrayBuffer).toString('base64');
            contentsParts = [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Pdf,
                },
              },
              {
                text: `You have been provided with the complete original PDF paper retrieved from: ${trimmedUrl}.
Conduct a rigorous 6-stage investigation following your instructions.
Mark "analysisDepth" as "full_document".
Set "sourceNotice" to: "Full document analyzed via open-access PDF stream."
Set "sourceType" to "url".
Set "sourceIdentifier" to "${trimmedUrl}".
Set "analyzedAt" to "${currentDate}".`,
              },
            ];
          } else {
            const htmlText = await pageRes.text();

            // Detect typical paywall / Cloudflare blocks
            if (
              htmlText.includes('cf-browser-verification') ||
              htmlText.includes('Attention Required! | Cloudflare') ||
              htmlText.includes('Access Denied') ||
              htmlText.includes('Subscribe to read') ||
              htmlText.includes('Purchase instant access')
            ) {
              return res.status(422).json({
                success: false,
                error: 'The destination website has active bot protection or an institutional paywall preventing automated extraction. To ensure complete analysis, please download the PDF and upload it into the workspace.',
                code: 'ACCESS_RESTRICTED',
                fallback: 'pdf',
              });
            }

            // Clean HTML into readable text
            const cleanedText = htmlText
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();

            if (cleanedText.length < 500) {
              return res.status(422).json({
                success: false,
                error: 'The paper URL returned insufficient text (under 500 characters). The full article text is not publicly accessible in plain HTML. Please upload the PDF file directly.',
                code: 'ACCESS_RESTRICTED',
                fallback: 'pdf',
              });
            }

            // Truncate to reasonable token limit if huge
            const excerpt = cleanedText.slice(0, 30000);

            contentsParts = [
              {
                text: `Source URL: ${trimmedUrl}
The following is text extracted from the open web page of the paper:

${excerpt}

IMPORTANT SCOPE INSTRUCTION:
Because this paper was retrieved from a web HTML extract rather than a complete structured PDF, you must clearly declare this limitation.
Mark "analysisDepth" as "abstract_and_extract".
Set "sourceNotice" to: "Analyzed based on open web extract and abstract retrieved from ${trimmedUrl}. Some appendices or mathematical figures may have been omitted in the web representation."
Set "sourceType" to "url".
Set "sourceIdentifier" to "${trimmedUrl}".
Set "analyzedAt" to "${currentDate}".
Conduct your 6-stage investigation strictly based on the text provided. Do not invent missing experimental results.`,
              },
            ];
          }
        } catch (fetchErr: any) {
          return res.status(422).json({
            success: false,
            error: `Failed to retrieve content from URL: ${fetchErr?.message || 'Network error'}. Please upload the PDF file directly.`,
            code: 'ACCESS_RESTRICTED',
            fallback: 'pdf',
          });
        }
      }
    }

    // ==========================================
    // MODE 3: PAPER TITLE
    // ==========================================
    else if (mode === 'title') {
      if (!title || typeof title !== 'string' || title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid paper title (at least 3 characters).',
          code: 'INVALID_INPUT',
        });
      }

      const cleanTitle = title.trim();
      console.log(`[PaperTrail] Investigating title via Crossref & Semantic Scholar: "${cleanTitle}"`);

      // Query Crossref and Semantic Scholar in parallel
      const [crossrefResult, s2Result] = await Promise.all([
        queryCrossref(cleanTitle),
        querySemanticScholar(cleanTitle),
      ]);

      const resolvedTitle = s2Result?.title || crossrefResult?.title || cleanTitle;
      const authors = (s2Result?.authors && s2Result.authors.length > 0) ? s2Result.authors : (crossrefResult?.authors || []);
      const venue = s2Result?.venue && s2Result.venue !== 'Academic Publication' ? s2Result.venue : (crossrefResult?.venue || 'Peer-Reviewed Publication');
      const year = s2Result?.year || crossrefResult?.year || '';
      const doi = s2Result?.doi || crossrefResult?.doi || '';
      const citationCount = s2Result?.citationCount !== 'Unavailable' ? s2Result?.citationCount : (crossrefResult?.citationCount || 'Unavailable');
      const abstract = s2Result?.abstract || crossrefResult?.abstract || '';
      const source = s2Result ? 'Semantic Scholar Academic Graph' : crossrefResult ? 'Crossref Metadata Database' : 'Academic Literature Search';

      contentsParts = [
        {
          text: `The user requested an investigation of the research paper titled:
"${resolvedTitle}"

Academic Metadata Retrieved:
- Verified Title: ${resolvedTitle}
- Authors: ${authors.length > 0 ? authors.join(', ') : 'Not explicitly listed'}
- Publication Venue: ${venue}
- Year: ${year || 'Unavailable'}
- DOI: ${doi || 'Unavailable'}
- Citation Count: ${citationCount} (Source: ${source}, Retrieved: ${currentDate})
- Official Abstract: ${abstract ? abstract : 'Detailed abstract not exposed via open metadata API.'}

CRITICAL ACCURACY & SCOPE MANDATE:
This paper was investigated via title and academic metadata search. You have access to the verified metadata and the official abstract.
You DO NOT have the full 15-page experimental PDF in front of you.
Therefore:
1. Mark "analysisDepth" as "abstract_and_extract".
2. Set "sourceNotice" to: "Analyzed based on academic metadata and official abstract retrieved from ${source}. Full paper PDF was not provided; deep section analysis reflects the documented abstract and verified methodology."
3. Set "sourceType" to "title".
4. Set "sourceIdentifier" to "${resolvedTitle}".
5. Set "analyzedAt" to "${currentDate}".
6. Under metadata, populate with the exact retrieved values:
   - title: "${resolvedTitle}"
   - authors: ${JSON.stringify(authors)}
   - venue: "${venue}"
   - year: "${year}"
   - doi: "${doi || 'Unavailable'}"
   - citationCount: "${citationCount}"
   - retrievalSource: "${source}"
   - retrievalDate: "${currentDate}"
7. In Stage 2 (Technical Breakdown) and Stage 3 (Architecture), clearly distinguish between what is documented in the abstract and established literature versus reasonable conceptual architectural inferences. Note any omitted experimental details under "missingOrInferredComponents".`,
        },
      ];
    }

    // Execute investigation using verified available models with automatic 503 failover
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-3.8-flash'];
    let response: any = null;
    let usedModel = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`[PaperTrail] Calling Gemini model: ${modelName}...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: contentsParts },
          config: {
            systemInstruction: RESEARCH_AGENT_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
          },
        });
        usedModel = modelName;
        console.log(`[PaperTrail] Investigation succeeded with model: ${modelName}`);
        break;
      } catch (modelErr: any) {
        console.warn(`[PaperTrail] Model ${modelName} returned status ${modelErr?.status || modelErr?.code}: ${modelErr?.message}`);
        lastError = modelErr;
        // If 503 UNAVAILABLE (high demand) or 429, try the next verified model candidate
        if (modelErr?.status === 503 || modelErr?.status === 429) {
          console.log(`[PaperTrail] Failing over to next candidate due to status ${modelErr?.status}...`);
          continue;
        }
        throw modelErr;
      }
    }

    if (!response) {
      throw lastError || new Error('All model candidates failed.');
    }

    const rawText = (response.text || '').trim();
    if (!rawText) {
      throw new Error('Received empty response from research agent model.');
    }

    // Clean any accidental markdown fence if present
    const cleanedJsonStr = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let reportData: ResearchReportData;
    try {
      reportData = JSON.parse(cleanedJsonStr);
    } catch (parseErr) {
      console.error('[PaperTrail] JSON parse error. Raw text was:', rawText.slice(0, 500));
      throw new Error('Failed to parse research notes JSON. Please retry the investigation.');
    }

    // Ensure metadata contains retrieval date if missing
    if (reportData.metadata && !reportData.metadata.retrievalDate) {
      reportData.metadata.retrievalDate = currentDate;
    }

    // Normalize student project fields to ensure consistent measurable outcome data
    if (Array.isArray(reportData.studentProjects)) {
      reportData.studentProjects = reportData.studentProjects.map((p: any, idx: number) => {
        const rawOutcome =
          p.measurableOutcome ||
          p.expectedMeasurableOutcome ||
          p.expectedOutcome ||
          p.expected_measurable_outcome ||
          p.measurable_outcome ||
          p.outcome;

        const cleanOutcome =
          rawOutcome && String(rawOutcome).trim().length > 0
            ? String(rawOutcome).trim()
            : 'Not specified';

        return {
          id: p.id || `proj-${idx + 1}`,
          name: p.name || `Project Opportunity 0${idx + 1}`,
          gapAddressed: p.gapAddressed || p.limitationAddressed || p.gap || 'Not specified',
          proposedImprovement: p.proposedImprovement || p.improvement || 'Not specified',
          howItWorks: p.howItWorks || p.mechanism || p.implementation || 'Not specified',
          measurableOutcome: cleanOutcome,
          expectedOutcome: cleanOutcome,
          expectedMeasurableOutcome: cleanOutcome,
          recommendedStack: Array.isArray(p.recommendedStack)
            ? p.recommendedStack
            : Array.isArray(p.techStack)
            ? p.techStack
            : ['Python', 'PyTorch'],
          difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(p.difficulty)
            ? p.difficulty
            : 'Intermediate',
        };
      });
    }

    return res.json({
      success: true,
      data: reportData,
    });
  } catch (error: any) {
    console.error('[PaperTrail] Investigation error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'An unexpected error occurred during paper investigation.',
      code: 'API_ERROR',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }
});

// Configure Vite middleware in development or serve static in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, () => {
    console.log(`[PaperTrail] Server running at http://localhost:${PORT}`);
  });
}

startServer();
