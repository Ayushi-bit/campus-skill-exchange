// ============================================================
//  ANALYTICS SECTION — Identity & Reputation metrics
//  File: src/components/AnalyticsSection.jsx
//  Shows: Projects Posted, Completed, Avg Rating
//  NOTE: Applications Sent is on Dashboard, not here.
// ============================================================

import React from 'react';
import StarRating from './StarRating';

export default function AnalyticsSection({ analytics }) {
  return (
    <div className="fade-up" style={{ animationDelay: '0.1s', marginBottom: 20 }}>
      <div className="section-title">Reputation</div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>

        {/* Projects Posted */}
        <div className="stat-card">
          <div style={{ fontSize: 26, marginBottom: 8 }}>📂</div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 26, fontWeight: 800, color: '#6366f1',
          }}>
            {analytics.posted}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontWeight: 500 }}>
            Projects Posted
          </div>
        </div>

        {/* Projects Completed */}
        <div className="stat-card">
          <div style={{ fontSize: 26, marginBottom: 8 }}>🏆</div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 26, fontWeight: 800, color: '#059669',
          }}>
            {analytics.completed}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontWeight: 500 }}>
            Completed
          </div>
        </div>

        {/* Average Rating — larger and more prominent on Profile */}
        <div className="stat-card" style={{ minWidth: 160 }}>
          <div style={{ fontSize: 26, marginBottom: 6 }}>⭐</div>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 26, fontWeight: 800, color: '#7c3aed',
            marginBottom: 4,
          }}>
            {analytics.rating}/5
          </div>
          <StarRating rating={analytics.rating} size={14} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, fontWeight: 500 }}>
            Average Rating
          </div>
        </div>

      </div>
    </div>
  );
}
