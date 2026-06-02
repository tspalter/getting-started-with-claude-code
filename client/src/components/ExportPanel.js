import React, { useState } from 'react';
import { exportPresentation } from '../services/api';

export default function ExportPanel({ markdown, theme, disabled }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleExport(format) {
    if (!markdown.trim()) return;
    setLoading(true);
    setError('');
    try {
      await exportPresentation(markdown, theme, format);
    } catch (err) {
      const msg = err.response?.data?.error || `Failed to export as ${format.toUpperCase()}. Please try again.`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card export-panel">
      <div className="card-header">
        <h2 className="card-title">Export</h2>
      </div>

      <p className="ai-description">
        Download your presentation in your preferred format.
      </p>

      {error && <p className="error-msg">{error}</p>}

      <div className="export-buttons">
        <button
          className="btn btn-export"
          onClick={() => handleExport('html')}
          disabled={loading || disabled}
          title="Interactive HTML with keyboard navigation"
        >
          {loading ? '…' : '⬇'} HTML
          <span className="export-hint">Interactive, web-friendly</span>
        </button>

        <button
          className="btn btn-export"
          onClick={() => handleExport('pdf')}
          disabled={loading || disabled}
          title="PDF — one page per slide"
        >
          {loading ? '…' : '⬇'} PDF
          <span className="export-hint">Print-ready, shareable</span>
        </button>
      </div>

      {disabled && (
        <p className="hint">Parse your slides first to enable export.</p>
      )}
    </div>
  );
}
