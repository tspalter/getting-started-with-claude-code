import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const THEME_STYLES = {
  modern:    { '--slide-bg': '#ffffff', '--slide-color': '#1a1a2e', '--slide-accent': '#4f46e5', '--slide-code-bg': '#f1f5f9' },
  dark:      { '--slide-bg': '#0f172a', '--slide-color': '#e2e8f0', '--slide-accent': '#818cf8', '--slide-code-bg': '#1e293b' },
  minimal:   { '--slide-bg': '#fafafa', '--slide-color': '#171717', '--slide-accent': '#404040', '--slide-code-bg': '#f4f4f5' },
  corporate: { '--slide-bg': '#f8fafc', '--slide-color': '#0f172a', '--slide-accent': '#0284c7', '--slide-code-bg': '#f0f9ff' },
};

export default function SlidePreview({ slides, theme }) {
  const [current, setCurrent] = useState(0);

  if (!slides || slides.length === 0) {
    return (
      <div className="card slide-preview-empty">
        <p>Parse your Markdown to see a slide preview here.</p>
      </div>
    );
  }

  const slide = slides[Math.min(current, slides.length - 1)];
  const themeVars = THEME_STYLES[theme] || THEME_STYLES.modern;

  function go(dir) {
    setCurrent((c) => Math.max(0, Math.min(slides.length - 1, c + dir)));
  }

  return (
    <div className="card slide-preview-card">
      <div className="card-header">
        <h2 className="card-title">Preview</h2>
        <span className="slide-counter">{current + 1} / {slides.length}</span>
      </div>

      <div className="slide-frame" style={themeVars}>
        <div className="slide-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {slide.markdown}
          </ReactMarkdown>
        </div>
      </div>

      <div className="slide-nav">
        <button className="btn btn-secondary" onClick={() => go(-1)} disabled={current === 0}>
          ← Prev
        </button>

        <div className="slide-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
              title={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button className="btn btn-secondary" onClick={() => go(1)} disabled={current === slides.length - 1}>
          Next →
        </button>
      </div>
    </div>
  );
}
