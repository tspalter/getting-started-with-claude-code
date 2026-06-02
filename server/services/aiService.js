const OpenAI = require('openai');

const PROVIDERS = {
  openai: { label: 'OpenAI — GPT-4o Mini', model: 'gpt-4o-mini' },
  ollama: { label: 'Ollama — gemma4 (Local)', model: 'gemma4' },
};

// One cached client per provider
const clientCache = {};

function getClient(provider = 'openai') {
  if (clientCache[provider]) return clientCache[provider];

  if (provider === 'ollama') {
    clientCache.ollama = new OpenAI({
      baseURL: 'http://localhost:11434/v1',
      apiKey: 'ollama', // Ollama ignores the key; the SDK requires a non-empty value
    });
    return clientCache.ollama;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables.');
  }
  clientCache.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return clientCache.openai;
}

function getModel(provider) {
  return PROVIDERS[provider]?.model ?? PROVIDERS.openai.model;
}

// ─── Enhancement ─────────────────────────────────────────────────────────────

const ENHANCEMENT_MODES = {
  polish: {
    label: 'Polish',
    systemPrompt:
      'You are a presentation expert. Improve the clarity, grammar, and flow of slide content. Keep the same structure and Markdown formatting. Return only the improved Markdown.',
  },
  expand: {
    label: 'Expand',
    systemPrompt:
      'You are a presentation expert. Expand the slide content with additional relevant points and detail. Keep Markdown formatting and use --- to separate slides. Return only Markdown.',
  },
  summarize: {
    label: 'Summarize',
    systemPrompt:
      'You are a presentation expert. Condense the slide content to its key points. Keep Markdown formatting and use --- to separate slides. Return only Markdown.',
  },
};

async function enhanceSlides(markdown, mode = 'polish', provider = 'openai') {
  const modeConfig = ENHANCEMENT_MODES[mode];
  if (!modeConfig) {
    throw new Error(`Invalid enhancement mode. Choose from: ${Object.keys(ENHANCEMENT_MODES).join(', ')}`);
  }

  const client = getClient(provider);
  const completion = await client.chat.completions.create({
    model: getModel(provider),
    messages: [
      { role: 'system', content: modeConfig.systemPrompt },
      { role: 'user', content: `Please enhance the following slide deck content:\n\n${markdown}` },
    ],
    max_tokens: 4000,
    temperature: 0.7,
  });

  const enhanced = completion.choices[0]?.message?.content;
  if (!enhanced) throw new Error('AI returned an empty response.');
  return enhanced.trim();
}

// ─── Speaker Notes ────────────────────────────────────────────────────────────

const NOTES_SYSTEM_PROMPT = `You are an expert presentation coach. Given slide content, generate practical presenter notes for each slide and one rhetorical question for the audience.

Respond ONLY with a valid JSON object — no markdown fences, no explanation, nothing else:
{
  "slides": [
    { "id": 1, "notes": ["speaking tip or emphasis point", "pacing or transition hint"] }
  ],
  "rhetoricalQuestion": "A single thought-provoking question for the audience?"
}

Rules:
- 2–3 concise notes per slide (key points to stress, pacing cues, transition hints)
- Each note must be under 90 characters
- The rhetorical question should make the audience reflect on the presentation's core theme`;

function extractJson(raw) {
  // Strip markdown code fences if the model wraps its response
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return JSON.parse(fenced[1].trim());
  // Fall back to extracting the first {...} block from the text
  const obj = raw.match(/\{[\s\S]*\}/);
  if (obj) return JSON.parse(obj[0]);
  return JSON.parse(raw.trim());
}

async function generateSpeakerNotes(slides, provider = 'openai') {
  const client = getClient(provider);

  const slideContent = slides
    .map((s, i) => `Slide ${i + 1}:\n${s.markdown}`)
    .join('\n\n---\n\n');

  const completion = await client.chat.completions.create({
    model: getModel(provider),
    messages: [
      { role: 'system', content: NOTES_SYSTEM_PROMPT },
      { role: 'user', content: `Generate presenter notes for this slide deck:\n\n${slideContent}` },
    ],
    max_tokens: 2000,
    temperature: 0.6,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('AI returned an empty response.');

  let parsed;
  try {
    parsed = extractJson(raw);
  } catch {
    throw new Error('AI response was not valid JSON. Please try again.');
  }

  if (!Array.isArray(parsed.slides) || typeof parsed.rhetoricalQuestion !== 'string') {
    throw new Error('AI response was missing required fields. Please try again.');
  }

  return parsed;
}

module.exports = { enhanceSlides, generateSpeakerNotes, ENHANCEMENT_MODES, PROVIDERS };
