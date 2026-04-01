import React from 'react';
import Avatar from './Avatar';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
  { id: 'dashboard',    icon: '🏠', label: 'Dashboard' },
  { id: 'profile',      icon: '👤', label: 'My Profile' },
  { id: 'browse',       icon: '🔍', label: 'Browse Projects' },
  { id: 'post',         icon: '➕', label: 'Post Project' },
  { id: 'myprojects',   icon: '📋', label: 'My Projects' },
  { id: 'applications', icon: '📩', label: 'Applications' },
];

export default function Sidebar({ currentPage, currentUser, onNavigate, onLogout }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        width: 'var(--sidebar-w)',
        height: '100vh',
        position: 'fixed',
        top: 0, left: 0,
        background: 'var(--white)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: '2px 0 12px rgba(107,58,31,0.06)',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--orange), var(--skin))',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16, fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              flexShrink: 0,
            }}>C</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--brown)', fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
                Campus Skill
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>
                Exchange
              </div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Avatar
            name={currentUser?.name || ''}
            image={currentUser?.profile_image || ''}
            size={36}
          />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brown)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.name || 'User'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>
              {currentUser?.primary_domain || 'Student'}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: isActive ? 'rgba(200,115,58,0.1)' : 'transparent',
                  color: isActive ? 'var(--orange)' : 'var(--muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  borderLeft: isActive ? '3px solid var(--orange)' : '3px solid transparent',
                  marginBottom: 2,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}

          {/* Notifications */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 12px',
            borderLeft: '3px solid transparent',
          }}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center', color: 'var(--muted)' }}>🔔</span>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Notifications</span>
            <div style={{ marginLeft: 'auto' }}>
              <NotificationBell />
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              borderRadius: 8, border: 'none',
              background: 'transparent',
              color: 'var(--danger)',
              fontWeight: 600, fontSize: 13,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 16 }}>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--white)',
        borderTop: '1px solid var(--border)',
        padding: '8px 4px',
        zIndex: 100,
        justifyContent: 'space-around',
      }} className="mobile-nav">
        {NAV_ITEMS.slice(0, 5).map(item => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '4px 8px',
                color: isActive ? 'var(--orange)' : 'var(--muted)',
                fontSize: 10, fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label.split(' ')[0]}
            </button>
          );
        })}
      </nav>
    </>
  );
}