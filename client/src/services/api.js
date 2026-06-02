import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export async function parseMarkdown(markdown) {
  const { data } = await api.post('/slides/parse', { markdown });
  return data;
}

export async function uploadMarkdownFile(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/slides/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getProviders() {
  const { data } = await api.get('/ai/providers');
  return data.providers;
}

export async function getEnhancementModes() {
  const { data } = await api.get('/ai/modes');
  return data.modes;
}

export async function enhanceSlides(markdown, mode, provider) {
  const { data } = await api.post('/ai/enhance', { markdown, mode, provider });
  return data;
}

export async function generateSpeakerNotes(markdown, provider) {
  const { data } = await api.post('/ai/notes', { markdown, provider }, { timeout: 90000 });
  return data;
}

export async function exportPresentation(markdown, theme, format) {
  const response = await api.post(
    '/export',
    { markdown, theme, format },
    { responseType: 'blob', timeout: 120000 }
  );

  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `presentation.${format}`;
  link.click();
  URL.revokeObjectURL(url);
}
