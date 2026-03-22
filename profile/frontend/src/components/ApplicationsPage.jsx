import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Avatar from './Avatar';
import StarRating from './StarRating';
import StatusBadge from './StatusBadge';
import SkillTag from './SkillTag';
import { SkeletonCard } from './LoadingSkeleton';
import { getApplications, manageApplication } from '../services/api';
import { useToast } from './Toast';

function SentCard({ app, onNavigate }) {
  const statusStyles = {
    pending:  { color: 'var(--warning)',  bg: 'var(--warning-bg)',  icon: '⏳' },
    accepted: { color: 'var(--success)',  bg: 'var(--success-bg)',  icon: '🎉' },
    rejected: { color: 'var(--danger)',   bg: 'var(--danger-bg)',   icon: '😔' },
  };
  const s = statusStyles[app.status?.toLowerCase()] || statusStyles.pending;

  return (
    <div className="card" style={{ transition: 'all 0.2s', cursor: 'pointer' }}
      onClick={() => onNavigate('project', app.project_id)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--skin)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--brown)', marginBottom: 4, lineHeight: 1.3 }}>
            {app.project_title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {app.domain} · by <span style={{ color: 'var(--brown)', fontWeight: 600 }}>{app.owner_name}</span>
          </div>
        </div>
        <span style={{
          padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          color: s.color, background: s.bg, whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          {s.icon} {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: app.message ? 10 : 0 }}>
        <StatusBadge status={app.experience_level} />
        <StatusBadge status={app.project_status} />
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>
          Applied {app.applied_at}
        </span>
      </div>

      {app.message && (
        <div style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, fontStyle: 'italic', marginTop: 8 }}>
          "{app.message}"
        </div>
      )}
    </div>
  );
}

function ReceivedCard({ app, onManage, onNavigate }) {
  const toast = useToast();
  const [loading, setLoading] = useState('');
  const [status, setStatus]   = useState(app.status);
  const [expanded, setExpanded] = useState(false);

  const handle = async (action) => {
    setLoading(action);
    try {
      const res = await onManage({ application_id: app.id, action, user_id: app.owner_id });
      if (res.data.success) {
        setStatus(res.data.new_status);
        toast(`Application ${res.data.new_status}! ${action === 'accept' ? '✅' : '❌'}`, action === 'accept' ? 'success' : 'info');
      } else {
        toast(res.data.error || 'Action failed', 'error');
      }
    } catch (e) {
      toast(e.response?.data?.error || 'Action failed', 'error');
    } finally {
      setLoading('');
    }
  };

  const isPending = status === 'pending';

  return (
    <div className="card" style={{ transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--skin)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Header row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <Avatar name={app.applicant_name} size={44} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--brown)', marginBottom: 2 }}>
                {app.applicant_name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {app.applicant_email}
              </div>
            </div>
            <StatusBadge status={status} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            <StarRating value={app.avg_rating} readOnly size={13} />
            <StatusBadge status={app.experience_level} />
            <span style={{ fontSize: 11, color: 'var(--muted)', padding: '2px 8px', background: 'var(--surface)', borderRadius: 10 }}>
              {app.domain}
            </span>
          </div>
        </div>
      </div>

      {/* Project name */}
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
        For project:{' '}
        <span
          onClick={() => onNavigate('project', app.project_id)}
          style={{ color: 'var(--orange)', fontWeight: 600, cursor: 'pointer' }}
        >
          {app.project_title}
        </span>
        <span style={{ marginLeft: 8, fontFamily: "'DM Mono', monospace" }}>· {app.applied_at}</span>
      </div>

      {/* Skills */}
      {app.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
          {app.skills.slice(0, 5).map(s => <SkillTag key={s} name={s} small />)}
          {app.skills.length > 5 && <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>+{app.skills.length - 5}</span>}
        </div>
      )}

      {/* Message */}
      {app.message && (
        <div style={{ marginBottom: 12 }}>
          <div
            onClick={() => setExpanded(e => !e)}
            style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, fontStyle: 'italic', cursor: 'pointer',
              display: expanded ? 'block' : '-webkit-box',
              WebkitLineClamp: expanded ? undefined : 2,
              WebkitBoxOrient: 'vertical',
              overflow: expanded ? 'visible' : 'hidden',
              padding: '8px 12px', background: 'var(--surface)', borderRadius: 8,
            }}
          >
            "{app.message}"
            {!expanded && app.message.length > 120 && (
              <span style={{ color: 'var(--orange)', marginLeft: 4 }}>read more</span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {isPending ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-sm"
            onClick={() => handle('accept')}
            disabled={!!loading}
            style={{ flex: 1, background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(90,138,90,0.4)', fontWeight: 700 }}
          >
            {loading === 'accept' ? '⏳' : '✅'} Accept
          </button>
          <button
            className="btn btn-sm"
            onClick={() => handle('reject')}
            disabled={!!loading}
            style={{ flex: 1, background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(200,64,64,0.4)', fontWeight: 700 }}
          >
            {loading === 'reject' ? '⏳' : '❌'} Reject
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: status === 'accepted' ? 'var(--success)' : 'var(--danger)', fontWeight: 700, textAlign: 'center', padding: '6px 0' }}>
          {status === 'accepted' ? '✅ Application Accepted' : '❌ Application Rejected'}
        </div>
      )}
    </div>
  );
}

const TABS = ['sent', 'received'];

export default function ApplicationsPage({ userId, currentUser, onNavigate, onLogout }) {
  const toast = useToast();
  const [tab, setTab]             = useState('sent');
  const [sentApps, setSentApps]   = useState([]);
  const [recvApps, setRecvApps]   = useState([]);
  const [loadSent, setLoadSent]   = useState(true);
  const [loadRecv, setLoadRecv]   = useState(true);

  useEffect(() => {
    getApplications(userId, 'sent')
      .then(res => setSentApps(res.data.applications || []))
      .catch(() => {})
      .finally(() => setLoadSent(false));

    getApplications(userId, 'received')
      .then(res => setRecvApps(res.data.applications || []))
      .catch(() => {})
      .finally(() => setLoadRecv(false));
  }, [userId]);

  const handleManage = async (data) => {
    const res = await manageApplication(data);
    return res;
  };

  const pendingCount = recvApps.filter(a => a.status === 'pending').length;

  return (
    <div className="app-layout">
      <Sidebar currentPage="applications" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="main-content page-enter">

        <div className="page-header">
          <div>
            <h1 style={{ fontSize: 26 }}>Applications</h1>
            <p>Track your applications and manage incoming ones</p>
          </div>
          {pendingCount > 0 && (
            <span style={{ padding: '6px 14px', borderRadius: 20, background: 'var(--warning-bg)', color: 'var(--warning)', fontSize: 13, fontWeight: 700 }}>
              ⏳ {pendingCount} pending review
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${tab === 'sent' ? 'active' : ''}`}
            onClick={() => setTab('sent')}
          >
            📤 My Applications ({sentApps.length})
          </button>
          <button
            className={`tab-btn ${tab === 'received' ? 'active' : ''}`}
            onClick={() => setTab('received')}
          >
            📥 Received
            {pendingCount > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--warning)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                {pendingCount}
              </span>
            )}
            {' '}({recvApps.length})
          </button>
        </div>

        {/* Sent Applications */}
        {tab === 'sent' && (
          <>
            {loadSent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1,2,3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : sentApps.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📤</div>
                <h3>No applications sent yet</h3>
                <p>Start exploring projects and apply to ones that match your skills!</p>
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate('browse')}>
                  🔍 Browse Projects
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Summary row */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                  {['pending', 'accepted', 'rejected'].map(s => {
                    const count = sentApps.filter(a => a.status === s).length;
                    if (!count) return null;
                    return (
                      <span key={s} className={`badge badge-${s}`} style={{ fontSize: 12, padding: '4px 12px' }}>
                        {s === 'pending' ? '⏳' : s === 'accepted' ? '✅' : '❌'} {count} {s}
                      </span>
                    );
                  })}
                </div>
                {sentApps.map(app => (
                  <SentCard key={app.id} app={app} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Received Applications */}
        {tab === 'received' && (
          <>
            {loadRecv ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1,2,3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : recvApps.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📥</div>
                <h3>No applications received yet</h3>
                <p>Post a project and students will start applying!</p>
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate('post')}>
                  ➕ Post a Project
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Pending first */}
                {recvApps
                  .sort((a, b) => (a.status === 'pending' ? -1 : 1))
                  .map(app => (
                    <ReceivedCard
                      key={app.id}
                      app={{ ...app, owner_id: userId }}
                      onManage={handleManage}
                      onNavigate={onNavigate}
                    />
                  ))
                }
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
