# PaperTrail — Research Paper Investigation Workspace

> *"Go beyond the abstract. Understand the problem. Trace the architecture. Discover what you could build next."*

PaperTrail is an academic research investigation workspace built for computer science undergraduate students. It is a college assignment project demonstrating practical Generative AI, rigorous prompt engineering, and full-stack AI agent development.

Instead of a generic chatbot, PaperTrail functions as a digital research notebook that transforms complex academic publications into structured technical notes, system architecture diagrams, and actionable student capstone proposals.

---

## 1. Core Capabilities & Features

1. **Multi-Modal Document Input**:
   - **PDF Upload**: Direct file drag-and-drop or picker; transmits binary content as `application/pdf` to Gemini's native multimodal document processing engine, analyzing text, equations, and tables across complete papers.
   - **Academic URL Ingestion**: Automated recognition of open-access arXiv links (automatically retrieving official PDF documents). For paywalled or restricted publisher portals, the workspace stops gracefully and provides an actionable PDF upload alternative rather than hallucinating on truncated text.
   - **Title Resolution**: Integrates with live **Crossref** (`api.crossref.org`) and **Semantic Scholar** academic APIs to retrieve verified publication venue, publication year, author rosters, DOIs, and official abstracts. Transparently tags reports as abstract-level scope so students always know the true depth.

2. **The 6-Stage Research Agent**:
   - **01 — Paper Overview**: 250–300 word executive summary for CS undergraduates.
   - **02 — Research Problem & Motivation**: Core challenges, motivations, and prior limitations addressed.
   - **03 — Methodology & Formulation**: Proposed solution, algorithmic techniques, mathematical equations, and benchmark baselines.
   - **04 — Technical Breakdown**: Concrete pipelines from input data formats to preprocessing, ordered execution stages, outputs, and hardware dependencies.
   - **05 — System Architecture Flowchart**: Dynamic Mermaid.js `graph TD` diagrams rendered with an editorial notebook palette, interactive zoom/pan, and copyable syntax.
   - **06 — Research Importance & Limitations**: What problems existed before, improvements over prior art, acknowledged limitations, and unsolved research questions.
   - **07 — Student Project Opportunities**: Exactly three realistic undergraduate projects with specific gap addressed, proposed improvement mechanism, measurable outcomes, recommended tech stacks, and difficulty tiers (Beginner, Intermediate, Advanced).
   - **08 — Paper Metadata & Citations**: Verifiable citations with retrieval sources, dates, and live DOI links.

3. **Academic Integrity & Grounding**:
   - Zero hallucination of experimental metrics or equations.
   - Explicit declaration of "Unavailable" when citations cannot be verified.
   - Clear distinction between author-documented facts and AI-suggested student projects.
   - Transparent analysis depth tagging: `Full Document Analysis` vs `Abstract & Metadata Analysis`.

4. **Editorial Visual Design**:
   - Warm ivory canvas (`#FBF9F5`) and dark charcoal typography (`#1C1917`).
   - Muted burnt-orange / terracotta accents (`#C2410C`).
   - Monospaced typography for technical labels and tabular numerals.
   - Zero-pill discipline: unboxed metadata separated by typographic bullets (`·`).
   - Single-click export of complete reports in publication-grade **PDF**, clean **TXT**, and structured **JSON** formats.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons
- **Document & PDF Export**: jsPDF (client-side academic vector report generation)
- **Diagrams**: Mermaid.js (client-side SVG vector rendering)
- **Backend**: Node.js, Express, `tsx`
- **AI Engine**: Google Gemini API (`@google/genai` TypeScript SDK, `gemini-3.8-flash` model)
- **External Data Sources**: Crossref REST API, Semantic Scholar Graph API, arXiv e-print service

---

## 3. Application Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PaperTrail Frontend                           │
│                                                                        │
│   • Top Navigation & About Agent Modal                                 │
│   • PaperInput (Tabs for PDF upload, URL auto-fetch, Title search)    │
│   • InvestigationProgress (Stage-by-stage real-time progress)          │
│   • ResearchReport:                                                    │
│       - Sticky 8-section navigation sidebar                            │
│       - Copy individual sections                                       │
│       - Interactive Mermaid.js ArchitectureDiagram                     │
│       - Student Project Opportunities with stack badges                │
│       - Metadata & Citation Verification                               │
│       - TXT & JSON document downloads                                  │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │
                                      ▼  POST /api/analyze-paper
┌────────────────────────────────────────────────────────────────────────┐
│                        Express Backend (server.ts)                     │
│                                                                        │
│   • Ingestion router:                                                  │
│       - Mode 'pdf': base64 binary forwarded to Gemini inlineData       │
│       - Mode 'url': arXiv PDF stream or paywall diagnostic detector   │
│       - Mode 'title': Crossref / Semantic Scholar metadata resolver   │
│   • @google/genai SDK (gemini-3.8-flash)                               │
│   • Server-side prompt engine (researchAgentPrompt.ts)                │
│   • JSON response schema validator & sanitizer                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Prompt Engineering Techniques

1. **Role-Based Prompting**:
   Establishes the agent as an experienced Computer Science research analyst whose target audience is undergraduate CS students. Enforces technical precision and algorithmic depth while avoiding inaccessible jargon.

2. **Task Decomposition**:
   Deconstructs paper investigation into 6 discrete, sequential stages:
   - Stage 1: Understanding & Executive Summary
   - Stage 2: Technical Breakdown & Dependencies
   - Stage 3: System Architecture Flowchart (Mermaid `graph TD`)
   - Stage 4: Scientific Importance & Limitations
   - Stage 5: Undergraduate Development Opportunities
   - Stage 6: Grounded Metadata Verification

3. **Few-Shot Exemplar**:
   Provides an exemplar based on the canonical Transformer architecture (*Attention Is All You Need*), demonstrating the expected level of technical detail, mathematical formulation style, and valid Mermaid diagram syntax without biasing the submitted paper's topic.

4. **Structured JSON Output**:
   Guarantees a clean, predictable JSON schema consumed directly by frontend components. Eliminates extraneous conversational pleasantries or markdown formatting issues.

---

## 5. Security & API Key Configuration

- The `GEMINI_API_KEY` is loaded exclusively on the server (`server.ts`) via `process.env.GEMINI_API_KEY`.
- No client-side code imports `@google/genai` or references the API key.
- `.env` and `.env.local` are explicitly listed in `.gitignore`.
- All client-side report exports (TXT and JSON) sanitize internal variables and export only academic notes.

---

## 6. Installation & Execution

### Prerequisites
- Node.js (version 20 or higher recommended)
- A Google Gemini API key (set in your environment as `GEMINI_API_KEY`)

### Setup Instructions

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=3000
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## License & Attribution

Built for academic and educational evaluation in Computer Science and Generative AI agent design.
Licensed under the Apache-2.0 License.
