// ============================================================
//  CHANGE PASSWORD MODAL
//  File: src/components/ChangePasswordModal.jsx
//  Regular users: current password + new + confirm
//  Google users: new password + confirm only (setting for first time)
// ============================================================

import React, { useState, useEffect } from 'react';
import { changePassword } from '../services/api';

export default function ChangePasswordModal({ userId, isGoogleUser, onClose }) {
  const [form, setForm]       = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    if (!isGoogleUser && !form.current) {
      setError('Current password is required.');
      return;
    }
    if (!form.newPass) {
      setError('New password is required.');
      return;
    }
    if (form.newPass.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (form.newPass !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await changePassword({
        user_id:          userId,
        current_password: form.current,
        new_password:     form.newPass,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const canSubmit = !loading &&
    form.newPass.length >= 6 &&
    form.newPass === form.confirm &&
    (isGoogleUser || form.current.length > 0);

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
            maxWidth: 440,
            margin: '0 16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            animation: 'modalIn 0.2s ease',
          }}
        >
          {/* ── Header ── */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            padding: '28px 32px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6,
            }}>
              {isGoogleUser ? 'Set a Password' : 'Change Password'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
              {isGoogleUser
                ? 'Create a password to also sign in with email'
                : 'Keep your account secure'}
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: '28px 32px 32px' }}>

            {success ? (
              // ── Success ──
              <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 16, fontWeight: 800, color: '#15803d', marginBottom: 6,
                }}>
                  {isGoogleUser ? 'Password Set!' : 'Password Updated!'}
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  {isGoogleUser
                    ? 'You can now sign in with your email and this password.'
                    : 'Your password has been changed successfully.'}
                </div>
              </div>
            ) : (
              <>
                {/* Google user notice */}
                {isGoogleUser && (
                  <div style={{
                    background: '#f5f4fe', border: '1px solid #e0dcff',
                    borderRadius: 10, padding: '12px 16px',
                    fontSize: 13, color: '#4f46e5', marginBottom: 20, lineHeight: 1.5,
                  }}>
                    💡 You signed in with Google. Setting a password lets you also log in with your email address.
                  </div>
                )}

                {/* Current Password — only for regular users */}
                {!isGoogleUser && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Current Password</label>
                    <input
                      type="password"
                      name="current"
                      value={form.current}
                      onChange={handleChange}
                      placeholder="Enter current password"
                      autoFocus
                      style={inputStyle(false)}
                    />
                  </div>
                )}

                {/* New Password */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>New Password</label>
                  <input
                    type="password"
                    name="newPass"
                    value={form.newPass}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    autoFocus={isGoogleUser}
                    style={inputStyle(false)}
                  />
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: error ? 8 : 24 }}>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="Repeat new password"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    style={inputStyle(!!form.confirm && form.newPass !== form.confirm)}
                  />
                  {form.confirm && form.newPass !== form.confirm && (
                    <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                      Passwords do not match
                    </div>
                  )}
                </div>

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
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    style={{
                      flex: 1,
                      background: canSubmit
                        ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                        : '#f3f4f6',
                      border: 'none', borderRadius: 12, padding: '11px 0',
                      color: canSubmit ? '#fff' : '#9ca3af',
                      fontWeight: 700, fontSize: 14,
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
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
                        Saving...
                      </>
                    ) : (
                      isGoogleUser ? '🔒 Set Password' : '🔒 Update Password'
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

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#4b5563', marginBottom: 6,
};

const inputStyle = (hasError) => ({
  width: '100%', boxSizing: 'border-box',
  border: `1.5px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
  borderRadius: 10, padding: '10px 14px',
  fontSize: 14, color: '#1e1b4b',
  outline: 'none', fontFamily: 'inherit',
  background: '#fafafa', transition: 'border-color 0.2s',
});
