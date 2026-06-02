const express = require('express');
const { exportPresentation } = require('../services/exportService');
const { parseMarkdown } = require('../utils/markdownParser');

const router = express.Router();

// POST /api/export — export slides as PDF or HTML
router.post('/', async (req, res) => {
  const { markdown, theme, format } = req.body;

  if (!markdown || typeof markdown !== 'string') {
    return res.status(400).json({ error: 'markdown field is required.' });
  }

  if (!['pdf', 'html'].includes(format)) {
    return res.status(400).json({ error: "format must be 'pdf' or 'html'." });
  }

  let slides;
  try {
    slides = parseMarkdown(markdown);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }

  try {
    const { buffer, contentType, extension } = await exportPresentation(slides, theme || 'modern', format);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="presentation.${extension}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Export failed. Please try again.' });
  }
});

module.exports = router;
