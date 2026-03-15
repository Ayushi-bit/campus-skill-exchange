// ============================================================
//  DELETE ACCOUNT MODAL
//  File: src/components/DeleteAccountModal.jsx
//  Step 1: Warning + OK button
//  Step 2: Password input (hidden for Google OAuth users)
// ============================================================

import React, { useState, useEffect } from 'react';
import { deleteAccount } from '../services/api';

export default function DeleteAccountModal({ userId, isGoogleUser, onClose, onDeleted }) {
  const [password, setPassword] = useState('');
  const [step, setStep]         = useState(1); // 1 = warning, 2 = confirm
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleDelete = async () => {
    if (!isGoogleUser && !password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await deleteAccount({ user_id: userId, password });
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* ── Modal ── */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 460,
            margin: '0 16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            animation: 'modalIn 0.2s ease',
          }}
        >
          {/* ── Red Header ── */}
          <div style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            padding: '28px 32px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>⚠️</div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6,
            }}>
              Delete Account
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
              This action is <strong>permanent</strong> and cannot be undone.
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: '28px 32px 32px' }}>

            {step === 1 ? (
              <>
                {/* Step 1 — Warning */}
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 12, padding: '16px 20px', marginBottom: 24,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 10 }}>
                    The following will be permanently deleted:
                  </div>
                  {[
                    'Your profile and personal information',
                    'All projects you have posted',
                    'All applications you have submitted',
                    'All ratings and reviews',
                    'All notifications',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ color: '#ef4444', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✕</span>
                      <span style={{ fontSize: 13, color: '#7f1d1d' }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={onClose}
                    style={{
                      flex: 1, background: '#f5f4fe', border: 'none',
                      borderRadius: 12, padding: '11px 0',
                      color: '#6366f1', fontWeight: 600, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none', borderRadius: 12, padding: '11px 0',
                      color: '#fff', fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Yes, Delete →
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Step 2 — Password or Google confirmation */}
                {isGoogleUser ? (
                  // Google users — no password needed
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 12, padding: '16px 20px', marginBottom: 20,
                    fontSize: 13, color: '#7f1d1d', lineHeight: 1.6,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>🔐 Google Account</div>
                    You signed in with Google. Click below to permanently delete your account — no password is needed.
                  </div>
                ) : (
                  // Regular users — must enter password
                  <>
                    <div style={{ fontSize: 14, color: '#4b5563', marginBottom: 6, fontWeight: 600 }}>
                      Enter your password to confirm
                    </div>
                    <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
                      We need to verify it's really you before deleting your account.
                    </div>
                    <input
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                      autoFocus
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        border: `1.5px solid ${error ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: 10, padding: '10px 14px',
                        fontSize: 14, color: '#1e1b4b',
                        outline: 'none', fontFamily: 'inherit',
                        background: '#fafafa', marginBottom: error ? 8 : 20,
                        transition: 'border-color 0.2s',
                      }}
                    />
                  </>
                )}

                {error && (
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 8, padding: '10px 14px',
                    color: '#dc2626', fontSize: 13, marginBottom: 16,
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => { setStep(1); setError(''); setPassword(''); }}
                    disabled={loading}
                    style={{
                      flex: 1, background: '#f5f4fe', border: 'none',
                      borderRadius: 12, padding: '11px 0',
                      color: '#6366f1', fontWeight: 600, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading || (!isGoogleUser && !password.trim())}
                    style={{
                      flex: 1,
                      background: loading || (!isGoogleUser && !password.trim())
                        ? '#f3f4f6'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none', borderRadius: 12, padding: '11px 0',
                      color: loading || (!isGoogleUser && !password.trim()) ? '#9ca3af' : '#fff',
                      fontWeight: 700, fontSize: 14,
                      cursor: loading || (!isGoogleUser && !password.trim()) ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 8,
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: 14, height: 14,
                          border: '2px solid rgba(255,255,255,0.4)',
                          borderTop: '2px solid #fff',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }} />
                        Deleting...
                      </>
                    ) : (
                      '🗑 Delete Account'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}