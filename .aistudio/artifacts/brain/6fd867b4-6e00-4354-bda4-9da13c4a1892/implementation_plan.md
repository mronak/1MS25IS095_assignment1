# Implementation Plan: PaperTrail — Research Paper Investigation Workspace

A focused, academic-grade research notebook for computer science students to dissect research papers, trace algorithmic system architectures, and uncover realistic undergraduate project opportunities.

> [!IMPORTANT]
> **Confirmed User Decisions & Refinements:**
> - **Input Scope & Transparency**: Only analyze user-uploaded PDFs, paper URLs, and titles. For paper titles, query Crossref/Semantic Scholar APIs for metadata and abstracts; prominently disclose the **Analysis Scope** (`Full Document`, `Abstract & Open Access Extract`, or `Metadata Only`) so the student always knows the ground-truth depth. Never claim full analysis when only abstract was accessible.
> - **URL Access Restriction Guardrails**: Prioritize accessible arXiv/OpenReview sources. If full-text extraction fails due to paywalls, JavaScript rendering, or publisher restrictions, halt analysis with a clear diagnostic notice and offer direct PDF drag-and-drop instead of silently hallucinating on incomplete text.
> - **Backend-Only API Security**: Keep `GEMINI_API_KEY` exclusively on the server (`server.ts` / `process.env.GEMINI_API_KEY`). Verify `.env` is ignored in `.gitignore`, and ensure no keys or tokens are ever embedded in client bundles, exported JSON/TXT reports, or UI state.
> - **Technical Granularity**: Balanced technical notes with step-by-step processing pipelines, separating documented components from reasonable interpretations.
> - **Diagram Styling**: Warm editorial notebook palette with dark charcoal hairline borders and muted burnt-orange accents.

---

## 1. Overview & Core Concept

**PaperTrail** is an academic investigation workspace built for computer science undergraduates. Unlike generic chatbot interfaces, PaperTrail operates like an editorial technical notebook:
- **Core Input Modes & Scope Transparency**:
  1. **PDF Document Upload** (Full Document Analysis): Direct client drag-and-drop or file picker; client transmits base64 PDF to the Express backend for native multimodal Gemini ingestion (`inlineData: { mimeType: 'application/pdf', data }`). Preserves figures, tables, equations, and section structure.
  2. **Academic URL Input** (Full Text or Graceful Fallback): Server queries URL with special handling for arXiv (e.g. converting `arxiv.org/abs/...` to `arxiv.org/pdf/...` or fetching open access text). If an academic site blocks full-text access (paywall/Cloudflare/403), the backend returns a clear status: `ACCESS_RESTRICTED` prompting the student to upload the PDF.
  3. **Paper Title Search** (Title & Abstract / Crossref Resolution): Backend queries the Crossref Open API (`api.crossref.org/works?query.title=...`) and/or Semantic Scholar to retrieve verified title, authors, venue, year, DOI, and abstract. The investigation explicitly tags the report header as: `[ANALYSIS DEPTH: Abstract & Metadata Analysis]`.
- **Core Agent Output**:
  - 6-Stage structured analysis (Paper Understanding, Technical Breakdown, System Architecture Mermaid graph, Impact & Limitations, 3 Undergraduate Project Opportunities, and Verifiable Paper Metadata).
  - Editorial presentation with sticky section navigation, copyable sections, interactive Mermaid rendering, and single-click TXT / JSON export.

---

## 2. User Experience & Visual Design

### Aesthetic Direction: Academic Editorial Notebook
- **Canvas Atmosphere**: Warm ivory background (`#FBF9F5` / `#F7F5F0`) paired with dark charcoal text (`#1C1917` / `#292524`).
- **Accent**: Muted burnt-orange / terracotta (`#C2410C`, `#9A3412`) used strictly for primary callouts, active navigation indicators, and the "Investigate Paper" primary CTA.
- **Hairline Dividers**: Subtle borders (`#E7E5E4` / `#D6D3D1`), no heavy drop shadows or glossy gradients.
- **Typography**:
  - Display & Headings: Editorial serif / refined grotesque (`font-serif` / `Playfair Display` or `Plus Jakarta Sans`) with balanced headline wrapping.
  - Body: Readable academic prose (`Plus Jakarta Sans` or clean system serif/sans at 15–16px, 1.6 line height).
  - Metadata & System Labels: Clean monospaced font (`IBM Plex Mono` / `JetBrains Mono` / `font-mono tabular-nums`).
- **Zero-Pill Discipline**: All dates, citation counts, venue names, and author credits are rendered as unboxed editorial metadata with typographic bullets (`·`).

### Key User Flows
1. **Zero State**:
   - Header with PaperTrail wordmark, "RESEARCH WORKSPACE" label, and "About" modal toggle.
   - Compact introduction: *"Go beyond the abstract. Understand the problem. Trace the architecture. Discover what you could build next."*
   - Unified Paper Input Card: Tabs for PDF Upload (with drag-and-drop zone, file size indicator, filename display), Paper URL (with auto-detect for arXiv/OpenReview), and Paper Title.
   - Prominent "Investigate Paper" button with validation states.
2. **Investigation Progress State**:
   - Multi-stage investigation timeline with active step indicator:
     `01 Reading Source Document` → `02 Deconstructing Methodology` → `03 Tracing System Architecture` → `04 Generating Student Opportunities` → `05 Compiling Metadata`.
3. **Research Report State**:
   - Two-column editorial workspace layout:
     - Left Sidebar (Sticky): Numbered section navigator (`01 Paper Overview`, `02 Research Problem`, `03 Methodology`, `04 Technical Breakdown`, `05 System Architecture`, `06 Contributions & Limitations`, `07 Student Projects`, `08 Paper Metadata`), plus quick actions (Export TXT, Export JSON, Reset Investigation).
     - Right Document Pane: Formatted research document with copy buttons for each section, expandable implementation notes, visual Mermaid flowchart with zoom/pan and source view, interactive student project difficulty badges, and metadata citations.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Selected Approach | Rationale & Trade-Offs |
| :--- | :--- | :--- |
| **Backend & API Architecture** | Express server proxy (`server.ts` running via `tsx`) with `@google/genai` | Completely protects the Gemini API key on the server side (`process.env.GEMINI_API_KEY`) as required by AI Studio guidelines. No API keys ever touch the frontend bundle. |
| **Model Selection** | `gemini-3.8-flash` | Fast, cost-efficient, natively handles multi-page PDF documents via `inlineData` and outputs structured JSON without quota exhaustion. |
| **Access Transparency & Truthfulness** | Strict `analysisDepth` tagging (`full_document`, `abstract_and_extract`, `title_and_abstract`) | Adheres strictly to the user requirement: never claim a paper was fully analyzed if only the title or abstract was available. Informs students of exact coverage. |
| **Paywall & Scraper Handling** | Friendly error with actionable PDF prompt | If a URL cannot be retrieved or is protected by paywalls/bot-blocks, immediately stops and suggests uploading the PDF directly rather than inventing fake data. |
| **Diagram Generation** | Client-side `mermaid` library rendering generated `graph TD` definitions | Provides interactive, crisp vector SVG rendering styled to match the warm paper notebook aesthetic, with a fallback raw text/copy toggle. |
| **Data Sanitization on Export** | Strictly sanitize TXT and JSON exports | Exports contain only academic analysis, metadata, and diagrams. Never contains keys, environment variables, or private internal prompts. |

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PaperTrail Frontend                           │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │     TopNavigation     │  │          AboutModal (CS Scope)        │  │
│  └───────────────────────┘  └───────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │     PaperInput (PDF Upload / URL Resolver / Title Search)        │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │ POST /api/analyze-paper          │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │       InvestigationProgress (Stage-by-stage analysis steps)      │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │ Report Data                      │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                          ResearchReport                          │  │
│  │  ┌────────────────────────┐  ┌────────────────────────────────┐  │  │
│  │  │ SectionSidebar (Sticky)│  │ [Scope: Full / Abstract / Meta]│  │  │
│  │  │ - 01 Overview          │  │ 01 Paper Overview              │  │  │
│  │  │ - 02 Problem           │  │ 02 Research Problem            │  │  │
│  │  │ - 03 Methodology       │  │ 03 Methodology                 │  │  │
│  │  │ - 04 Breakdown         │  │ 04 Technical Breakdown         │  │  │
│  │  │ - 05 Architecture      │  │ 05 System Architecture (Mermaid│  │  │
│  │  │ - 06 Contributions     │  │ 06 Contributions & Limitations │  │  │
│  │  │ - 07 Student Projects  │  │ 07 Student Project Ideas (3)   │  │  │
│  │  │ - 08 Metadata          │  │ 08 Paper Metadata (Crossref)   │  │  │
│  │  │ - Export TXT / JSON    │  └────────────────────────────────┘  │  │
│  │  └────────────────────────┘                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Node / Express Backend                          │
│                                                                        │
│   • POST /api/analyze-paper                                            │
│       - Receives: { mode: 'pdf'|'url'|'title', fileData, url, title }  │
│       - Title mode: Queries Crossref API (api.crossref.org) for        │
│         verified DOI, author list, publication venue, and abstract     │
│       - URL mode: Converts arXiv links to PDF/text, fetches safely;   │
│         if paywalled/blocked, throws 422 with { error, fallback: 'pdf'}│
│       - Calls GoogleGenAI with gemini-3.8-flash (server-side only)     │
│       - Uses Research Agent System Prompt with strict 6-stage JSON     │
│       - Marks analysisDepth: 'full_document' | 'abstract_and_extract'  │
│   • GET /api/health                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Schema (`types/research.ts`)
- `ResearchReportData`:
  - `analysisDepth`: `'full_document'` | `'abstract_and_extract'` | `'metadata_only'`
  - `sourceNotice`: string (e.g. "Full document analyzed via PDF upload" or "Analyzed based on Crossref metadata and abstract; full document was not uploaded")
  - `executiveSummary`: string (250-300 words)
  - `problem`: { researchProblem, motivation, mainObjective, limitationsAddressed }
  - `methodology`: { proposedSolution, mainMethodology, algorithmsOrMath, experimentalResults, mainContributions }
  - `technicalBreakdown`: { inputData, preprocessing, mainModels, processingStages: string[], output, dependencies: string[], explicitVsInterpretedNotes }
  - `architecture`: { mermaidCode: string, nodesDescription: string[], missingComponentsNote?: string }
  - `importance`: { priorProblem, improvements, whyUseful, limitations, unsolvedQuestions }
  - `studentProjects`: Array<{ id: string, name: string, gapAddressed: string, proposedImprovement: string, mechanism: string, measurableOutcome: string, techStack: string[], difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }> (exactly 3 projects)
  - `metadata`: { title: string, authors: string[], venue: string, year: string, doi: string, citationCount: string, retrievalSource: string, retrievalDate: string }

---

## 5. Implementation Sequence

1. **Backend Server (`server.ts` & Express setup)**:
   - Configure Express server with `vite.middlewares` for dev mode and static serving in production.
   - Implement `/api/analyze-paper` with robust handling for PDF base64 payloads, URL fetching (arXiv auto-converter), and Crossref title resolution.
   - Ensure `GEMINI_API_KEY` is loaded from `process.env.GEMINI_API_KEY` on the server only.
2. **Dependencies & Security Setup**:
   - Install `mermaid` for client-side diagram rendering.
   - Verify `.env` is in `.gitignore`.
   - Update `metadata.json` with app title and description.
3. **Core Prompt Engine (`src/prompts/researchAgentPrompt.ts`)**:
   - Implement the exact 6-stage role-based system prompt with few-shot examples and strict structured JSON response schema.
   - Incorporate explicit guardrails distinguishing documented vs. interpreted components.
4. **Editorial Components**:
   - `Header.tsx`: Clean wordmark, "RESEARCH WORKSPACE" badge, About modal trigger.
   - `PaperInput.tsx`: PDF file upload with drag-and-drop, URL input with auto-detection, Title input with Crossref integration, and validation.
   - `ArchitectureDiagram.tsx`: Mermaid diagram renderer with notebook styling and copy/zoom controls.
   - `ProjectOpportunities.tsx`: 3 student projects with difficulty badges and stack tags.
   - `MetadataSection.tsx`: Structured citation and DOI metadata display.
   - `ResearchReport.tsx`: Main report view with sticky sidebar, copy buttons, TXT/JSON download handlers.
5. **Documentation & Polish**:
   - Create thorough `README.md` covering prompt engineering, architecture, and CS assignment goals.
   - Verify build and linting (`compile_applet` and `lint_applet`).
