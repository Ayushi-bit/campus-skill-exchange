import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import StatusBadge from './StatusBadge';
import { SkeletonStats, SkeletonCard } from './LoadingSkeleton';
import { getDashboard } from '../services/api';

function StatCard({ icon, label, value, color = 'var(--orange)' }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--brown)', fontFamily: "'Playfair Display', serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function ActivityItem({ item }) {
  const icons = { application_received: '📩', application_accepted: '✅', application_rejected: '❌', new_application: '📬', new_rating: '⭐', project_completed: '🏁', member_joined: '👥' };
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--surface)', opacity: item.is_read ? 0.7 : 1 }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
        {icons[item.type] || '🔔'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{item.message}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, fontFamily: "'DM Mono', monospace" }}>{item.date}</div>
      </div>
      {!item.is_read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0, marginTop: 4 }} />}
    </div>
  );
}

function MiniCard({ title, sub, badge, status, onClick }) {
  return (
    <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', padding: 16 }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--skin)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brown)', lineHeight: 1.3 }}>{title}</div>
        {status && <StatusBadge status={status} />}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>
      {badge && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>{badge}</div>}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage({ userId, currentUser, onNavigate, onLogout }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getDashboard(userId)
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard. Please refresh.'))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="app-layout">
      <Sidebar currentPage="dashboard" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="main-content page-enter">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: 26 }}>{getGreeting()}, {currentUser?.name?.split(' ')[0]}! 👋</h1>
            <p>Here's what's happening with your projects today.</p>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate('post')}>➕ Post a Project</button>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', marginBottom: 20, background: 'var(--danger-bg)', border: '1px solid rgba(200,64,64,0.3)', borderRadius: 8, color: 'var(--danger)', fontSize: 13 }}>
            {error}
          </div>
        )}

        {loading ? (
          <>
            <SkeletonStats />
            <div className="grid-2">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
          </>
        ) : data && (
          <>
            {/* Profile completion */}
            {data.stats.profile_completion < 100 && (
              <div style={{ padding: '14px 20px', marginBottom: 24, background: 'var(--orange-dim)', border: '1px solid rgba(200,115,58,0.3)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brown)', marginBottom: 6 }}>
                    Profile is {data.stats.profile_completion}% complete
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${data.stats.profile_completion}%`, background: 'linear-gradient(90deg, var(--orange), var(--orange-lt))', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('edit-profile')}>Complete Profile →</button>
              </div>
            )}

            {/* Stats row */}
            <div className="grid-4" style={{ marginBottom: 28 }}>
              <StatCard icon="📁" label="Projects Posted"    value={data.stats.projects_posted}    color="var(--orange)" />
              <StatCard icon="📩" label="Applications Sent"  value={data.stats.applications_sent}  color="#3366cc" />
              <StatCard icon="✅" label="Projects Completed" value={data.stats.projects_completed} color="var(--success)" />
              <StatCard icon="⭐" label="Avg Rating"         value={data.stats.avg_rating > 0 ? data.stats.avg_rating.toFixed(1) : '—'} color="var(--skin)" />
            </div>

            {/* Main 3-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 24 }}>

              {/* Active Projects */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16 }}>Active Projects</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('myprojects')}>View all</button>
                </div>
                {data.active_projects.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>No active projects yet.</p>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => onNavigate('post')}>Post your first project</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.active_projects.map(p => (
                      <MiniCard
                        key={p.id}
                        title={p.title}
                        sub={`${p.domain} · 👥 ${p.member_count}/${p.max_members}`}
                        badge={p.pending_applicants > 0 ? `📩 ${p.pending_applicants} pending applicant(s)` : null}
                        status={p.status}
                        onClick={() => onNavigate('project', p.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* My Applications */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16 }}>My Applications</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('applications')}>View all</button>
                </div>
                {data.my_applications.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>You haven't applied to any projects yet.</p>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => onNavigate('browse')}>Browse Projects</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.my_applications.map(a => (
                      <MiniCard
                        key={a.id}
                        title={a.title}
                        sub={`${a.domain} · ${a.owner_name} · ${a.date}`}
                        status={a.status}
                        onClick={() => onNavigate('project', a.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right sidebar: Activity + Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 14 }}>Recent Activity</h3>
                  <div className="card" style={{ padding: '8px 16px' }}>
                    {data.recent_activity.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>🔕 No activity yet</div>
                    ) : data.recent_activity.map((item, i) => (
                      <ActivityItem key={i} item={item} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 14, marginBottom: 10, color: 'var(--muted)' }}>Quick Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { icon: '🔍', label: 'Browse Projects',  page: 'browse' },
                      { icon: '➕', label: 'Post a Project',    page: 'post' },
                      { icon: '👤', label: 'Edit Profile',      page: 'edit-profile' },
                    ].map(action => (
                      <button key={action.page} onClick={() => onNavigate(action.page)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
                      >
                        <span style={{ fontSize: 16 }}>{action.icon}</span>{action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}