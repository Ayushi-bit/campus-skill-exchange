import React from 'react';

const stats = [
  { icon: '📁', label: 'Projects Posted', key: 'posted',    color: '#6366f1' },
  { icon: '✅', label: 'Completed',        key: 'completed', color: '#059669' },
  { icon: '📨', label: 'Applications Sent', key: 'applied',  color: '#d97706' },
  { icon: '⭐', label: 'Avg Rating',        key: 'rating',   color: '#7c3aed' },
];

export default function AnalyticsSection({ analytics }) {
  return (
    <div
      className="fade-up"
      style={{ animationDelay: '0.1s', marginBottom: 20 }}
    >
      <div className="section-title">Analytics</div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {stats.map((c) => (
          <div key={c.label} className="stat-card">
            <div style={{ fontSize: 26, marginBottom: 8 }}>{c.icon}</div>
            <div
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: c.color,
              }}
            >
              {c.key === 'rating' ? `${analytics[c.key]}/5` : analytics[c.key]}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#9ca3af',
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
