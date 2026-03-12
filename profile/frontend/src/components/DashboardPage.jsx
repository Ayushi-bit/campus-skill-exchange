// ============================================================
//  DASHBOARD PAGE  — Activity & Control Center
//  File: src/components/DashboardPage.jsx
// ============================================================

import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import Sidebar from './Sidebar';

const USER_ID = 2;

const activityIcon = {
  application_received : '📨',
  application_accepted : '✅',
  application_rejected : '❌',
  new_rating           : '⭐',
  project_completed    : '🏆',
  default              : '🔔',
};

const statusColors = {
  'Open':        { bg: '#e8f5e9', color: '#2e7d32' },
  'In progress': { bg: '#fff8e1', color: '#f57f17' },
  'In Progress': { bg: '#fff8e1', color: '#f57f17' },
  'Completed':   { bg: '#e3f2fd', color: '#1565c0' },
  'Pending':     { bg: '#fff8e1', color: '#f57f17' },
  'Accepted':    { bg: '#e8f5e9', color: '#2e7d32' },
  'Rejected':    { bg: '#fef2f2', color: '#dc2626' },
};

export default function DashboardPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    getDashboard(USER_ID)
      .then(res => setData(res.data))
      .catch(() => setError('Could not load dashboard. Make sure your backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="dashboard" onNavigate={onNavigate} />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid #ede9fe',
            borderTop: '4px solid #6366f1', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </main>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="dashboard" onNavigate={onNavigate} />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 16, padding: '32px 40px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>
        </div>
      </main>
    </div>
  );

  const { user, stats, active_projects, my_applications, recent_activity } = data;
  const firstName    = user.name.split(' ')[0];
  const pendingCount = my_applications.filter(a => a.status === 'Pending').length;
  const unreadCount  = recent_activity.filter(a => !a.is_read).length;

  // Dynamic summary line
  const parts = [];
  if (active_projects.length > 0)
    parts.push(`${active_projects.length} active project${active_projects.length !== 1 ? 's' : ''}`);
  if (pendingCount > 0)
    parts.push(`${pendingCount} pending application${pendingCount !== 1 ? 's' : ''}`);
  const summaryLine = parts.length > 0
    ? `You have ${parts.join(' and ')} today.`
    : 'Ready to start collaborating?';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f4fe' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="dashboard" onNavigate={onNavigate} />

      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', maxWidth: 960 }}>

        {/* ══════════════════════════════════════════════
            1. WELCOME BANNER
            Dark indigo — compact, action-oriented.
            No avatar, no email — just greeting + summary
            + action buttons. Feels like a control panel.
            ══════════════════════════════════════════════ */}
        <div className="fade-up" style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          borderRadius: 20, padding: '24px 32px', color: '#fff',
          marginBottom: 24, position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(30,27,75,0.2)',
        }}>
          {/* Hatched texture — distinct from profile's circles */}
          <div style={{
            position: 'absolute', right: -20, top: 0, bottom: 0,
            width: 260, opacity: 0.06, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
            backgroundSize: '12px 12px',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
            }}>
              <div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 20, fontWeight: 800, marginBottom: 4,
                }}>
                  Welcome back, {firstName} 👋
                </div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>{summaryLine}</div>
              </div>

              {/* Profile completion pill — only if incomplete */}
              {stats.profile_completion < 100 && (
                <button
                  onClick={() => onNavigate && onNavigate('profile')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 12, padding: '8px 16px',
                    cursor: 'pointer', color: '#fff',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: 70, height: 5,
                    background: 'rgba(255,255,255,0.2)', borderRadius: 10,
                  }}>
                    <div style={{
                      width: `${stats.profile_completion}%`, height: '100%',
                      background: '#a5b4fc', borderRadius: 10,
                    }} />
                  </div>
                  <span style={{ fontSize: 12, opacity: 0.85, whiteSpace: 'nowrap' }}>
                    Profile {stats.profile_completion}% →
                  </span>
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <WelcomeBtn icon="✦" label="Post Project"    onClick={() => onNavigate && onNavigate('post')} />
              <WelcomeBtn icon="🔍" label="Browse Projects" onClick={() => onNavigate && onNavigate('browse')} transparent />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            2. QUICK STATS — activity metrics ONLY
            No avg_rating here — that lives on Profile.
            4th card = unread notifications (activity).
            ══════════════════════════════════════════════ */}
        <div className="fade-up" style={{
          display: 'flex', gap: 14, marginBottom: 24, animationDelay: '0.05s',
        }}>
          {[
            { icon: '📁', label: 'Projects Posted',   value: stats.projects_posted,    color: '#6366f1' },
            { icon: '📨', label: 'Applications Sent', value: stats.applications_sent,  color: '#d97706' },
            { icon: '✅', label: 'Completed',          value: stats.projects_completed, color: '#059669' },
            { icon: '🔔', label: 'Unread',             value: unreadCount,              color: '#7c3aed' },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 28, fontWeight: 800, color: stat.color,
              }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            SPLIT LAYOUT — Primary (left) + Secondary (right)
            Left  → main work area: projects + applications
            Right → context panel:  activity + quick actions
            Pattern used by GitHub, Linear, Notion dashboards
            ══════════════════════════════════════════════ */}
        <div className="fade-up" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',   /* left wider, right fixed */
          gap: 20,
          alignItems: 'start',                /* columns don't stretch to equal height */
          animationDelay: '0.1s',
        }}>

          {/* ── PRIMARY PANEL (left) — work area ─────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Active Projects */}
            <div className="card">
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16,
              }}>
                <div className="section-title" style={{ margin: 0 }}>My Active Projects</div>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
                  {active_projects.length} active
                </span>
              </div>

              {active_projects.length === 0
                ? <EmptyState icon="📂" text="No active projects" sub="Post a project to get started" />
                : active_projects.map((p, i) => {
                    const sc = statusColors[p.status] || { bg: '#f3f4f6', color: '#6b7280' };
                    return (
                      <div key={i} className="project-card" style={{
                        background: '#fafafe', borderRadius: 14,
                        padding: '14px 16px',
                        marginBottom: i < active_projects.length - 1 ? 10 : 0,
                        border: '1px solid #f1f0ff',
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'flex-start', marginBottom: 6,
                        }}>
                          <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: 14 }}>
                            {p.title}
                          </span>
                          <span style={{
                            background: sc.bg, color: sc.color,
                            borderRadius: 20, padding: '3px 10px',
                            fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                          }}>{p.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                          📂 {p.domain}
                        </div>
                        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#9ca3af' }}>
                          <span>👥 {p.member_count}/{p.max_members} members</span>
                          {p.pending_applicants > 0 && (
                            <span style={{ color: '#d97706', fontWeight: 600 }}>
                              📨 {p.pending_applicants} pending
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
              }
            </div>

            {/* My Applications */}
            <div className="card">
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16,
              }}>
                <div className="section-title" style={{ margin: 0 }}>My Applications</div>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
                  {my_applications.length} total
                </span>
              </div>

              {my_applications.length === 0
                ? <EmptyState icon="📋" text="No applications yet" sub="Browse projects and apply" />
                : my_applications.map((a, i) => {
                    const sc = statusColors[a.status] || { bg: '#f3f4f6', color: '#6b7280' };
                    return (
                      <div key={i} style={{
                        background: '#fafafe', borderRadius: 14,
                        padding: '14px 16px',
                        marginBottom: i < my_applications.length - 1 ? 10 : 0,
                        border: '1px solid #f1f0ff',
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'flex-start', marginBottom: 6,
                        }}>
                          <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: 14 }}>
                            {a.title}
                          </span>
                          <span style={{
                            background: sc.bg, color: sc.color,
                            borderRadius: 20, padding: '3px 10px',
                            fontSize: 11, fontWeight: 600,
                          }}>{a.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                          📂 {a.domain}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                          by {a.owner_name} · {a.date}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* ── SECONDARY PANEL (right) — context area ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Recent Activity */}
            <div className="card">
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16,
              }}>
                <div className="section-title" style={{ margin: 0 }}>Recent Activity</div>
                {unreadCount > 0 && (
                  <span style={{
                    background: '#eef2ff', color: '#6366f1',
                    borderRadius: 20, padding: '3px 10px',
                    fontSize: 11, fontWeight: 600,
                  }}>
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {recent_activity.length === 0
                ? <EmptyState icon="🔔" text="No recent activity" sub="Notifications appear here" />
                : recent_activity.map((act, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '10px 12px', borderRadius: 12,
                      marginBottom: i < recent_activity.length - 1 ? 6 : 0,
                      background: act.is_read ? '#fafafe' : '#f5f4fe',
                      border: `1px solid ${act.is_read ? '#f1f0ff' : '#e0dcff'}`,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 14, flexShrink: 0,
                      }}>
                        {activityIcon[act.type] || activityIcon.default}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 12, color: '#1e1b4b', margin: 0,
                          fontWeight: act.is_read ? 400 : 600,
                          lineHeight: 1.5,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{act.message}</p>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{act.date}</span>
                      </div>
                      {!act.is_read && (
                        <div style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: '#6366f1', flexShrink: 0, marginTop: 5,
                        }} />
                      )}
                    </div>
                  ))
              }
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="section-title">Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: '✦',  label: 'Post New Project',   page: 'post',          bg: '#eef2ff', color: '#6366f1' },
                  { icon: '🔍', label: 'Browse Projects',    page: 'browse',        bg: '#ecfdf5', color: '#059669' },
                  { icon: '👤', label: 'Update Profile',     page: 'profile',       bg: '#f5f3ff', color: '#7c3aed' },
                  { icon: '🔔', label: 'View Notifications', page: 'notifications', bg: '#fffbeb', color: '#d97706' },
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={() => onNavigate && onNavigate(action.page)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: action.bg, border: 'none', borderRadius: 12,
                      padding: '11px 16px', cursor: 'pointer',
                      color: action.color, fontWeight: 600, fontSize: 13,
                      fontFamily: 'inherit', width: '100%', textAlign: 'left',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateX(3px)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{action.icon}</span>
                    {action.label}
                    <span style={{ marginLeft: 'auto', opacity: 0.4, fontSize: 12 }}>→</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
          {/* ── end split layout ── */}

        </div>

      </main>
    </div>
  );
}

// ── Welcome banner action button ──────────────────────────
function WelcomeBtn({ icon, label, onClick, transparent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: hovered
          ? 'rgba(255,255,255,0.25)'
          : transparent ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)',
        border: '1px solid rgba(255,255,255,0.25)',
        color: '#fff', borderRadius: 10,
        padding: '8px 18px', cursor: 'pointer',
        fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
        transition: 'background 0.15s',
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────
function EmptyState({ icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ fontSize: 30, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 600, color: '#4b5563', fontSize: 14 }}>{text}</div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>
    </div>
  );
}