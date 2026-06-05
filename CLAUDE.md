# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment Facts

| Tool | Version / Location |
|------|--------------------|
| OS | Microsoft Windows 11 Home 10.0.26200 |
| PowerShell | 5.1.26100.8521 |
| Node.js | v24.16.0 |
| npm | 11.12.1 |
| Docker | not installed |
| Puppeteer Chrome | win64-149.0.7827.22 (`%USERPROFILE%\.cache\puppeteer\chrome\`) |

## Commands

**Install all dependencies (run once after cloning):**
```
npm run install:all
```

**Run the full app (server + client concurrently):**
```
npm run dev
```

**Run server or client individually:**
```
npm run server   # Express API on port 3001
npm run client   # React dev server on port 3000
```

**Environment setup:**  
Create `server/.env` with:
```
OPENAI_API_KEY=your_key_here
PORT=3001
```

For local Ollama: run `ollama serve` and pull the `gemma4` model before using that provider.

## Project Boundaries

**In-scope**
- Parsing markdown text (pasted or uploaded as `.md`) into slide objects using `---` as the separator
- Previewing slides in the browser with selectable themes (modern, dark, minimal, corporate)
- AI enhancement of slide content via OpenAI (`gpt-4o-mini`) or local Ollama (`gemma4`) — modes: polish, expand, summarize
- AI-generated speaker notes and a rhetorical question per deck
- Exporting presentations as a self-contained interactive HTML file or a paginated PDF
- File upload restricted to `.md` files up to 10 MB

**Out-of-scope**
- User accounts, authentication, or saved/persisted presentations
- Real-time collaboration or multi-user editing
- Non-markdown input formats (PPTX, Google Slides, DOCX, etc.)
- Slide animation or transition effects
- Image upload or embedding of binary assets within slides
- Custom theme creation or per-slide style overrides through the UI
- Production deployment configuration (the CORS policy explicitly blocks non-localhost origins in production)
- Support for AI providers other than OpenAI-compatible APIs (e.g., Anthropic, Gemini)

## Architecture

This is a monorepo with three `package.json` files: root (dev tooling only), `server/`, and `client/`. The root `npm run dev` uses `concurrently` to start both processes simultaneously.

### Request flow

```
React (port 3000) → proxy → Express (port 3001) → /api/*
```

The client's `package.json` sets `"proxy": "http://localhost:3001"`, so all `/api/` calls from `client/src/services/api.js` route through without CORS issues in development.

### Server (`server/`)

- `index.js` — Express entry point; wires up helmet, CORS (dev: localhost:3000 only), body parsing, a global rate limiter (100 req/15 min), and three routers.
- `routes/slides.js` — `POST /api/slides/parse` (raw markdown text) and `POST /api/slides/upload` (`.md` file, 10 MB limit via multer). Both call `utils/markdownParser.js`.
- `routes/ai.js` — `GET /api/ai/providers`, `GET /api/ai/modes`, `POST /api/ai/enhance`, `POST /api/ai/notes`. AI endpoints have a tighter limiter (5 req/min per IP).
- `routes/export.js` — `POST /api/export` returning an HTML or PDF binary blob. PDF export uses Puppeteer headless Chrome.
- `utils/markdownParser.js` — splits on `\n---\n`, calls `marked` to produce HTML, then strips `on*` event handlers and `javascript:` hrefs.
- `services/aiService.js` — wraps the OpenAI SDK for both OpenAI (`gpt-4o-mini`) and Ollama (`gemma4` via `http://localhost:11434/v1`). Clients are cached per provider. Contains `enhanceSlides` (polish/expand/summarize modes) and `generateSpeakerNotes` (returns structured JSON).
- `services/slideGenerator.js` — builds the standalone HTML export (interactive, keyboard-navigable) and the print-optimized PDF HTML template.
- `config/themes.js` — four themes (`modern`, `dark`, `minimal`, `corporate`) as plain objects; consumed by `slideGenerator.js` to inline CSS variables.

### Client (`client/src/`)

- `App.js` — top-level state: `markdown`, `slides`, `theme`, and shared AI `provider`. Orchestrates the parse → enhance → export workflow.
- `services/api.js` — all `axios` calls to the backend; `exportPresentation` triggers a browser download via `URL.createObjectURL`.
- Components are pure UI: `MarkdownInput`, `SlidePreview`, `ThemeSelector`, `AIEnhancer`, `SpeakerNotes`, `ExportPanel`.
- `styles/themes.css` — CSS for slide preview in the browser (mirrors the server-side theme objects).

### Key data shape

A parsed slide object:
```js
{ id: Number, title: String, markdown: String, html: String }
```

`---` in the source markdown is the slide separator. The parser strips blank chunks, so leading/trailing `---` are safe.
