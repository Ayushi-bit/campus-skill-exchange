// ============================================================
//  ABOUT SECTION (v2 — includes contact links)
//  File: src/components/AboutSection.jsx
// ============================================================

import React from 'react';

export default function AboutSection({ bio, skills, user }) {
  const contacts = [
    { key: 'github_url',      label: 'GitHub',     icon: '🐙', color: '#1e1b4b' },
    { key: 'linkedin_url',    label: 'LinkedIn',   icon: '💼', color: '#0077b5' },
    { key: 'portfolio_url',   label: 'Portfolio',  icon: '🌐', color: '#7c3aed' },
    { key: 'whatsapp_number', label: 'WhatsApp',   icon: '💬', color: '#25d366', isPhone: true },
  ];

  const hasContacts = user && contacts.some(c => user[c.key]);

  return (
    <div className="fade-up card" style={{ animationDelay: '0.05s', marginBottom: 20 }}>
      <div className="section-title">About</div>

      {/* Bio */}
      <p style={{ color: '#4b5563', lineHeight: 1.7, fontSize: 14, marginBottom: 16 }}>
        {bio || 'No bio added yet.'}
      </p>

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: hasContacts ? 20 : 0 }}>
        {skills.map((s) => (
          <span key={s} className="skill-tag">{s}</span>
        ))}
      </div>

      {/* Contact Links */}
      {hasContacts && (
        <>
          <div style={{ height: 1, background: '#f1f0ff', margin: '16px 0' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {contacts.map(c => {
              const value = user[c.key];
              if (!value) return null;
              const href = c.isPhone
                ? `https://wa.me/${value.replace(/\D/g, '')}`
                : value;
              return (
                <a
                  key={c.key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#f5f4fe', borderRadius: 20,
                    padding: '6px 14px', fontSize: 12, fontWeight: 600,
                    color: c.color, textDecoration: 'none',
                    border: '1px solid #ede9fe',
                  }}
                >
                  <span>{c.icon}</span> {c.label}
                </a>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
