import React, { useState, useEffect, useCallback } from 'react';
import MarkdownInput from './components/MarkdownInput';
import SlidePreview from './components/SlidePreview';
import ThemeSelector from './components/ThemeSelector';
import AIEnhancer from './components/AIEnhancer';
import SpeakerNotes from './components/SpeakerNotes';
import ExportPanel from './components/ExportPanel';
import { parseMarkdown, getProviders } from './services/api';
import './styles/themes.css';

export default function App() {
  const [markdown, setMarkdown] = useState('');
  const [slides, setSlides] = useState([]);
  const [theme, setTheme] = useState('modern');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  // Shared AI provider state — controls both AIEnhancer and SpeakerNotes
  const [provider, setProvider] = useState('openai');
  const [providers, setProviders] = useState([
    { key: 'openai', label: 'OpenAI — GPT-4o Mini' },
    { key: 'ollama', label: 'Ollama — gemma4 (Local)' },
  ]);

  const hasParsed = slides.length > 0;

  useEffect(() => {
    getProviders()
      .then(setProviders)
      .catch(() => {}); // keep the hardcoded fallback on network error
  }, []);

  const handleParse = useCallback(async () => {
    if (!markdown.trim()) return;
    setParsing(true);
    setParseError('');
    try {
      const result = await parseMarkdown(markdown);
      setSlides(result.slides);
    } catch (err) {
      setParseError(err.response?.data?.error || 'Failed to parse markdown. Please check your content.');
    } finally {
      setParsing(false);
    }
  }, [markdown]);

  const handleMarkdownChange = useCallback((value) => {
    setMarkdown(value);
    setSlides([]);
    setParseError('');
  }, []);

  const handleEnhanced = useCallback((enhancedMarkdown, enhancedSlides) => {
    setMarkdown(enhancedMarkdown);
    setSlides(enhancedSlides);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">▶</span>
            <span className="logo-text">AI Slide Deck Generator</span>
          </div>
          <ThemeSelector selected={theme} onChange={setTheme} />
        </div>
      </header>

      <main className="app-main">
        <div className="left-column">
          <MarkdownInput
            markdown={markdown}
            onChange={handleMarkdownChange}
            onParse={handleParse}
            loading={parsing}
          />

          {parseError && <div className="alert alert-error">{parseError}</div>}

          {hasParsed && (
            <div className="parse-success">
              {slides.length} slide{slides.length !== 1 ? 's' : ''} parsed successfully.
            </div>
          )}

          <AIEnhancer
            markdown={markdown}
            onEnhanced={handleEnhanced}
            disabled={!hasParsed}
            provider={provider}
            onProviderChange={setProvider}
            providers={providers}
          />

          <SpeakerNotes
            markdown={markdown}
            slides={slides}
            provider={provider}
            disabled={!hasParsed}
          />

          <ExportPanel
            markdown={markdown}
            theme={theme}
            disabled={!hasParsed}
          />
        </div>

        <div className="right-column">
          <SlidePreview slides={slides} theme={theme} />
        </div>
      </main>
    </div>
  );
}
