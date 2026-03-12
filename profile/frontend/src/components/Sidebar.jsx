// ============================================================
//  SIDEBAR  — Full navigation with active page support
//  File: src/components/Sidebar.jsx
// ============================================================

import React from 'react';

const navItems = [
  { label: 'Dashboard',       icon: '⊞',  page: 'dashboard'    },
  { label: 'Browse Projects', icon: '🔍', page: 'browse'        },
  { label: 'Post Project',    icon: '✦',  page: 'post'          },
  { label: 'My Applications', icon: '📨', page: 'applications'  },
  { label: 'My Projects',     icon: '📁', page: 'myprojects'    },
  { label: 'Profile',         icon: '👤', page: 'profile'       },
  { label: 'Notifications',   icon: '🔔', page: 'notifications' },
];

export default function Sidebar({ open, setOpen, activePage, onNavigate }) {
  return (
    <aside style={{
      width: open ? 220 : 68,
      background: '#fff',
      borderRight: '1px solid #ede9fe',
      padding: '28px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      transition: 'width 0.25s',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 10,
    }}>

      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 6px 20px',
        borderBottom: '1px solid #f1f0ff', marginBottom: 8,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16, fontWeight: 800, flexShrink: 0,
        }}>S</div>
        {open && (
          <span style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800, fontSize: 13,
            color: '#4f46e5', whiteSpace: 'nowrap',
          }}>SkillExchange</span>
        )}
      </div>

      {/* Nav Items */}
      {navItems.map((item) => {
        const isActive = activePage === item.page;
        return (
          <div
            key={item.label}
            className={`nav-item${isActive ? ' active' : ''}`}
            title={item.label}
            onClick={() => onNavigate && onNavigate(item.page)}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            {open && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
          </div>
        );
      })}

      {/* Logout */}
      <div style={{ marginTop: 'auto' }}>
        <div className="nav-item" title="Logout" style={{ color: '#ef4444' }}>
          <span style={{ fontSize: 18 }}>⏻</span>
          {open && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
        </div>

        {/* Collapse toggle */}
        <div
          className="nav-item"
          onClick={() => setOpen(!open)}
          title="Toggle Sidebar"
          style={{ marginTop: 4 }}
        >
          <span style={{ fontSize: 18 }}>{open ? '◀' : '▶'}</span>
          {open && <span>Collapse</span>}
        </div>
      </div>
    </aside>
  );
}
