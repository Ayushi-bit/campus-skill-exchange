// ============================================================
//  PROFILE HEADER (Updated — Edit button triggers navigation)
//  File: src/components/ProfileHeader.jsx
// ============================================================

import React from 'react';
import StarRating from './StarRating';

export default function ProfileHeader({ user, onEditClick }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <div
      className="fade-up"
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 60%, #a855f7 100%)',
        borderRadius: 24,
        padding: '32px 36px',
        color: '#fff',
        display: 'flex',
        gap: 28,
        alignItems: 'center',
        flexWrap: 'wrap',
        boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', right: -40, top: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)',
      }} />
      <div style={{
        position: 'absolute', right: 60, bottom: -60,
        width: 220, height: 220, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />

      {/* Avatar */}
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        border: '3px solid rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 38, fontWeight: 800, color: '#fff',
        flexShrink: 0, letterSpacing: -1,
        backdropFilter: 'blur(8px)',
      }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 24, fontWeight: 800, marginBottom: 4,
        }}>
          {user.name}
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>{user.email}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            background: 'rgba(255,255,255,0.18)', borderRadius: 20,
            padding: '4px 14px', fontSize: 12, fontWeight: 600,
            backdropFilter: 'blur(4px)',
          }}>
            {user.domain}
          </span>
          <span style={{
            background: 'rgba(255,255,255,0.18)', borderRadius: 20,
            padding: '4px 14px', fontSize: 12, fontWeight: 600,
            backdropFilter: 'blur(4px)',
          }}>
            {user.level}
          </span>
        </div>
      </div>

      {/* Rating + Edit Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 28, fontWeight: 800, lineHeight: 1,
          }}>
            {user.rating}
          </div>
          <StarRating rating={user.rating} size={18} />
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>Average Rating</div>
        </div>

        {/* ← This now calls onEditClick from ProfilePage */}
        <button
          onClick={onEditClick}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.5)',
            color: '#fff',
            borderRadius: 10,
            padding: '8px 20px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
            backdropFilter: 'blur(8px)',
          }}
        >
          ✎ Edit Profile
        </button>
      </div>
    </div>
  );
}
