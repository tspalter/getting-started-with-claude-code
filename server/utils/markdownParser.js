const { marked } = require('marked');

// Split raw markdown into slide chunks using --- as the separator
function splitIntoSlides(markdown) {
  const raw = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const chunks = raw.split(/\n---\n/);
  return chunks.map((chunk) => chunk.trim()).filter((chunk) => chunk.length > 0);
}

// Extract a plain-text title from the first heading in a slide chunk
function extractTitle(chunk) {
  const match = chunk.match(/^#{1,6}\s+(.+)/m);
  return match ? match[1].trim() : 'Slide';
}

// Sanitize HTML to prevent XSS: strip event handlers and javascript: hrefs
function sanitizeHtml(html) {
  return html
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/\s+on\w+='[^']*'/gi, '')
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
    .replace(/href='javascript:[^']*'/gi, "href='#'");
}

function parseMarkdown(markdown) {
  if (typeof markdown !== 'string') {
    throw new Error('Markdown input must be a string.');
  }

  const sanitizedInput = markdown.slice(0, 500_000); // hard cap: 500 KB
  const chunks = splitIntoSlides(sanitizedInput);

  if (chunks.length === 0) {
    throw new Error('No slide content found. Use --- to separate slides.');
  }

  const slides = chunks.map((chunk, index) => {
    const rawHtml = marked.parse(chunk);
    const html = sanitizeHtml(rawHtml);
    return {
      id: index + 1,
      title: extractTitle(chunk),
      markdown: chunk,
      html,
    };
  });

  return slides;
}

module.exports = { parseMarkdown };
