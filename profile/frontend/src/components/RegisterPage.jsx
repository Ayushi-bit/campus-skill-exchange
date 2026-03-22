import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

const BASE = "http://localhost/Campus-Skill-Exchange-Platform/profile/backend";

function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', '#C84040', '#C8973A', '#5A8A5A', '#3A7A5A'];

export default function RegisterPage({ onNavigateToLogin }) {
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const strength = getStrength(password);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) setError(decodeURIComponent(params.get('error')));
  }, []);

  function handleSubmit(e) {
    if (password !== confirm) {
      e.preventDefault();
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      e.preventDefault();
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Left Panel ── */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(145deg, #6B3A1F 0%, #C8733A 50%, #D4A574 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px',
        position: 'relative', overflow: 'hidden',
      }} className="auth-left-panel">

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, background: 'rgba(255,255,255,0.2)',
            borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 32,
            fontFamily: "'Playfair Display', serif", color: '#fff', fontWeight: 700,
            border: '2px solid rgba(255,255,255,0.3)',
          }}>C</div>

          <h1 style={{ color: '#fff', fontSize: 26, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>
            Join the Community
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, maxWidth: 240, margin: '0 auto', lineHeight: 1.7 }}>
            Connect with talented students, collaborate on exciting projects, and grow your skills together.
          </p>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Post your projects',
              'Find collaborators',
              'Build your reputation',
            ].map(text => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.12)',
                padding: '10px 16px', borderRadius: 10,
                color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'left',
              }}>
                <CheckCircle size={15} color="rgba(255,255,255,0.8)" style={{ flexShrink: 0 }} />
                {text}
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .auth-left-panel { display: none !important; }
          }
        `}</style>
      </div>

      {/* ── Right Panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', padding: '40px 24px', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="page-enter">

          <h2 style={{ fontSize: 26, marginBottom: 6, color: 'var(--brown)' }}>Create Account</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>
            Join thousands of students on Campus Skill Exchange
          </p>

          {error && (
            <div style={{
              padding: '10px 14px', marginBottom: 16,
              background: 'rgba(200,64,64,0.07)',
              border: '1px solid rgba(200,64,64,0.25)',
              borderRadius: 8, color: '#C84040', fontSize: 13, fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <form action={`${BASE}/auth/register_process.php`} method="POST" onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input type="text" name="name" className="form-input" style={{ paddingLeft: 36 }}
                  placeholder="Your full name" required autoFocus />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input type="email" name="email" className="form-input" style={{ paddingLeft: 36 }}
                  placeholder="your@email.com" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input type="password" name="password" className="form-input" style={{ paddingLeft: 36 }}
                  placeholder="Create a strong password" required
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2, transition: 'background 0.2s',
                        background: i <= strength ? STRENGTH_COLOR[strength] : 'var(--border)',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: STRENGTH_COLOR[strength], fontWeight: 700 }}>
                    {STRENGTH_LABEL[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input type="password" name="confirm_password" className="form-input" style={{
                  paddingLeft: 36,
                  borderColor: confirm && confirm !== password ? '#C84040' : undefined,
                }}
                  placeholder="Repeat your password" required
                  value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
              {confirm && confirm !== password && (
                <span className="form-error">Passwords don't match</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }} disabled={loading}>
              <ArrowRight size={16} /> {loading ? 'Creating account...' : 'Create Account & Verify Email'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 8, color: 'var(--muted)', fontSize: 11, lineHeight: 1.5 }}>
            After submitting, you'll receive a 6-digit OTP on your email to verify your account.
          </p>

          <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--muted)', fontSize: 13 }}>
            Already have an account?{' '}
            <button onClick={onNavigateToLogin}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--orange)', fontWeight: 700, fontSize: 13 }}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}