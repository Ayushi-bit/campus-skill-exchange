// ============================================================
//  REGISTER PAGE
//  File: src/components/RegisterPage.jsx
//  Posts to PHP register_process.php which handles OTP email
//  After OTP → verify_otp.php → back to React
// ============================================================

import React, { useState } from 'react';

export default function RegisterPage({ onNavigateToLogin }) {
  const [focused, setFocused] = useState(null);
  const [step,    setStep]    = useState('register'); // 'register' | 'otp'

  const params   = new URLSearchParams(window.location.search);
  const urlError = params.get('error');

  const inputStyle = (field) => ({
    width: '100%',
    padding: '13px 16px',
    border: `1.5px solid ${focused === field ? '#6366f1' : '#e5e7eb'}`,
    borderRadius: 12,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    color: '#1e1b4b',
    background: focused === field ? '#fafafe' : '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-18px); }
        }
        .reg-card { animation: fadeUp 0.5s ease both; }
        .submit-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: #fff; border: none; border-radius: 12px;
          font-size: 15px; font-weight: 700;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.45);
        }
        .orb1 {
          position: absolute; width: 350px; height: 350px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
          top: -80px; right: -80px;
          animation: float 9s ease-in-out infinite;
          pointer-events: none;
        }
        .orb2 {
          position: absolute; width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
          bottom: -60px; left: -60px;
          animation: float 11s ease-in-out infinite 1s;
          pointer-events: none;
        }
      `}</style>

      <div className="orb1" />
      <div className="orb2" />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 40px)',
      }} />

      <div className="reg-card" style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 24,
        padding: '40px 40px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 10,
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <span style={{ fontSize: 24 }}>✦</span>
          </div>
          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 22, fontWeight: 800,
            color: '#1e1b4b', margin: '0 0 4px',
          }}>Create account</h1>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
            Join the Campus Skill Exchange
          </p>
        </div>

        {/* Error from PHP */}
        {urlError && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 13, color: '#dc2626', fontWeight: 500,
            marginBottom: 16,
          }}>
            ⚠ {decodeURIComponent(urlError.replace(/\+/g, ' '))}
          </div>
        )}

        {/* Progress steps */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          marginBottom: 24,
        }}>
          {['Your Info', 'Verify Email'].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i === 0 ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : (step === 'otp' ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#e5e7eb'),
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  margin: '0 auto 4px',
                  transition: 'background 0.3s',
                }}>{i + 1}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{label}</div>
              </div>
              {i < 1 && (
                <div style={{
                  height: 2, width: 40, flexShrink: 0,
                  background: step === 'otp' ? 'linear-gradient(90deg,#6366f1,#7c3aed)' : '#e5e7eb',
                  transition: 'background 0.3s',
                  marginBottom: 20,
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Registration form → posts to PHP */}
        <form
          action="http://localhost/backend/auth/register_process.php"
          method="POST"
        >
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', display: 'block', marginBottom: 6 }}>
              Full Name
            </label>
            <input
              type="text" name="name" placeholder="Aryan Sharma"
              onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
              style={inputStyle('name')} required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', display: 'block', marginBottom: 6 }}>
              College Email
            </label>
            <input
              type="email" name="email" placeholder="you@college.edu"
              onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
              style={inputStyle('email')} required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" name="password" placeholder="Min. 8 characters"
              onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
              style={inputStyle('password')} required
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', display: 'block', marginBottom: 6 }}>
              Confirm Password
            </label>
            <input
              type="password" name="confirm_password" placeholder="••••••••"
              onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
              style={inputStyle('confirm')} required
            />
          </div>

          <button type="submit" className="submit-btn">
            Send OTP & Continue →
          </button>
        </form>

        {/* Info note about OTP */}
        <div style={{
          marginTop: 16, padding: '10px 14px',
          background: '#f5f3ff', borderRadius: 10,
          border: '1px solid #ede9fe',
          fontSize: 12, color: '#7c3aed',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span>📧</span>
          <span>We'll send a 6-digit OTP to your email to verify your account.</span>
        </div>

        {/* Login link */}
        <p style={{
          textAlign: 'center', fontSize: 13, color: '#9ca3af',
          marginTop: 20, marginBottom: 0,
        }}>
          Already have an account?{' '}
          <button
            onClick={onNavigateToLogin}
            style={{
              background: 'none', border: 'none',
              color: '#6366f1', fontWeight: 700,
              cursor: 'pointer', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", padding: 0,
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
