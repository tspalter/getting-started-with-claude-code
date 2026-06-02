const express = require('express');
const rateLimit = require('express-rate-limit');
const { enhanceSlides, generateSpeakerNotes, ENHANCEMENT_MODES, PROVIDERS } = require('../services/aiService');
const { parseMarkdown } = require('../utils/markdownParser');

const router = express.Router();

// Shared limiter for all generative AI calls (5 per minute per IP)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'AI rate limit reached. Please wait a minute and try again.' },
});

// GET /api/ai/providers
router.get('/providers', (req, res) => {
  const providers = Object.entries(PROVIDERS).map(([key, val]) => ({
    key,
    label: val.label,
  }));
  res.json({ providers });
});

// GET /api/ai/modes
router.get('/modes', (req, res) => {
  const modes = Object.entries(ENHANCEMENT_MODES).map(([key, val]) => ({
    key,
    label: val.label,
  }));
  res.json({ modes });
});

// POST /api/ai/enhance
router.post('/enhance', aiLimiter, async (req, res) => {
  const { markdown, mode, provider } = req.body;

  if (!markdown || typeof markdown !== 'string') {
    return res.status(400).json({ error: 'markdown field is required.' });
  }
  if (markdown.length > 50_000) {
    return res.status(413).json({ error: 'Content too large for AI enhancement (max 50,000 characters).' });
  }

  try {
    const enhancedMarkdown = await enhanceSlides(markdown, mode || 'polish', provider || 'openai');
    const slides = parseMarkdown(enhancedMarkdown);
    res.json({ markdown: enhancedMarkdown, slides, count: slides.length });
  } catch (err) {
    res.status(500).json({ error: friendlyAiError(err, provider) });
  }
});

// POST /api/ai/notes
router.post('/notes', aiLimiter, async (req, res) => {
  const { markdown, provider } = req.body;

  if (!markdown || typeof markdown !== 'string') {
    return res.status(400).json({ error: 'markdown field is required.' });
  }
  if (markdown.length > 50_000) {
    return res.status(413).json({ error: 'Content too large for speaker notes generation (max 50,000 characters).' });
  }

  let slides;
  try {
    slides = parseMarkdown(markdown);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }

  try {
    const notes = await generateSpeakerNotes(slides, provider || 'openai');
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: friendlyAiError(err, provider) });
  }
});

function friendlyAiError(err, provider) {
  // API key missing
  if (err.message === 'OPENAI_API_KEY is not set in environment variables.') {
    return 'OpenAI API key is not configured. Add your OPENAI_API_KEY to server/.env and restart the server.';
  }
  // Ollama not reachable
  const isConnectionError = !err.status && (
    err.message?.toLowerCase().includes('connection') ||
    err.cause?.code === 'ECONNREFUSED' ||
    err.code === 'ECONNREFUSED'
  );
  if (isConnectionError) {
    return provider === 'ollama'
      ? 'Could not connect to Ollama on port 11434. Make sure Ollama is running (run: ollama serve).'
      : 'Could not connect to the AI service. Please check your internet connection.';
  }
  // Invalid / revoked key
  if (err.status === 401) {
    return 'Invalid OpenAI API key. Please check your OPENAI_API_KEY in server/.env.';
  }
  // No billing credits
  if (err.status === 429 && err.code === 'insufficient_quota') {
    return 'Your OpenAI account has no remaining credits. Add credits at platform.openai.com/settings/billing.';
  }
  // Rate limited
  if (err.status === 429) {
    return 'AI rate limit reached. Please wait a moment and try again.';
  }
  // AI provider server error
  if (err.status >= 500) {
    return 'The AI service is experiencing issues. Please try again in a moment.';
  }
  return err.message || 'AI request failed. Please try again.';
}

module.exports = router;
