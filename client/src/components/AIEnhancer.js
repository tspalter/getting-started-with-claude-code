import React, { useState, useEffect } from 'react';
import { getEnhancementModes, enhanceSlides } from '../services/api';

export default function AIEnhancer({ markdown, onEnhanced, disabled, provider, onProviderChange, providers }) {
  const [modes, setModes] = useState([]);
  const [selectedMode, setSelectedMode] = useState('polish');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getEnhancementModes()
      .then(setModes)
      .catch(() => setModes([
        { key: 'polish', label: 'Polish' },
        { key: 'expand', label: 'Expand' },
        { key: 'summarize', label: 'Summarize' },
      ]));
  }, []);

  async function handleEnhance() {
    if (!markdown.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await enhanceSlides(markdown, selectedMode, provider);
      onEnhanced(result.markdown, result.slides);
    } catch (err) {
      setError(err.response?.data?.error || 'AI enhancement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card ai-enhancer">
      <div className="card-header">
        <h2 className="card-title">AI Enhancement</h2>
      </div>

      {/* Provider selector — shared with Speaker Notes */}
      <div className="provider-row">
        <label className="provider-label" htmlFor="ai-provider">Provider:</label>
        <select
          id="ai-provider"
          className="provider-select"
          value={provider}
          onChange={e => onProviderChange(e.target.value)}
          disabled={loading}
        >
          {providers.map(p => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      <p className="ai-description">
        Automatically rewrite your slide content using the selected AI provider.
      </p>

      <div className="mode-selector">
        {modes.map(m => (
          <button
            key={m.key}
            className={`mode-chip ${selectedMode === m.key ? 'active' : ''}`}
            onClick={() => setSelectedMode(m.key)}
            disabled={loading || disabled}
          >
            {m.label}
          </button>
        ))}
      </div>

      {error && <p className="error-msg">{error}</p>}

      <button
        className="btn btn-primary btn-full"
        onClick={handleEnhance}
        disabled={loading || disabled || !markdown.trim()}
      >
        {loading ? 'Enhancing…' : `Enhance: ${modes.find(m => m.key === selectedMode)?.label ?? selectedMode}`}
      </button>

      {disabled && <p className="hint">Parse your slides first to enable AI features.</p>}
    </div>
  );
}
