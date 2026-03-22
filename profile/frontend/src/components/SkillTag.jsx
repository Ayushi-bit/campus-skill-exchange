import React from 'react';

const COLORS = [
  { bg: 'rgba(200,115,58,0.12)', color: '#C8733A', border: 'rgba(200,115,58,0.3)' },
  { bg: 'rgba(107,58,31,0.10)',  color: '#6B3A1F', border: 'rgba(107,58,31,0.25)' },
  { bg: 'rgba(212,165,116,0.2)', color: '#9A5A2A', border: 'rgba(212,165,116,0.4)' },
  { bg: 'rgba(90,138,90,0.12)',  color: '#3A7A3A', border: 'rgba(90,138,90,0.3)' },
  { bg: 'rgba(79,138,255,0.1)',  color: '#2255BB', border: 'rgba(79,138,255,0.3)' },
];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return COLORS[hash % COLORS.length];
}

export default function SkillTag({ name, removable = false, onRemove, small = false }) {
  const c = getColor(name || '');
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: small ? '2px 8px' : '4px 10px',
      borderRadius: 20,
      fontSize: small ? 11 : 12,
      fontWeight: 600,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
      fontFamily: "'Nunito', sans-serif",
    }}>
      {name}
      {removable && (
        <span
          onClick={() => onRemove && onRemove(name)}
          style={{ cursor: 'pointer', fontSize: 14, lineHeight: 1, opacity: 0.6, marginLeft: 2 }}
          title="Remove"
        >×</span>
      )}
    </span>
  );
}
