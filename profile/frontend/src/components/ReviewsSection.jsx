import React from 'react';
import StarRating from './StarRating';

export default function ReviewsSection({ reviews }) {
  return (
    <div
      className="fade-up card"
      style={{ animationDelay: '0.2s' }}
    >
      <div className="section-title">Ratings & Reviews</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {reviews.map((r, i) => {
          const initials = r.name
            .split(' ')
            .map((n) => n[0])
            .join('');
          return (
            <div
              key={i}
              style={{
                background: '#fafaff',
                borderRadius: 14,
                padding: '16px 20px',
                border: '1px solid #ede9fe',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#c7d2fe,#ddd6fe)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: '#4f46e5', fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 4,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b' }}>
                    {r.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{r.date}</span>
                </div>
                <StarRating rating={r.rating} size={14} />
                <p
                  style={{
                    marginTop: 6, fontSize: 13,
                    color: '#4b5563', lineHeight: 1.6,
                  }}
                >
                  {r.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
