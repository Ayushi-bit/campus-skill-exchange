// ============================================================
//  APP.JS — Simple page router (Dashboard ↔ Profile)
//  File: src/App.js
//  Replace with React Router later when more pages are added
// ============================================================

import React, { useState } from 'react';
import DashboardPage from './components/DashboardPage';
import ProfilePage   from './components/ProfilePage';

export default function App() {
  const [page, setPage] = useState('dashboard');

  const navigate = (dest) => {
    if (dest === 'dashboard') setPage('dashboard');
    if (dest === 'profile')   setPage('profile');
    // Other pages (browse, post, etc.) will be added later
  };

  if (page === 'profile')   return <ProfilePage   onNavigate={navigate} />;
  if (page === 'dashboard') return <DashboardPage onNavigate={navigate} />;

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
