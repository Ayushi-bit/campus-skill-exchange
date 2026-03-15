// ============================================================
//  LOGIN PAGE
//  File: src/components/LoginPage.jsx
//  Uses PHP session auth — submits to XAMPP login_process.php
// ============================================================

import React, { useState } from 'react';

export default function LoginPage({ onNavigateToRegister }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [focused,  setFocused]  = useState(null);

  // Read error from URL if PHP redirected back with ?error=
  const params = new URLSearchParams(window.location.search);
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
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(20px) rotate(-3deg); }
        }
        .login-card {
          animation: fadeUp 0.5s ease both;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.02em;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.45);
        }
        .google-btn {
          width: 100%;
          padding: 13px;
          background: #fff;
          color: #374151;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .google-btn:hover {
          background: #f9fafb;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .orb1 {
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
          top: -100px; left: -100px;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }
        .orb2 {
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
          bottom: -80px; right: -60px;
          animation: floatReverse 10s ease-in-out infinite;
          pointer-events: none;
        }
        .orb3 {
          position: absolute;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
          top: 40%; right: 15%;
          animation: float 12s ease-in-out infinite 2s;
          pointer-events: none;
        }
      `}</style>

      {/* Background orbs */}
      <div className="orb1" />
      <div className="orb2" />
      <div className="orb3" />

      {/* Grid texture overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 40px)',
      }} />

      {/* Card */}
      <div className="login-card" style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 24,
        padding: '40px 40px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 10,
      }}>

        {/* Logo / Brand */}
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
          }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
            Campus Skill Exchange Platform
          </p>
        </div>

        {/* Error message from PHP redirect */}
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

        {/* Login form — posts directly to PHP */}
        <form
          action="http://localhost/backend/auth/login_process.php"
          method="POST"
        >
          <div style={{ marginBottom: 14 }}>
            <label style={{
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: '#6b7280',
              display: 'block', marginBottom: 6,
            }}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={()  => setFocused(null)}
              style={inputStyle('email')}
              required
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: '#6b7280',
              display: 'block', marginBottom: 6,
            }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={()  => setFocused(null)}
              style={inputStyle('password')}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Sign In →
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '20px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: '#f1f0ff' }} />
          <span style={{ fontSize: 12, color: '#c4b5fd', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#f1f0ff' }} />
        </div>

        {/* Google login */}
        <button
          className="google-btn"
          onClick={() => window.location.href = 'http://localhost/backend/oauth/google_login.php'}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        {/* Sign up link */}
        <p style={{
          textAlign: 'center', fontSize: 13, color: '#9ca3af',
          marginTop: 24, marginBottom: 0,
        }}>
          Don't have an account?{' '}
          <button
            onClick={onNavigateToRegister}
            style={{
              background: 'none', border: 'none',
              color: '#6366f1', fontWeight: 700,
              cursor: 'pointer', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              padding: 0,
            }}
          >
            Sign up free
          </button>
        </p>
      </div>
    </div>
  );
}
