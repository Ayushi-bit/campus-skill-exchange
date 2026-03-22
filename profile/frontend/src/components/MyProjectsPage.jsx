import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import StatusBadge from './StatusBadge';
import SkillTag from './SkillTag';
import { SkeletonCard } from './LoadingSkeleton';
import { getMyProjects, updateProject } from '../services/api';
import { useToast } from './Toast';

const STATUS_OPTIONS = ['open', 'in_progress', 'completed', 'closed'];
const STATUS_LABELS  = { open: '🟢 Open', in_progress: '🔵 In Progress', completed: '✅ Completed', closed: '🔒 Closed' };
const FILTER_TABS    = ['All', 'Open', 'In Progress', 'Completed', 'Closed'];

function OwnedCard({ project, userId, onNavigate, onStatusChange }) {
  const toast = useToast();
  const [showStatus, setShowStatus] = useState(false);
  const [loading, setLoading]       = useState('');

  const handleStatusChange = async (newStatus) => {
    setLoading(newStatus);
    try {
      const res = await updateProject({ action: 'update_status', user_id: userId, project_id: project.id, status: newStatus });
      if (res.data.success) {
        toast(`Status updated to "${newStatus}"! ✅`, 'success');
        onStatusChange(project.id, newStatus);
        setShowStatus(false);
      } else {
        toast(res.data.error || 'Failed to update status', 'error');
      }
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to update status', 'error');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--skin)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Title + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--brown)', lineHeight: 1.3, flex: 1 }}>
          {project.title}
        </h3>
        <StatusBadge status={project.status} />
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--orange-dim)', color: 'var(--orange)', fontSize: 11, fontWeight: 600 }}>
          {project.domain}
        </span>
        <StatusBadge status={project.experience_level} />
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'DM Mono', monospace", padding: '3px 0' }}>
          📅 {project.created_at}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description}
      </p>

      {/* Skills */}
      {project.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {project.skills.slice(0, 4).map(s => <SkillTag key={s} name={s} small />)}
          {project.skills.length > 4 && <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>+{project.skills.length - 4}</span>}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, paddingTop: 8, borderTop: '1px solid var(--surface)' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>👥 {project.member_count}/{project.max_members} members</span>
        {project.pending_count > 0 && (
          <span style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 700 }}>
            ⏳ {project.pending_count} pending
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigate('project', project.id)}
        >
          👁 View
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigate('applications')}
        >
          📩 Applications
          {project.pending_count > 0 && (
            <span style={{ marginLeft: 4, background: 'var(--warning)', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>
              {project.pending_count}
            </span>
          )}
        </button>

        {/* Status change dropdown */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowStatus(s => !s)}
          >
            🔄 Change Status
          </button>
          {showStatus && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 4,
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: 'var(--shadow)', zIndex: 10,
              minWidth: 160, overflow: 'hidden',
            }}>
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={project.status === s || !!loading}
                  style={{
                    width: '100%', padding: '9px 14px',
                    background: project.status === s ? 'var(--surface)' : 'transparent',
                    border: 'none', cursor: project.status === s ? 'default' : 'pointer',
                    textAlign: 'left', fontSize: 13,
                    color: project.status === s ? 'var(--orange)' : 'var(--text)',
                    fontWeight: project.status === s ? 700 : 400,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (project.status !== s) e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseLeave={e => { if (project.status !== s) e.currentTarget.style.background = 'transparent'; }}
                >
                  {loading === s ? '⏳ ' : ''}{STATUS_LABELS[s]}
                  {project.status === s && ' ✓'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberOfCard({ project, onNavigate }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s', cursor: 'pointer' }}
      onClick={() => onNavigate('project', project.id)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--skin)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--brown)', lineHeight: 1.3, flex: 1 }}>{project.title}</h3>
        <StatusBadge status={project.status} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--orange-dim)', color: 'var(--orange)', fontSize: 11, fontWeight: 600 }}>
          {project.domain}
        </span>
        <StatusBadge status={project.experience_level} />
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description}
      </p>

      {project.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {project.skills.slice(0, 4).map(s => <SkillTag key={s} name={s} small />)}
          {project.skills.length > 4 && <span style={{ fontSize: 11, color: 'var(--muted)' }}>+{project.skills.length - 4}</span>}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--surface)' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          By <span style={{ color: 'var(--brown)', fontWeight: 600 }}>{project.owner_name}</span>
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>👥 {project.member_count}/{project.max_members}</span>
      </div>
    </div>
  );
}

export default function MyProjectsPage({ userId, currentUser, onNavigate, onLogout }) {
  const [owned, setOwned]       = useState([]);
  const [memberOf, setMemberOf] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');
  const [activeTab, setActiveTab] = useState('owned');

  useEffect(() => {
    getMyProjects(userId)
      .then(res => {
        setOwned(res.data.owned || []);
        setMemberOf(res.data.member_of || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleStatusChange = (projectId, newStatus) => {
    setOwned(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
  };

  const filterProjects = (projects) => {
    if (filter === 'All') return projects;
    return projects.filter(p => {
      const s = p.status?.toLowerCase().replace(/_/g, ' ');
      return s === filter.toLowerCase();
    });
  };

  const filteredOwned    = filterProjects(owned);
  const filteredMemberOf = filterProjects(memberOf);

  const totalOwned    = owned.length;
  const totalMemberOf = memberOf.length;
  const totalPending  = owned.reduce((sum, p) => sum + (p.pending_count || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar currentPage="myprojects" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="main-content page-enter">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: 26 }}>My Projects</h1>
            <p>Manage your projects and track your collaborations</p>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate('post')}>➕ Post a Project</button>
        </div>

        {/* Stats row */}
        {!loading && (
          <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { icon: '📁', label: 'Projects Owned', value: totalOwned, color: 'var(--orange)' },
              { icon: '🤝', label: 'Collaborating On', value: totalMemberOf, color: '#3366cc' },
              { icon: '⏳', label: 'Pending Applications', value: totalPending, color: 'var(--warning)' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--brown)', fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'owned' ? 'active' : ''}`} onClick={() => setActiveTab('owned')}>
            📁 My Projects ({totalOwned})
          </button>
          <button className={`tab-btn ${activeTab === 'member' ? 'active' : ''}`} onClick={() => setActiveTab('member')}>
            🤝 Collaborating ({totalMemberOf})
          </button>
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {FILTER_TABS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: 20,
              border: `2px solid ${filter === f ? 'var(--orange)' : 'var(--border)'}`,
              background: filter === f ? 'var(--orange-dim)' : 'var(--white)',
              color: filter === f ? 'var(--orange)' : 'var(--muted)',
              fontWeight: filter === f ? 700 : 500,
              fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid-3">{[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}</div>
        ) : activeTab === 'owned' ? (
          filteredOwned.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{filter !== 'All' ? '🔍' : '📭'}</div>
              <h3>{filter !== 'All' ? `No ${filter.toLowerCase()} projects` : 'No projects yet'}</h3>
              <p>{filter !== 'All' ? 'Try a different filter' : "You haven't posted any projects yet."}</p>
              {filter === 'All' && (
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate('post')}>
                  ➕ Post Your First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid-3" style={{ alignItems: 'start' }}>
              {filteredOwned.map(p => (
                <OwnedCard
                  key={p.id}
                  project={p}
                  userId={userId}
                  onNavigate={onNavigate}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )
        ) : (
          filteredMemberOf.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{filter !== 'All' ? '🔍' : '🤝'}</div>
              <h3>{filter !== 'All' ? `No ${filter.toLowerCase()} collaborations` : "Not collaborating yet"}</h3>
              <p>{filter !== 'All' ? 'Try a different filter' : "Apply to projects to start collaborating with other students."}</p>
              {filter === 'All' && (
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate('browse')}>
                  🔍 Browse Projects
                </button>
              )}
            </div>
          ) : (
            <div className="grid-3" style={{ alignItems: 'start' }}>
              {filteredMemberOf.map(p => (
                <MemberOfCard key={p.id} project={p} onNavigate={onNavigate} />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}