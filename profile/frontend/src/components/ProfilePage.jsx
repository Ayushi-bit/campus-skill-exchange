
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Avatar from './Avatar';
import StarRating from './StarRating';
import StatusBadge from './StatusBadge';
import SkillTag from './SkillTag';
import { SkeletonBox } from './LoadingSkeleton';
import { getProfile } from '../services/api';

function SocialLink({ href, icon, label }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 20,
      background: 'var(--surface)', border: '1px solid var(--border)',
      color: 'var(--brown)', fontSize: 12, fontWeight: 600,
      textDecoration: 'none', transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--brown)'; }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>{label}
    </a>
  );
}

function ProjectMiniCard({ project, onNavigate }) {
  return (
    <div className="card" style={{ padding: 16, cursor: 'pointer', transition: 'all 0.2s' }}
      onClick={() => onNavigate('project', project.id)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--skin)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brown)', flex: 1, marginRight: 8, lineHeight: 1.3 }}>{project.title}</div>
        <StatusBadge status={project.status} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        {project.domain} · {project.date}
        {project.role && <span style={{ marginLeft: 8, color: 'var(--orange)', fontWeight: 600 }}>· {project.role}</span>}
      </div>
      {project.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {project.skills.slice(0, 3).map(s => <SkillTag key={s} name={s} small />)}
          {project.skills.length > 3 && (
            <span style={{ fontSize: 11, color: 'var(--muted)', padding: '2px 6px', alignSelf: 'center' }}>
              +{project.skills.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--orange), var(--skin))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
          }}>
            {review.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brown)' }}>{review.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>{review.date}</div>
          </div>
        </div>
        <StarRating value={review.rating} readOnly size={14} />
      </div>
      {review.text && (
        <p style={{
          fontSize: 13, color: 'var(--text)', lineHeight: 1.6,
          fontStyle: 'italic', margin: 0,
          padding: '10px 14px',
          background: 'var(--surface)',
          borderRadius: 8,
          borderLeft: '3px solid var(--skin)',
        }}>
          "{review.text}"
        </p>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card" style={{
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', gap: 14,
      minWidth: 140,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--orange-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: 24, fontWeight: 800, color: 'var(--brown)',
          fontFamily: "'Playfair Display', serif", lineHeight: 1,
        }}>
          {value}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

const TABS = ['Posted', 'Applied', 'Completed'];

export default function ProfilePage({ userId, currentUser, onNavigate, onLogout }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('Posted');

  useEffect(() => {
    getProfile(userId)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const user        = data?.user;
  const projects    = data?.projects || { posted: [], applied: [], completed: [] };
  const tabProjects = projects[tab.toLowerCase()] || [];

  return (
    <div className="app-layout">
      <Sidebar currentPage="profile" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="main-content page-enter" style={{ padding: 0, background: 'var(--bg)' }}>

        {loading ? (
          <div style={{ padding: 32 }}>
            <SkeletonBox height={160} radius={0} />
            <div style={{ padding: '20px 32px' }}>
              <SkeletonBox width={96} height={96} radius={48} style={{ marginTop: -48 }} />
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <SkeletonBox width="30%" height={28} />
                <SkeletonBox width="50%" height={14} />
                <SkeletonBox width="80%" height={14} />
              </div>
            </div>
          </div>
        ) : user ? (
          <>
            {/* ── Cover Banner ── */}
            <div style={{
              height: 160,
              background: 'linear-gradient(135deg, #C8733A 0%, #D4A574 45%, #8B4513 100%)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(255,255,255,0.12) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)',
              }} />
            </div>

            {/* ── Profile Content ── */}
            <div style={{ padding: '0 32px 48px', background: 'var(--bg)' }}>

              {/* Avatar + Edit button */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-end', marginBottom: 20,
              }}>
                <div style={{ marginTop: -52, position: 'relative', zIndex: 2 }}>
                  <Avatar
                    name={user.name}
                    image={user.profile_image}
                    size={100}
                    style={{
                      border: '4px solid var(--bg)',
                      boxShadow: '0 4px 16px rgba(107,58,31,0.2)',
                    }}
                  />
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => onNavigate('edit-profile')}
                  style={{ marginBottom: 4 }}
                >
                  ✏️ Edit Profile
                </button>
              </div>

              {/* Name + level + domain */}
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 10, flexWrap: 'wrap', marginBottom: 8,
                }}>
                  <h1 style={{ fontSize: 26, margin: 0, color: 'var(--brown)' }}>
                    {user.name}
                  </h1>
                  <StatusBadge status={user.level || 'Beginner'} />
                  <span style={{
                    padding: '3px 12px', borderRadius: 20,
                    background: 'var(--orange-dim)', color: 'var(--orange)',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {user.domain || 'Student'}
                  </span>
                </div>
                <StarRating value={user.rating || 0} readOnly size={16} />
              </div>

              {/* Bio */}
              {user.bio ? (
                <p style={{
                  fontSize: 14, color: 'var(--text)', lineHeight: 1.8,
                  maxWidth: 640, marginBottom: 20,
                  padding: '12px 16px',
                  background: 'var(--white)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}>
                  {user.bio}
                </p>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, fontStyle: 'italic' }}>
                  No bio yet.{' '}
                  <span
                    onClick={() => onNavigate('edit-profile')}
                    style={{ color: 'var(--orange)', cursor: 'pointer', fontStyle: 'normal', fontWeight: 600 }}
                  >
                    Add one →
                  </span>
                </p>
              )}

              {/* Social Links */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                <SocialLink href={user.github_url}    icon="🐙" label="GitHub" />
                <SocialLink href={user.linkedin_url}  icon="💼" label="LinkedIn" />
                <SocialLink href={user.portfolio_url} icon="🌐" label="Portfolio" />
                {user.whatsapp_number && (
                  <SocialLink
                    href={`https://wa.me/${user.whatsapp_number.replace(/\D/g, '')}`}
                    icon="💬"
                    label="WhatsApp"
                  />
                )}
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
                <StatCard icon="📁" label="Projects Posted"    value={data.analytics?.posted    || 0} />
                <StatCard icon="✅" label="Projects Completed" value={data.analytics?.completed || 0} />
                <StatCard icon="📩" label="Applications Sent"  value={data.analytics?.applied   || 0} />
                {user.rating > 0 && (
                  <StatCard icon="⭐" label="Avg Rating" value={Number(user.rating).toFixed(1)} />
                )}
              </div>

              {/* Skills */}
              {data.skills?.length > 0 ? (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--brown)' }}>Skills</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {data.skills.map(s => <SkillTag key={s} name={s} />)}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--brown)' }}>Skills</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                    No skills added yet.{' '}
                    <span
                      onClick={() => onNavigate('edit-profile')}
                      style={{ color: 'var(--orange)', cursor: 'pointer', fontStyle: 'normal', fontWeight: 600 }}
                    >
                      Add skills →
                    </span>
                  </p>
                </div>
              )}

              {/* Projects Tabs */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--brown)' }}>Projects</h3>
                <div className="tabs">
                  {TABS.map(t => (
                    <button
                      key={t}
                      className={`tab-btn ${tab === t ? 'active' : ''}`}
                      onClick={() => setTab(t)}
                    >
                      {t} ({projects[t.toLowerCase()]?.length || 0})
                    </button>
                  ))}
                </div>

                {tabProjects.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      {tab === 'Posted' ? '📭' : tab === 'Applied' ? '🔍' : '🏁'}
                    </div>
                    <h3>No {tab.toLowerCase()} projects</h3>
                    <p>
                      {tab === 'Posted'    ? 'Post your first project to get started!'
                      : tab === 'Applied'  ? "You haven't applied to any projects yet."
                      : 'Complete a project to see it here.'}
                    </p>
                    {tab === 'Posted' && (
                      <button className="btn btn-primary btn-sm" onClick={() => onNavigate('post')}>
                        ➕ Post a Project
                      </button>
                    )}
                    {tab === 'Applied' && (
                      <button className="btn btn-primary btn-sm" onClick={() => onNavigate('browse')}>
                        🔍 Browse Projects
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid-3">
                    {tabProjects.map(p => (
                      <ProjectMiniCard key={p.id} project={p} onNavigate={onNavigate} />
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews */}
              {data.reviews?.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--brown)' }}>
                    Reviews
                    <span style={{
                      fontSize: 13, color: 'var(--muted)', fontWeight: 400,
                      marginLeft: 8, fontFamily: "'Nunito', sans-serif",
                    }}>
                      ({data.reviews.length} review{data.reviews.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <div className="grid-2">
                    {data.reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ padding: 60 }}>
            <div className="empty-icon">😕</div>
            <h3>Profile not found</h3>
            <p>Could not load profile data.</p>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('dashboard')}>
              ← Back to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}