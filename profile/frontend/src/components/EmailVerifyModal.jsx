// ============================================================
//  EMAIL VERIFY MODAL
//  File: src/components/EmailVerifyModal.jsx
//  Shown when user changes their email in Edit Profile
//  User enters OTP sent to new email to confirm change
// ============================================================

import React, { useState, useEffect } from 'react';

export default function EmailVerifyModal({ newEmail, onVerify, onClose, loading, error }) {
  const [otp, setOtp] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
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
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 420,
            margin: '0 16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            animation: 'modalIn 0.2s ease',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            padding: '28px 32px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📧</div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6,
            }}>
              Verify New Email
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
              We sent a 6-digit OTP to<br />
              <strong>{newEmail}</strong>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '28px 32px 32px' }}>

            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
              Enter the OTP below to confirm your new email address. It expires in <strong>10 minutes</strong>.
            </div>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && !loading && onVerify(otp)}
              placeholder="000000"
              maxLength={6}
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                border: `1.5px solid ${error ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: 10, padding: '12px 14px',
                fontSize: 24, color: '#1e1b4b',
                outline: 'none', fontFamily: 'inherit',
                background: '#fafafa', marginBottom: error ? 8 : 20,
                textAlign: 'center', letterSpacing: 12,
                transition: 'border-color 0.2s',
              }}
            />

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, padding: '10px 14px',
                color: '#dc2626', fontSize: 13, marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onClose}
                disabled={loading}
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
                onClick={() => onVerify(otp)}
                disabled={loading || otp.length !== 6}
                style={{
                  flex: 1,
                  background: loading || otp.length !== 6
                    ? '#f3f4f6'
                    : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                  border: 'none', borderRadius: 12, padding: '11px 0',
                  color: loading || otp.length !== 6 ? '#9ca3af' : '#fff',
                  fontWeight: 700, fontSize: 14,
                  cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
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
                    Verifying...
                  </>
                ) : (
                  '✓ Verify & Save'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}