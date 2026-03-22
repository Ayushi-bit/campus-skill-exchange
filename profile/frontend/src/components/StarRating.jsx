import React, { useState } from 'react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 18 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{
            fontSize: size,
            cursor: readOnly ? 'default' : 'pointer',
            color: star <= display ? '#C8733A' : '#D9C9A8',
            transition: 'color 0.15s',
            lineHeight: 1,
          }}
        >★</span>
      ))}
      {readOnly && value > 0 && (
        <span style={{
          fontSize: size * 0.75,
          color: 'var(--muted)',
          marginLeft: 4,
          fontFamily: "'DM Mono', monospace",
        }}>
          {Number(value).toFixed(1)}
        </span>
      )}
    </span>
  );
}
