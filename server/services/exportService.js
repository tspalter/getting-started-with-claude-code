const puppeteer = require('puppeteer');
const { generatePresentationHtml, generatePdfHtml } = require('./slideGenerator');

async function exportToHtml(slides, themeName) {
  const html = generatePresentationHtml(slides, themeName);
  return Buffer.from(html, 'utf-8');
}

async function exportToPdf(slides, themeName) {
  // Use a static, print-optimised template — no JS, all slides visible with break-after: page
  const html = generatePdfHtml(slides, themeName);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    // networkidle0 ensures Google Fonts and highlight.js finish loading before capture
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const result = await page.pdf({
      width: '960px',
      height: '540px',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    // Puppeteer v22+ returns Uint8Array; wrap in Buffer for correct binary response
    return Buffer.from(result);
  } finally {
    await browser.close();
  }
}

async function exportPresentation(slides, themeName, format) {
  if (format === 'html') {
    return { buffer: await exportToHtml(slides, themeName), contentType: 'text/html', extension: 'html' };
  }
  if (format === 'pdf') {
    return { buffer: await exportToPdf(slides, themeName), contentType: 'application/pdf', extension: 'pdf' };
  }
  throw new Error(`Unsupported format: ${format}. Use 'pdf' or 'html'.`);
}

module.exports = { exportPresentation };
