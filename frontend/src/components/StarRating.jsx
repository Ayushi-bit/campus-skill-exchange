import React from 'react';

export default function StarRating({ rating, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            fontSize: size,
            color: s <= Math.round(rating) ? '#f59e0b' : '#d1d5db',
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
