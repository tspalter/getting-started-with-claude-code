const themes = require('../config/themes');

function buildSlideHtml(slide, theme, index, total) {
  return `
    <div class="slide" data-slide="${index + 1}">
      <div class="slide-content">
        ${slide.html}
      </div>
      <div class="slide-footer">
        <span class="slide-number">${index + 1} / ${total}</span>
      </div>
    </div>`;
}

function generatePresentationHtml(slides, themeName = 'modern') {
  const theme = themes[themeName] || themes.modern;
  const slidesHtml = slides
    .map((slide, i) => buildSlideHtml(slide, theme, i, slides.length))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Presentation</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: ${theme.fontFamily};
      background: #1a1a1a;
      color: ${theme.color};
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .slide-container {
      width: 960px;
      max-width: 100%;
    }

    .slide {
      display: none;
      background: ${theme.background};
      width: 960px;
      min-height: 540px;
      border-radius: 8px;
      padding: 64px 80px 48px;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      border-top: 6px solid ${theme.accentColor};
    }

    .slide.active { display: flex; flex-direction: column; justify-content: center; }

    .slide-content h1, .slide-content h2 {
      color: ${theme.headingColor};
      margin-bottom: 24px;
      line-height: 1.2;
    }
    .slide-content h1 { font-size: 2.2rem; }
    .slide-content h2 { font-size: 1.6rem; }
    .slide-content h3 { font-size: 1.2rem; color: ${theme.headingColor}; margin-bottom: 12px; }

    .slide-content p { margin-bottom: 16px; line-height: 1.7; font-size: 1.05rem; }

    .slide-content ul, .slide-content ol {
      margin: 0 0 16px 24px;
      line-height: 1.8;
      font-size: 1.05rem;
    }

    .slide-content code {
      background: ${theme.codeBackground};
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .slide-content pre {
      background: ${theme.codeBackground};
      border: 1px solid ${theme.borderColor};
      border-radius: 6px;
      padding: 20px;
      overflow-x: auto;
      margin-bottom: 16px;
    }

    .slide-content pre code { background: none; padding: 0; }

    .slide-content blockquote {
      border-left: 4px solid ${theme.accentColor};
      padding: 8px 16px;
      margin: 16px 0;
      font-style: italic;
      color: ${theme.accentColor};
    }

    .slide-footer {
      position: absolute;
      bottom: 20px;
      right: 32px;
      font-size: 0.8rem;
      opacity: 0.5;
    }

    .controls {
      display: flex;
      gap: 16px;
      margin-top: 20px;
      align-items: center;
      justify-content: center;
    }

    .controls button {
      background: ${theme.accentColor};
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95rem;
      font-family: ${theme.fontFamily};
    }

    .controls button:hover { opacity: 0.85; }
    .controls button:disabled { opacity: 0.3; cursor: default; }

    #progress {
      color: #aaa;
      font-size: 0.9rem;
      min-width: 80px;
      text-align: center;
      font-family: ${theme.fontFamily};
    }
  </style>
</head>
<body>
  <div class="slide-container">
    ${slidesHtml}
  </div>
  <div class="controls">
    <button id="prev" onclick="navigate(-1)">&#8592; Prev</button>
    <span id="progress">1 / ${slides.length}</span>
    <button id="next" onclick="navigate(1)">Next &#8594;</button>
  </div>
  <script>
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    const progress = document.getElementById('progress');

    function show(n) {
      slides.forEach((s, i) => s.classList.toggle('active', i === n));
      progress.textContent = (n + 1) + ' / ' + slides.length;
      document.getElementById('prev').disabled = n === 0;
      document.getElementById('next').disabled = n === slides.length - 1;
    }

    function navigate(dir) {
      current = Math.max(0, Math.min(slides.length - 1, current + dir));
      show(current);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigate(-1);
    });

    show(0);
  </script>
</body>
</html>`;
}

function generatePdfHtml(slides, themeName = 'modern') {
  const theme = themes[themeName] || themes.modern;

  const slidesHtml = slides
    .map((slide, i) => {
      const isLast = i === slides.length - 1;
      return `
    <div class="slide${isLast ? ' last' : ''}">
      <div class="slide-content">
        ${slide.html}
      </div>
      <div class="slide-footer">
        <span class="slide-number">${i + 1} / ${slides.length}</span>
      </div>
    </div>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Presentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" />
  <style>
    @page { size: 960px 540px; margin: 0; }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      /* Ensure backgrounds and colors are always printed, not stripped */
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Inter', 'Segoe UI', sans-serif;
      background: ${theme.background};
      color: ${theme.color};
      -webkit-font-smoothing: antialiased;
    }

    .slide {
      width: 960px;
      height: 540px;
      background: ${theme.background};
      color: ${theme.color};
      padding: 40px 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-top: 5px solid ${theme.accentColor};
      overflow: hidden;
      break-after: page;
      position: relative;
    }

    .slide.last { break-after: avoid; }

    /* Mirrors .slide-body h1/h2 in themes.css */
    .slide-content h1, .slide-content h2 {
      color: ${theme.headingColor};
      margin-bottom: 20px;
      line-height: 1.2;
    }
    .slide-content h1 { font-size: 1.8rem; font-weight: 700; }
    .slide-content h2 { font-size: 1.35rem; font-weight: 600; }
    .slide-content h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 10px; }

    .slide-content p { margin-bottom: 14px; line-height: 1.7; }

    .slide-content ul, .slide-content ol {
      margin: 0 0 14px 24px;
      line-height: 1.8;
    }

    .slide-content strong { font-weight: 600; }
    .slide-content em { font-style: italic; }

    .slide-content code {
      background: ${theme.codeBackground};
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.88em;
    }

    .slide-content pre {
      background: ${theme.codeBackground};
      border-radius: 6px;
      padding: 16px;
      overflow: hidden;
      margin-bottom: 14px;
    }

    .slide-content pre code { background: none; padding: 0; font-size: inherit; }

    .slide-content blockquote {
      border-left: 4px solid ${theme.accentColor};
      padding: 8px 16px;
      font-style: italic;
      margin: 14px 0;
      opacity: 0.8;
    }

    .slide-content table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 14px;
    }

    .slide-content th, .slide-content td {
      border: 1px solid ${theme.borderColor};
      padding: 6px 12px;
      text-align: left;
    }

    .slide-content th {
      background: ${theme.codeBackground};
      font-weight: 600;
    }

    .slide-footer {
      position: absolute;
      bottom: 16px;
      right: 24px;
      font-size: 0.75rem;
      opacity: 0.45;
    }
  </style>
</head>
<body>
  ${slidesHtml}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>
    if (typeof hljs !== 'undefined') {
      document.querySelectorAll('pre code').forEach(function(block) {
        hljs.highlightElement(block);
      });
    }
  </script>
</body>
</html>`;
}

module.exports = { generatePresentationHtml, generatePdfHtml };
