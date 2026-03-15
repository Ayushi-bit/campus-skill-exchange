// ============================================================
//  APPLICATIONS PAGE
//  File: src/components/ApplicationsPage.jsx
//  Two tabs: Sent (my applications) + Received (on my projects)
// ============================================================

import React, { useEffect, useState } from 'react';
import { getApplications, manageApplication } from '../services/api';
import Sidebar from './Sidebar';

const statusColors = {
  pending:  { bg: '#fff8e1', color: '#f57f17', label: 'Pending' },
  accepted: { bg: '#e8f5e9', color: '#2e7d32', label: 'Accepted' },
  rejected: { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
};

export default function ApplicationsPage({ userId, currentUser, onNavigate, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab]     = useState('sent');
  const [sent, setSent]               = useState([]);
  const [received, setReceived]       = useState([]);
  const [loadingSent, setLoadingSent] = useState(true);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [actionLoading, setActionLoading]     = useState(null); // application_id being actioned

  useEffect(() => {
    getApplications(userId, 'sent')
      .then(res => setSent(res.data.applications || []))
      .catch(() => setSent([]))
      .finally(() => setLoadingSent(false));

    getApplications(userId, 'received')
      .then(res => setReceived(res.data.applications || []))
      .catch(() => setReceived([]))
      .finally(() => setLoadingReceived(false));
  }, [userId]);

  const handleAction = async (applicationId, action) => {
    setActionLoading(applicationId + action);
    try {
      await manageApplication({ application_id: applicationId, action, user_id: userId });
      // Update local state
      setReceived(prev => prev.map(a =>
        a.id === applicationId ? { ...a, status: action === 'accept' ? 'accepted' : 'rejected' } : a
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = received.filter(a => a.status === 'pending').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f7ff' }}>
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activePage="applications"
        onNavigate={onNavigate}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: '0 0 6px' }}>
            Applications
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
            Track applications you've sent and manage ones you've received
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { key: 'sent',     label: 'Sent',     count: sent.length },
            { key: 'received', label: 'Received', count: pendingCount, badge: pendingCount > 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '9px 20px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                  : '#fff',
                color: activeTab === tab.key ? '#fff' : '#6b7280',
                boxShadow: activeTab === tab.key
                  ? '0 4px 12px rgba(99,102,241,0.3)'
                  : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.key
                    ? 'rgba(255,255,255,0.3)'
                    : tab.badge ? '#ef4444' : '#ede9fe',
                  color: activeTab === tab.key
                    ? '#fff'
                    : tab.badge ? '#fff' : '#6366f1',
                  borderRadius: 20,
                  padding: '1px 8px',
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── SENT TAB ── */}
        {activeTab === 'sent' && (
          loadingSent ? <LoadingSpinner /> :
          sent.length === 0 ? (
            <EmptyState
              icon="📨"
              title="No applications sent yet"
              subtitle="Browse projects and apply to ones that interest you"
              action="Browse Projects"
              onAction={() => onNavigate('browse')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sent.map(app => (
                <div key={app.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span
                          onClick={() => onNavigate('project', app.project_id)}
                          style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: '#1e1b4b', cursor: 'pointer' }}
                        >
                          {app.project_title}
                        </span>
                        <span style={{ ...pillStyle, background: '#f5f4fe', color: '#6366f1' }}>
                          {app.domain}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                        by <strong style={{ color: '#4b5563' }}>{app.owner_name}</strong> · Applied {app.applied_at}
                      </div>
                      {app.message && (
                        <div style={{ fontSize: 13, color: '#6b7280', background: '#f9fafb', borderRadius: 8, padding: '8px 12px', borderLeft: '3px solid #ede9fe' }}>
                          "{app.message}"
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{
                        ...pillStyle,
                        background: statusColors[app.status]?.bg,
                        color: statusColors[app.status]?.color,
                        fontWeight: 700,
                      }}>
                        {statusColors[app.status]?.label}
                      </span>
                      <span style={{ ...pillStyle, background: '#f1f0ff', color: '#7c3aed' }}>
                        {app.experience_level}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── RECEIVED TAB ── */}
        {activeTab === 'received' && (
          loadingReceived ? <LoadingSpinner /> :
          received.length === 0 ? (
            <EmptyState
              icon="📥"
              title="No applications received yet"
              subtitle="Post a project to start receiving applications from other students"
              action="Post a Project"
              onAction={() => onNavigate('post')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {received.map(app => (
                <div key={app.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      {/* Project name */}
                      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {app.project_title}
                      </div>
                      {/* Applicant info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
                        }}>
                          {app.applicant_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: '#1e1b4b' }}>
                            {app.applicant_name}
                          </div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>
                            {app.domain} · {app.experience_level} · ⭐ {app.avg_rating?.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      {app.message && (
                        <div style={{ fontSize: 13, color: '#6b7280', background: '#f9fafb', borderRadius: 8, padding: '8px 12px', borderLeft: '3px solid #ede9fe', marginTop: 8 }}>
                          "{app.message}"
                        </div>
                      )}
                      {app.skills && app.skills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                          {app.skills.map(skill => (
                            <span key={skill} style={{
                              background: '#f5f4fe', color: '#6366f1',
                              border: '1px solid #e0dcff',
                              borderRadius: 20, padding: '2px 10px',
                              fontSize: 11, fontWeight: 600,
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: '#d1d5db', marginTop: 8 }}>
                        Applied {app.applied_at}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      {app.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleAction(app.id, 'reject')}
                            disabled={actionLoading !== null}
                            style={{
                              padding: '7px 16px', borderRadius: 10, border: '1.5px solid #fecaca',
                              background: '#fff', color: '#dc2626', fontWeight: 600, fontSize: 13,
                              cursor: actionLoading !== null ? 'not-allowed' : 'pointer',
                              fontFamily: 'inherit', opacity: actionLoading !== null ? 0.6 : 1,
                              transition: 'all 0.15s',
                            }}
                          >
                            {actionLoading === app.id + 'reject' ? '...' : '✕ Reject'}
                          </button>
                          <button
                            onClick={() => handleAction(app.id, 'accept')}
                            disabled={actionLoading !== null}
                            style={{
                              padding: '7px 16px', borderRadius: 10, border: 'none',
                              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                              color: '#fff', fontWeight: 700, fontSize: 13,
                              cursor: actionLoading !== null ? 'not-allowed' : 'pointer',
                              fontFamily: 'inherit', opacity: actionLoading !== null ? 0.6 : 1,
                              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                              transition: 'all 0.15s',
                            }}
                          >
                            {actionLoading === app.id + 'accept' ? '...' : '✓ Accept'}
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          ...pillStyle,
                          background: statusColors[app.status]?.bg,
                          color: statusColors[app.status]?.color,
                          fontWeight: 700,
                        }}>
                          {statusColors[app.status]?.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #ede9fe', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18, color: '#1e1b4b', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>{subtitle}</div>
      <button
        onClick={onAction}
        style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
      >
        {action}
      </button>
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  padding: '20px 24px',
  boxShadow: '0 2px 12px rgba(99,102,241,0.06)',
  border: '1px solid #ede9fe',
  transition: 'box-shadow 0.2s',
};

const pillStyle = {
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
};