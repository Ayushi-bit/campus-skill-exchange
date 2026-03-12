// ============================================================
//  APP.JS — Page router
//  File: src/App.js
// ============================================================

import React, { useState } from 'react';
import DashboardPage      from './components/DashboardPage';
import ProfilePage        from './components/ProfilePage';
import ProjectDetailPage  from './components/ProjectDetailPage';
import BrowseProjectsPage from './components/BrowseProjectsPage';
import PostProjectPage    from './components/PostProjectPage';

export default function App() {
  const [page,      setPage]      = useState('dashboard');
  const [projectId, setProjectId] = useState(null);
  // Track where the user came from so Back works correctly
  const [prevPage,  setPrevPage]  = useState('dashboard');

  const navigate = (dest, id = null) => {
    if (dest === 'project' && id) {
      setPrevPage(page);      // remember where we came from
      setProjectId(id);
      setPage('project');
      return;
    }
    setPage(dest);
  };

  const goBack = () => {
    setPage(prevPage);
    setProjectId(null);
  };

  if (page === 'dashboard') return <DashboardPage      onNavigate={navigate} />;
  if (page === 'profile')   return <ProfilePage         onNavigate={navigate} />;
  if (page === 'browse')    return <BrowseProjectsPage  onNavigate={navigate} />;
  if (page === 'post')      return <PostProjectPage     onNavigate={navigate} />;
  if (page === 'project')   return (
    <ProjectDetailPage
      projectId={projectId}
      onNavigate={navigate}
      onBack={goBack}
    />
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: 12,
      color: '#6b7280', fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ fontSize: 40 }}>🚧</div>
      <p style={{ fontWeight: 600 }}>"{page}" page coming soon</p>
      <button
        onClick={() => setPage('dashboard')}
        style={{
          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
          color: '#fff', border: 'none', borderRadius: 10,
          padding: '10px 24px', cursor: 'pointer', fontWeight: 600,
        }}
      >← Back to Dashboard</button>
    </div>
  );
}
