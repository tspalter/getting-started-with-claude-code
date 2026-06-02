import React, { useRef } from 'react';

export default function MarkdownInput({ markdown, onChange, onParse, loading }) {
  const fileRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.md')) {
      alert('Only .md files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Markdown Content</h2>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => fileRef.current.click()}
          disabled={loading}
        >
          Upload .md File
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".md"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <textarea
        className="markdown-textarea"
        value={markdown}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"# My Presentation\n\nWrite your first slide here.\n\n---\n\n# Second Slide\n\n- Point one\n- Point two"}
        spellCheck={false}
        disabled={loading}
      />

      <div className="card-actions">
        <span className="hint">Use --- on its own line to separate slides</span>
        <button
          className="btn btn-primary"
          onClick={onParse}
          disabled={!markdown.trim() || loading}
        >
          {loading ? 'Parsing…' : 'Parse Slides →'}
        </button>
      </div>
    </div>
  );
}
