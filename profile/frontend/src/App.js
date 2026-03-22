import React, { useEffect, useState } from 'react';
import { getSession, logout } from './services/api';
import { ToastProvider } from './components/Toast';

import LoginPage          from './components/LoginPage';
import RegisterPage       from './components/RegisterPage';
import DashboardPage      from './components/DashboardPage';
import ProfilePage        from './components/ProfilePage';
import EditProfilePage    from './components/EditProfilePage';
import BrowseProjectsPage from './components/BrowseProjectsPage';
import PostProjectPage    from './components/PostProjectPage';
import ProjectDetailPage  from './components/ProjectDetailPage';
import ApplicationsPage   from './components/ApplicationsPage';
import MyProjectsPage     from './components/MyProjectsPage';

export default function App() {
  // ── Auth state ──────────────────────────────────────────
  const [authStatus,  setAuthStatus]  = useState('loading');
  const [currentUser, setCurrentUser] = useState(null);

  // ── Page routing ─────────────────────────────────────────
  const [page,      setPage]      = useState('dashboard');
  const [prevPage,  setPrevPage]  = useState('dashboard');
  const [projectId, setProjectId] = useState(null);

  // ── Auth sub-page ────────────────────────────────────────
  const [authPage, setAuthPage] = useState('login');

  // ── Check session on load ────────────────────────────────
  useEffect(() => {
    // Check for error in URL (from PHP redirects)
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      // Error will be read by LoginPage directly from URL
    }

    getSession()
      .then(res => {
        if (res.data.authenticated) {
          setCurrentUser(res.data.user);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('unauthenticated');
        }
      })
      .catch(() => setAuthStatus('unauthenticated'));
  }, []);

  // ── Navigation ───────────────────────────────────────────
  const navigate = (dest, id = null) => {
    setPrevPage(page);
    setPage(dest);
    if (id !== null) setProjectId(id);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setPage(prevPage);
    window.scrollTo(0, 0);
  };

  // ── Logout ───────────────────────────────────────────────
  const handleLogout = () => {
    logout().finally(() => {
      setCurrentUser(null);
      setAuthStatus('unauthenticated');
      setAuthPage('login');
      setPage('dashboard');
    });
  };

  // ── Loading screen ───────────────────────────────────────
  if (authStatus === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
        fontFamily: "'Nunito', sans-serif",
      }}>
        <div style={{
          width: 56, height: 56,
          background: 'linear-gradient(135deg, var(--orange), var(--skin))',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
          fontFamily: "'Playfair Display', serif",
          color: '#fff', fontWeight: 700,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>C</div>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading Campus Skill Exchange...</p>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.85; }
          }
        `}</style>
      </div>
    );
  }

  // ── Not authenticated ────────────────────────────────────
  if (authStatus === 'unauthenticated') {
    if (authPage === 'register') {
      return (
        <ToastProvider>
          <RegisterPage onNavigateToLogin={() => setAuthPage('login')} />
        </ToastProvider>
      );
    }
    return (
      <ToastProvider>
        <LoginPage onNavigateToRegister={() => setAuthPage('register')} />
      </ToastProvider>
    );
  }

  // ── Authenticated ────────────────────────────────────────
  const userId     = currentUser.id;
  const commonProps = { userId, currentUser, onNavigate: navigate, onLogout: handleLogout };

  return (
    <ToastProvider>
      {(() => {
        switch (page) {
          case 'dashboard':
            return <DashboardPage {...commonProps} />;

          case 'profile':
            return <ProfilePage {...commonProps} />;

          case 'edit-profile':
            return <EditProfilePage {...commonProps} onBack={goBack} />;

          case 'browse':
            return <BrowseProjectsPage {...commonProps} />;

          case 'post':
            return <PostProjectPage {...commonProps} />;

          case 'project':
            return (
              <ProjectDetailPage
                {...commonProps}
                projectId={projectId}
                onBack={goBack}
              />
            );

          case 'applications':
            return <ApplicationsPage {...commonProps} />;

          case 'myprojects':
            return <MyProjectsPage {...commonProps} />;

          default:
            return (
              <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg)',
                flexDirection: 'column', gap: 12,
                fontFamily: "'Nunito', sans-serif",
              }}>
                <div style={{ fontSize: 48 }}>🚧</div>
                <h2 style={{ color: 'var(--brown)', fontFamily: "'Playfair Display', serif" }}>Coming Soon</h2>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>This page is under construction.</p>
                <button
                  onClick={() => navigate('dashboard')}
                  className="btn btn-primary"
                >
                  ← Back to Dashboard
                </button>
              </div>
            );
        }
      })()}
    </ToastProvider>
  );
}