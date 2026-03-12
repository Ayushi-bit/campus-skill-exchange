// ============================================================
//  PROJECT DETAIL PAGE
//  File: src/components/ProjectDetailPage.jsx
//  Opens when any project card is clicked anywhere in the app
//  Receives: projectId, userId, onNavigate, onBack
// ============================================================

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { getProjectDetails, applyToProject } from '../services/api';

const USER_ID = 2;

const statusStyles = {
  open:        { bg: '#e8f5e9', color: '#2e7d32',  label: 'Open'        },
  in_progress: { bg: '#fff8e1', color: '#f57f17',  label: 'In Progress' },
  completed:   { bg: '#e3f2fd', color: '#1565c0',  label: 'Completed'   },
  closed:      { bg: '#fef2f2', color: '#dc2626',  label: 'Closed'      },
};

const levelStyles = {
  Beginner:     { bg: '#e8f5e9', color: '#2e7d32'  },
  Intermediate: { bg: '#fff8e1', color: '#f57f17'  },
  Advanced:     { bg: '#fef2f2', color: '#dc2626'  },
};

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name = '') {
  const colors = ['#6366f1','#7c3aed','#059669','#d97706','#db2777','#0891b2'];
  return colors[name.charCodeAt(0) % colors.length];
}

export default function ProjectDetailPage({ projectId, onNavigate, onBack }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [message,     setMessage]     = useState('');
  const [applying,    setApplying]    = useState(false);
  const [applyResult, setApplyResult] = useState(null); // { success, text }

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProjectDetails(projectId, USER_ID)
      .then(res => setData(res.data))
      .catch(() => setError('Could not load project. Make sure your backend is running.'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleApply = () => {
    if (applying) return;
    setApplying(true);
    applyToProject({ project_id: projectId, user_id: USER_ID, message })
      .then(res => {
        setApplyResult({ success: true, text: res.data.message });
        setData(prev => ({ ...prev, application_status: 'pending' }));
      })
      .catch(err => {
        const msg = err.response?.data?.error || 'Failed to apply. Try again.';
        setApplyResult({ success: false, text: msg });
      })
      .finally(() => setApplying(false));
  };

  // ── LOADING ──
  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="browse" onNavigate={onNavigate} />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid #ede9fe',
            borderTop: '4px solid #6366f1', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading project...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </main>
    </div>
  );

  // ── ERROR ──
  if (error) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="browse" onNavigate={onNavigate} />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 16, padding: '32px 40px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>
          <button onClick={onBack} style={{
            marginTop: 16, background: '#6366f1', color: '#fff',
            border: 'none', borderRadius: 10, padding: '10px 24px',
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>← Go Back</button>
        </div>
      </main>
    </div>
  );

  const { project, owner, skills, members, application_status, total_applicants, is_owner } = data;
  const sc = statusStyles[project.status] || { bg: '#f3f4f6', color: '#6b7280', label: project.status };
  const lc = levelStyles[project.experience_level] || { bg: '#f3f4f6', color: '#6b7280' };
  const memberCount = members.length;
  const openSlots   = Math.max(0, project.max_members - memberCount);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f4fe' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pd-card {
          background: #fff; border-radius: 16px; padding: 24px;
          border: 1px solid #ede9fe;
          box-shadow: 0 2px 12px rgba(99,102,241,0.06);
          animation: fadeUp 0.35s ease both;
        }
        .pd-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 15px; font-weight: 700;
          color: #1e1b4b; margin-bottom: 14px;
        }
        .pd-skill-chip {
          display: inline-block;
          background: #eef2ff; color: #4f46e5;
          border-radius: 20px; padding: 4px 12px;
          font-size: 12px; font-weight: 600;
          border: 1px solid #e0e7ff;
        }
        .apply-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: #fff; border: none; border-radius: 12px;
          font-size: 15px; font-weight: 700;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .apply-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99,102,241,0.35);
        }
        .apply-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .social-link {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 13px; border-radius: 10px;
          background: #f5f4fe; color: #4f46e5;
          text-decoration: none; font-size: 13px; font-weight: 500;
          transition: background 0.15s;
          border: 1px solid #ede9fe;
        }
        .social-link:hover { background: #eef2ff; }
        .slots-track {
          height: 7px; background: #ede9fe; border-radius: 99px; overflow: hidden;
          margin: 10px 0 5px;
        }
        .slots-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #7c3aed);
          border-radius: 99px;
          transition: width 0.5s ease;
        }
      `}</style>

      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="browse" onNavigate={onNavigate} />

      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', maxHeight: '100vh' }}>

        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13 }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', color: '#6366f1',
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
            padding: 0, display: 'flex', alignItems: 'center', gap: 4,
          }}>← Back</button>
          <span style={{ color: '#d1d5db' }}>/</span>
          <span style={{ color: '#9ca3af' }}>Projects</span>
          <span style={{ color: '#d1d5db' }}>/</span>
          <span style={{ color: '#1e1b4b', fontWeight: 600 }}>{project.title}</span>
        </div>

        {/* ── HERO BANNER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          borderRadius: 20, padding: '28px 32px', color: '#fff',
          marginBottom: 24, position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(30,27,75,0.2)',
          animation: 'fadeUp 0.35s ease both',
        }}>
          <div style={{
            position: 'absolute', right: -20, top: 0, bottom: 0, width: 260,
            opacity: 0.06, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
            backgroundSize: '12px 12px',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
                {project.title}
              </h1>
              <span style={{
                background: sc.bg, color: sc.color,
                borderRadius: 20, padding: '4px 14px',
                fontSize: 12, fontWeight: 700,
              }}>{sc.label}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 500 }}>
                📂 {project.domain}
              </span>
              <span style={{ background: lc.bg, color: lc.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                {project.experience_level}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>
                🗓 Posted {project.created_at}
              </span>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Description */}
            <div className="pd-card" style={{ animationDelay: '0.05s' }}>
              <div className="pd-section-title">📋 About This Project</div>
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.8, margin: 0 }}>
                {project.description}
              </p>
            </div>

            {/* Required Skills */}
            <div className="pd-card" style={{ animationDelay: '0.1s' }}>
              <div className="pd-section-title">
                🛠️ Required Skills
                <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', marginLeft: 8 }}>
                  ({skills.length})
                </span>
              </div>
              {skills.length === 0
                ? <p style={{ fontSize: 13, color: '#9ca3af' }}>No specific skills listed.</p>
                : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {skills.map(sk => (
                      <span key={sk} className="pd-skill-chip">{sk}</span>
                    ))}
                  </div>
                )
              }
            </div>

            {/* Team Members */}
            <div className="pd-card" style={{ animationDelay: '0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div className="pd-section-title" style={{ margin: 0 }}>
                  👥 Team Members
                </div>
                <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                  {memberCount}/{project.max_members}
                </span>
              </div>

              {/* Progress bar */}
              <div className="slots-track">
                <div className="slots-fill" style={{
                  width: `${project.max_members > 0 ? Math.round((memberCount / project.max_members) * 100) : 0}%`
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
                <span>{memberCount} joined</span>
                <span style={{ color: openSlots > 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                  {openSlots} slot{openSlots !== 1 ? 's' : ''} open
                </span>
              </div>

              {members.length === 0
                ? <p style={{ fontSize: 13, color: '#9ca3af' }}>No members yet.</p>
                : members.map((m, i) => (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 13px', borderRadius: 12,
                    background: '#fafafe', border: '1px solid #f1f0ff',
                    marginBottom: i < members.length - 1 ? 8 : 0,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: avatarColor(m.name),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>{initials(m.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: '#1e1b4b' }}>{m.name}</span>
                        {m.role === 'owner' && (
                          <span style={{
                            background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
                            color: '#fff', borderRadius: 20, padding: '1px 9px',
                            fontSize: 10, fontWeight: 700,
                          }}>Owner</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                        {m.experience_level} · ⭐ {m.avg_rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Apply Card */}
            <div className="pd-card" style={{ animationDelay: '0.1s' }}>
              <div className="pd-section-title">✦ Apply to This Project</div>

              {/* Owner info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f1f0ff' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: avatarColor(owner.name),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>{initials(owner.name)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b' }}>{owner.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Project Owner</div>
                  <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 2 }}>
                    {'★'.repeat(Math.round(owner.avg_rating))}{'☆'.repeat(5 - Math.round(owner.avg_rating))}
                    <span style={{ color: '#9ca3af', marginLeft: 4 }}>{owner.avg_rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Owner skills */}
              {owner.skills && owner.skills.length > 0 && (
                <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f1f0ff' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                    🧠 What the owner brings
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {owner.skills.map(sk => (
                      <span key={sk} style={{
                        background: '#f5f3ff', color: '#7c3aed',
                        border: '1px solid #e9d5ff',
                        borderRadius: 20, padding: '3px 10px',
                        fontSize: 11, fontWeight: 600,
                      }}>{sk}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Applicant count */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', background: '#f5f4fe', borderRadius: 10,
                marginBottom: 16, fontSize: 13, color: '#4f46e5', fontWeight: 500,
              }}>
                👥 {total_applicants} applicant{total_applicants !== 1 ? 's' : ''} so far
              </div>

              {/* Apply section — conditional */}
              {is_owner ? (
                <div style={{ padding: '12px 14px', background: '#eef2ff', borderRadius: 10, fontSize: 13, color: '#4f46e5', fontWeight: 500, textAlign: 'center' }}>
                  📌 You own this project
                </div>

              ) : application_status === 'not_applied' && project.status === 'open' ? (
                <>
                  {applyResult && (
                    <div style={{
                      padding: '10px 14px', borderRadius: 10, fontSize: 13,
                      fontWeight: 500, marginBottom: 12,
                      background: applyResult.success ? '#e8f5e9' : '#fef2f2',
                      color:      applyResult.success ? '#2e7d32' : '#dc2626',
                      border: `1px solid ${applyResult.success ? '#bbf7d0' : '#fecaca'}`,
                    }}>
                      {applyResult.success ? '✓ ' : '⚠ '}{applyResult.text}
                    </div>
                  )}
                  <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', display: 'block', marginBottom: 8 }}>
                    Your Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell the owner why you'd be a great fit…"
                    rows={3}
                    style={{
                      width: '100%', padding: '11px 13px',
                      border: '1.5px solid #ede9fe', borderRadius: 10,
                      fontSize: 13, fontFamily: 'inherit', color: '#1e1b4b',
                      resize: 'vertical', outline: 'none', marginBottom: 12,
                      lineHeight: 1.6,
                    }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e  => e.target.style.borderColor = '#ede9fe'}
                  />
                  <button
                    className="apply-btn"
                    onClick={handleApply}
                    disabled={applying || !!applyResult?.success}
                  >
                    {applying ? 'Submitting…' : applyResult?.success ? '✓ Applied!' : '✦ Send Application'}
                  </button>
                </>

              ) : application_status !== 'not_applied' ? (
                <div style={{
                  padding: '14px', borderRadius: 12, textAlign: 'center',
                  background: application_status === 'accepted' ? '#e8f5e9'
                            : application_status === 'rejected' ? '#fef2f2'
                            : '#fff8e1',
                  border: `1px solid ${
                    application_status === 'accepted' ? '#bbf7d0'
                    : application_status === 'rejected' ? '#fecaca'
                    : '#fde68a'}`,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>
                    {application_status === 'accepted' ? '✅' : application_status === 'rejected' ? '❌' : '🕐'}
                  </div>
                  <div style={{
                    fontWeight: 700, fontSize: 14,
                    color: application_status === 'accepted' ? '#2e7d32'
                         : application_status === 'rejected' ? '#dc2626'
                         : '#f57f17',
                  }}>
                    Application {application_status.charAt(0).toUpperCase() + application_status.slice(1)}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    {application_status === 'pending' && 'The owner will review your application soon.'}
                    {application_status === 'accepted' && 'Congratulations! You\'ve been accepted.'}
                    {application_status === 'rejected' && 'Your application was not selected this time.'}
                  </div>
                </div>

              ) : (
                <div style={{ padding: '12px 14px', background: '#fef2f2', borderRadius: 10, fontSize: 13, color: '#dc2626', fontWeight: 500, textAlign: 'center' }}>
                  🔒 This project is not accepting applications
                </div>
              )}
            </div>

            {/* Owner Social Links */}
            {(owner.github_url || owner.linkedin_url || owner.portfolio_url || owner.whatsapp_number) && (
              <div className="pd-card" style={{ animationDelay: '0.15s' }}>
                <div className="pd-section-title">🔗 Connect with Owner</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {owner.github_url && (
                    <a href={owner.github_url} target="_blank" rel="noreferrer" className="social-link">
                      🐙 GitHub Profile
                    </a>
                  )}
                  {owner.linkedin_url && (
                    <a href={owner.linkedin_url} target="_blank" rel="noreferrer" className="social-link">
                      💼 LinkedIn
                    </a>
                  )}
                  {owner.portfolio_url && (
                    <a href={owner.portfolio_url} target="_blank" rel="noreferrer" className="social-link">
                      🌐 Portfolio
                    </a>
                  )}
                  {owner.whatsapp_number && (
                    <a href={`https://wa.me/${owner.whatsapp_number.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="social-link">
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Project Info Summary */}
            <div className="pd-card" style={{ animationDelay: '0.2s' }}>
              <div className="pd-section-title">ℹ️ Project Info</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                {[
                  ['Domain',    project.domain],
                  ['Level',     project.experience_level],
                  ['Status',    sc.label],
                  ['Team Size', `${memberCount} / ${project.max_members}`],
                  ['Posted',    project.created_at],
                ].map(([label, val]) => (
                  <tr key={label} style={{ borderBottom: '1px solid #f5f4fe' }}>
                    <td style={{ padding: '8px 0', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.06em', width: '45%' }}>
                      {label}
                    </td>
                    <td style={{ padding: '8px 0', color: '#1e1b4b', fontWeight: 500 }}>
                      {val}
                    </td>
                  </tr>
                ))}
              </table>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
