// ============================================================
//  APP.JS — Main router with session auth gate
//  File: src/App.js
// ============================================================

import React, { useEffect, useState } from 'react';
import { getSession, logout } from './services/api';

import LoginPage          from './components/LoginPage';
import RegisterPage       from './components/RegisterPage';
import DashboardPage      from './components/DashboardPage';
import ProfilePage        from './components/ProfilePage';
import EditProfilePage    from './components/EditProfilePage';
import BrowseProjectsPage from './components/BrowseProjectsPage';
import PostProjectPage    from './components/PostProjectPage';
import ProjectDetailPage    from './components/ProjectDetailPage';
import ApplicationsPage    from './components/ApplicationsPage';
import MyProjectsPage      from './components/MyProjectsPage';

export default function App() {
  // ── Auth state ──────────────────────────────────────────
  const [authStatus,   setAuthStatus]   = useState('loading'); // 'loading'|'authenticated'|'unauthenticated'
  const [currentUser,  setCurrentUser]  = useState(null);      // { id, name, email, ... }

  // ── Page routing ────────────────────────────────────────
  const [page,      setPage]      = useState('dashboard');
  const [prevPage,  setPrevPage]  = useState('dashboard');
  const [projectId, setProjectId] = useState(null);

  // ── Auth sub-page ────────────────────────────────────────
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'

  // ── Check session on load ────────────────────────────────
  useEffect(() => {
    getSession()
      .then(res => {
        if (res.data.authenticated) {
          setCurrentUser(res.data.user);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('unauthenticated');
        }
      })
      .catch(() => {
        setAuthStatus('unauthenticated');
      });
  }, []);

  // ── Navigation ───────────────────────────────────────────
  const navigate = (dest, id = null) => {
    setPrevPage(page);
    setPage(dest);
    if (id) setProjectId(id);
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
    });
  };

  // ── Loading screen ───────────────────────────────────────
  if (authStatus === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <span style={{ fontSize: 26 }}>✦</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: 'sans-serif' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ────────────────────────────────────
  if (authStatus === 'unauthenticated') {
    if (authPage === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthPage('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthPage('register')} />;
  }

  // ── Authenticated — real userId from session ─────────────
  const userId = currentUser.id;
  const commonProps = { userId, currentUser, onNavigate: navigate, onLogout: handleLogout };

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
      return <ProjectDetailPage {...commonProps} projectId={projectId} onBack={goBack} />;
    case 'applications':
      return <ApplicationsPage {...commonProps} />;
    case 'myprojects':
      return <MyProjectsPage {...commonProps} />;
    default:
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f4fe', flexDirection: 'column', gap: 12, fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: 48 }}>🚧</div>
          <h2 style={{ color: '#1e1b4b', margin: 0 }}>Coming Soon</h2>
          <p style={{ color: '#9ca3af', margin: 0 }}>This page is under construction.</p>
          <button onClick={() => navigate('dashboard')} style={{ marginTop: 8, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>← Back to Dashboard</button>
        </div>
      );
  }
}