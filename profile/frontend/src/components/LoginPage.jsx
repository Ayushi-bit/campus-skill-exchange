import React, { useEffect, useState } from 'react';

const BASE = "http://localhost/Campus-Skill-Exchange-Platform/profile/backend";
const FLOATING_SKILLS = ['React', 'Python', 'UI/UX', 'Figma', 'Node.js', 'MySQL', 'Design', 'PHP', 'Machine Learning', 'Flutter'];

export default function LoginPage({ onNavigateToRegister }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) setError(decodeURIComponent(params.get('error')));
  }, []);

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Left Panel */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(145deg, #C8733A 0%, #D4A574 50%, #6B3A1F 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Floating skill tags */}
        {FLOATING_SKILLS.map((skill, i) => (
          <div key={skill} style={{
            position: 'absolute',
            top: `${10 + (i * 8.5) % 80}%`,
            left: `${5 + (i * 13) % 85}%`,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            opacity: 0.7,
            animation: `float ${3 + (i % 3)}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.4}s`,
          }}>
            {skill}
          </div>
        ))}

        {/* Brand */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 32, fontFamily: "'Playfair Display', serif",
            color: '#fff', fontWeight: 700,
            border: '2px solid rgba(255,255,255,0.3)',
          }}>C</div>
          <h1 style={{ color: '#fff', fontSize: 28, fontFamily: "'Playfair Display', serif", marginBottom: 10 }}>
            Campus Skill Exchange
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, maxWidth: 260, margin: '0 auto' }}>
            Where Campus Skills Meet Opportunity
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center' }}>
            {['🎓 Learn', '🤝 Collaborate', '⭐ Grow'].map(tag => (
              <span key={tag} style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff', padding: '6px 14px',
                borderRadius: 20, fontSize: 12, fontWeight: 600,
              }}>{tag}</span>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes float {
            from { transform: translateY(0px) rotate(-2deg); }
            to   { transform: translateY(-12px) rotate(2deg); }
          }
        `}</style>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', padding: '40px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="page-enter">
          <h2 style={{ fontSize: 26, marginBottom: 6, color: 'var(--brown)' }}>
            Welcome back 👋
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: 14 }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div style={{
              padding: '10px 14px', marginBottom: 16,
              background: 'var(--danger-bg)',
              border: '1px solid rgba(200,64,64,0.3)',
              borderRadius: 8, color: 'var(--danger)',
              fontSize: 13,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Login Form — POSTs directly to PHP */}
          <form
            action={`${BASE}/auth/login_process.php`}
            method="POST"
            onSubmit={() => setLoading(true)}
          >
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 8 }}
              disabled={loading}
            >
              {loading ? '⏳ Signing in...' : '🔑 Sign In'}
            </button>
          </form>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0',
            color: 'var(--muted)', fontSize: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            OR
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Google OAuth */}
          <a
            href={`${BASE}/oauth/google_login.php`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '11px 20px',
              background: 'var(--white)',
              border: '1.5px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)', fontWeight: 600, fontSize: 14,
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--skin)'; e.currentTarget.style.background = 'var(--surface)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--white)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--muted)', fontSize: 13 }}>
            Don't have an account?{' '}
            <button
              onClick={onNavigateToRegister}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--orange)', fontWeight: 700, fontSize: 13 }}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
