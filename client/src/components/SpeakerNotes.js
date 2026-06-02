import React, { useState } from 'react';
import { generateSpeakerNotes } from '../services/api';

export default function SpeakerNotes({ markdown, slides, provider, disabled }) {
  const [notes, setNotes] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (!markdown.trim()) return;
    setLoading(true);
    setError('');
    setNotes(null);
    setCurrentIdx(0);
    try {
      const result = await generateSpeakerNotes(markdown, provider);
      setNotes(result.notes);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate speaker notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function go(dir) {
    if (!notes) return;
    setCurrentIdx(i => Math.max(0, Math.min(notes.slides.length - 1, i + dir)));
  }

  const slideNotes = notes?.slides[currentIdx];
  const slideTitle = slides[currentIdx]?.title ?? `Slide ${currentIdx + 1}`;

  return (
    <div className="card speaker-notes-card">
      <div className="card-header">
        <h2 className="card-title">Speaker Notes</h2>
        {notes && (
          <span className="slide-counter">{currentIdx + 1} / {notes.slides.length}</span>
        )}
      </div>

      <p className="ai-description">
        Generate brief presenter notes for each slide plus a rhetorical question for your audience.
      </p>

      {error && <p className="error-msg">{error}</p>}

      {!notes && (
        <button
          className="btn btn-primary btn-full"
          onClick={handleGenerate}
          disabled={loading || disabled}
        >
          {loading ? 'Generating notes…' : 'Generate Speaker Notes'}
        </button>
      )}

      {notes && (
        <>
          <div className="notes-slide-header">
            <span className="notes-slide-title">{slideTitle}</span>
          </div>

          <ul className="notes-list">
            {slideNotes?.notes.map((note, i) => (
              <li key={i} className="notes-item">{note}</li>
            ))}
          </ul>

          <div className="notes-nav">
            <button className="btn btn-secondary btn-sm" onClick={() => go(-1)} disabled={currentIdx === 0}>
              ← Prev
            </button>
            <div className="slide-dots">
              {notes.slides.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === currentIdx ? 'active' : ''}`}
                  onClick={() => setCurrentIdx(i)}
                  title={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => go(1)} disabled={currentIdx === notes.slides.length - 1}>
              Next →
            </button>
          </div>

          <div className="rhetorical-question">
            <span className="rq-label">Rhetorical Question</span>
            <p className="rq-text">"{notes.rhetoricalQuestion}"</p>
          </div>

          <button
            className="btn btn-secondary btn-sm btn-regenerate"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Regenerating…' : 'Regenerate'}
          </button>
        </>
      )}

      {disabled && !notes && (
        <p className="hint">Parse your slides first to generate speaker notes.</p>
      )}
    </div>
  );
}
