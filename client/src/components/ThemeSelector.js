import React from 'react';

const THEMES = [
  { key: 'modern',    label: 'Modern',    accent: '#4f46e5', bg: '#ffffff' },
  { key: 'dark',      label: 'Dark',      accent: '#818cf8', bg: '#0f172a' },
  { key: 'minimal',   label: 'Minimal',   accent: '#404040', bg: '#fafafa' },
  { key: 'corporate', label: 'Corporate', accent: '#0284c7', bg: '#f8fafc' },
];

export default function ThemeSelector({ selected, onChange }) {
  return (
    <div className="theme-selector">
      <span className="theme-label">Theme:</span>
      {THEMES.map((t) => (
        <button
          key={t.key}
          className={`theme-chip ${selected === t.key ? 'active' : ''}`}
          style={{
            '--accent': t.accent,
            '--bg': t.bg,
            borderColor: selected === t.key ? t.accent : 'transparent',
          }}
          onClick={() => onChange(t.key)}
          title={t.label}
        >
          <span className="theme-swatch" style={{ background: t.bg, border: `2px solid ${t.accent}` }} />
          {t.label}
        </button>
      ))}
    </div>
  );
}
