# AI Slide Deck Generator

A full-stack web application that turns plain Markdown into polished, exportable presentations — with optional AI enhancement powered by OpenAI or a local Ollama model.

Write your content in Markdown, separate slides with `---`, pick a theme, and preview your deck live in the browser. When you're ready, export as an interactive HTML file or a print-ready PDF.

---

## Features

- **Live slide preview** — see your deck update as you write
- **File or text input** — paste Markdown directly or upload a `.md` file (up to 10 MB)
- **Four built-in themes** — Modern, Dark, Minimal, Corporate
- **AI enhancement** — Polish, Expand, or Summarize your slides using OpenAI GPT-4o Mini or a local Ollama model
- **AI speaker notes** — generate per-slide presenter notes and a rhetorical audience question
- **Export to HTML or PDF** — HTML is keyboard-navigable; PDF is print-optimized at 960 × 540 px per slide

---

## Requirements

| Requirement | Notes |
|-------------|-------|
| **Node.js** v18 or higher | v24 recommended (tested on v24.16.0) |
| **npm** v9 or higher | Comes with Node.js |
| **OpenAI API key** | Required for AI features via OpenAI. Get one at [platform.openai.com](https://platform.openai.com) |
| **Ollama** *(optional)* | Local alternative to OpenAI. Install from [ollama.com](https://ollama.com), then run `ollama pull gemma4` |

> PDF export uses Puppeteer's bundled Chromium — no separate Chrome installation required.

---

## Installation

**1. Clone the repository and install all dependencies:**

```bash
git clone https://github.com/tspalt01/getting-started-with-claude-code.git
cd getting-started-with-claude-code
npm run install:all
```

**2. Create the server environment file:**

Create a file at `server/.env` with the following content:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

If you only plan to use Ollama locally, you can leave `OPENAI_API_KEY` blank — just make sure Ollama is running before launching the app.

**3. Start the app:**

```bash
npm run dev
```

This starts both the Express API (port 3001) and the React dev server (port 3000) concurrently. Open **http://localhost:3000** in your browser.

---

## Usage

The interface has two panels:

- **Left panel** — write or upload your Markdown, then use the AI and export tools
- **Right panel** — live slide preview that updates after you click "Parse Slides"

### Basic workflow

1. Write your Markdown in the text area (or upload a `.md` file)
2. Use `---` on its own line to separate slides
3. Click **Parse Slides →** to generate the preview
4. Optionally select an AI provider and click **Enhance** to rewrite content
5. Optionally click **Generate Notes** for speaker notes
6. Click **Export PDF** or **Export HTML** to download your presentation

---

## Interface

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ▶ AI Slide Deck Generator          Modern  Dark  Minimal  Corporate       │
├────────────────────────┬───────────────────────────────────────────────────┤
│                        │                                                    │
│  ┌──────────────────┐  │  ┌──────────────────────────────────────────────┐ │
│  │ Markdown Content │  │  │ Slide Preview                    2 / 6       │ │
│  │ ──────────────── │  │  │ ┌────────────────────────────────────────┐   │ │
│  │ # My Title       │  │  │ │▌                                       │   │ │
│  │                  │  │  │ │                                        │   │ │
│  │ - Point one      │  │  │ │  Getting Started                       │   │ │
│  │ - Point two      │  │  │ │                                        │   │ │
│  │                  │  │  │ │  • Write your content in Markdown      │   │ │
│  │ ---              │  │  │ │  • Use --- to separate slides          │   │ │
│  │                  │  │  │ │  • Choose a theme that fits your style │   │ │
│  │ # Next Slide     │  │  │ │  • Enhance with AI when needed         │   │ │
│  │ ...              │  │  │ │                                        │   │ │
│  │                  │  │  │ │                                   2/6  │   │ │
│  │ Use --- to sep.. │  │  │ └────────────────────────────────────────┘   │ │
│  │       [Parse →]  │  │  │         ◀ Prev    ● ● ○ ○ ○ ○    Next ▶     │ │
│  └──────────────────┘  │  └──────────────────────────────────────────────┘ │
│                        │                                                    │
│  ┌──────────────────┐  │                                                    │
│  │ AI Enhancement   │  │                                                    │
│  │ Provider: OpenAI │  │                                                    │
│  │ [Polish][Expand] │  │                                                    │
│  │      [Summarize] │  │                                                    │
│  │  [Enhance: Polish│  │                                                    │
│  └──────────────────┘  │                                                    │
│                        │                                                    │
│  ┌──────────────────┐  │                                                    │
│  │ Speaker Notes    │  │                                                    │
│  │ [Generate Notes] │  │                                                    │
│  └──────────────────┘  │                                                    │
│                        │                                                    │
│  ┌──────────────────┐  │                                                    │
│  │     Export       │  │                                                    │
│  │  [PDF]   [HTML]  │  │                                                    │
│  └──────────────────┘  │                                                    │
└────────────────────────┴───────────────────────────────────────────────────┘
```

---

## Slide Markdown Format

Slides are separated by `---` on its own line. Each slide can use standard Markdown — headings, lists, code blocks, blockquotes, and tables are all supported.

```markdown
# Welcome to AI Slide Deck Generator

Transform your Markdown into beautiful presentations

---

# Getting Started

- Write your content in Markdown
- Use `---` to separate slides
- Choose a theme that fits your style
- Enhance with AI when needed

---

# Code Example

```javascript
const greeting = "Hello, World!";
console.log(greeting);
```

Use code blocks to showcase technical content clearly.

---

# Export Options

Choose your format:

1. **PDF** — Print-ready, shareable anywhere
2. **HTML** — Interactive, web-friendly

---

# Thank You

> Great presentations start with great content.
```

A sample file is included at [`sample.md`](./sample.md) — upload it on first launch to see a complete example deck.

---

## AI Providers

| Provider | Model | Setup |
|----------|-------|-------|
| **OpenAI** *(default)* | GPT-4o Mini | Add `OPENAI_API_KEY` to `server/.env` |
| **Ollama** *(local)* | gemma4 | Run `ollama serve` and `ollama pull gemma4` |

The provider selector in the UI is shared between AI Enhancement and Speaker Notes — changing it once applies to both features.

---

## Export Formats

| Format | Description |
|--------|-------------|
| **HTML** | Self-contained file with keyboard navigation (← → arrow keys). Open in any browser — no server needed. |
| **PDF** | One slide per page at 960 × 540 px. Generated server-side via Puppeteer with full theme styling. |
