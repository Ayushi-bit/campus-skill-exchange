import React from 'react';

export default function Avatar({ name = '', image = '', size = 40, style = {} }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const fontSize = size * 0.38;

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--border)',
          flexShrink: 0,
          ...style
        }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--orange), var(--skin))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      fontSize,
      fontWeight: 700,
      fontFamily: "'Playfair Display', serif",
      flexShrink: 0,
      border: '2px solid rgba(200,115,58,0.2)',
      ...style
    }}>
      {initials || '?'}
    </div>
  );
}
