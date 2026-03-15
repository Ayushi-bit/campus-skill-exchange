// ============================================================
//  MY PROJECTS PAGE
//  File: src/components/MyProjectsPage.jsx
//  Shows owned projects + projects user is a member of
// ============================================================

import React, { useEffect, useState } from 'react';
import { getMyProjects } from '../services/api';
import Sidebar from './Sidebar';

const statusStyles = {
  open:        { bg: '#e8f5e9', color: '#2e7d32',  label: 'Open'        },
  in_progress: { bg: '#fff8e1', color: '#f57f17',  label: 'In Progress' },
  completed:   { bg: '#e3f2fd', color: '#1565c0',  label: 'Completed'   },
  closed:      { bg: '#fef2f2', color: '#dc2626',  label: 'Closed'      },
};

export default function MyProjectsPage({ userId, currentUser, onNavigate, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [owned, setOwned]             = useState([]);
  const [memberOf, setMemberOf]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('owned');

  useEffect(() => {
    getMyProjects(userId)
      .then(res => {
        setOwned(res.data.owned || []);
        setMemberOf(res.data.member_of || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const totalPending = owned.reduce((sum, p) => sum + (p.pending_count || 0), 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f7ff' }}>
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activePage="myprojects"
        onNavigate={onNavigate}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: '0 0 6px' }}>
              My Projects
            </h1>
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
              Projects you own and ones you're a team member of
            </p>
          </div>
          <button
            onClick={() => onNavigate('post')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: 12,
              padding: '10px 20px', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            ✦ Post New Project
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { key: 'owned',    label: 'Created',      count: owned.length,    badge: totalPending },
            { key: 'member_of', label: 'Collaborations', count: memberOf.length, badge: 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '9px 20px', borderRadius: 12, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 8,
                background: activeTab === tab.key ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : '#fff',
                color: activeTab === tab.key ? '#fff' : '#6b7280',
                boxShadow: activeTab === tab.key ? '0 4px 12px rgba(99,102,241,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : '#ede9fe',
                  color: activeTab === tab.key ? '#fff' : '#6366f1',
                  borderRadius: 20, padding: '1px 8px', fontSize: 12, fontWeight: 700,
                }}>
                  {tab.count}
                </span>
              )}
              {tab.badge > 0 && (
                <span style={{
                  background: '#ef4444', color: '#fff',
                  borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700,
                }}>
                  {tab.badge} pending
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #ede9fe', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : activeTab === 'owned' ? (
          owned.length === 0 ? (
            <EmptyState
              icon="📁"
              title="No projects posted yet"
              subtitle="Share your ideas and find collaborators"
              action="Post Your First Project"
              onAction={() => onNavigate('post')}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {owned.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  isOwner={true}
                  onView={() => onNavigate('project', p.id)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )
        ) : (
          memberOf.length === 0 ? (
            <EmptyState
              icon="👥"
              title="Not a member of any project yet"
              subtitle="Apply to projects and get accepted to see them here"
              action="Browse Projects"
              onAction={() => onNavigate('browse')}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {memberOf.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  isOwner={false}
                  onView={() => onNavigate('project', p.id)}
                />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

function ProjectCard({ project, isOwner, onView }) {
  const sc = statusStyles[project.status] || { bg: '#f3f4f6', color: '#6b7280', label: project.status };

  return (
    <div
      onClick={onView}
      style={{
        background: '#fff', borderRadius: 16, padding: '20px 22px',
        border: '1px solid #ede9fe', cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(99,102,241,0.06)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(99,102,241,0.06)'; }}
    >
      {/* Title + Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: '#1e1b4b', lineHeight: 1.4 }}>
          {project.title}
        </div>
        <span style={{ ...pillStyle, background: sc.bg, color: sc.color, flexShrink: 0 }}>
          {sc.label}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description}
      </p>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ ...pillStyle, background: '#f5f4fe', color: '#6366f1' }}>📂 {project.domain}</span>
        <span style={{ ...pillStyle, background: '#f1f0ff', color: '#7c3aed' }}>{project.experience_level}</span>
        <span style={{ ...pillStyle, background: '#f9fafb', color: '#6b7280' }}>
          👥 {project.member_count}/{project.max_members}
        </span>
      </div>

      {/* Skills */}
      {project.skills && project.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {project.skills.slice(0, 4).map(sk => (
            <span key={sk} style={{ ...pillStyle, background: '#eef2ff', color: '#4f46e5', fontSize: 11 }}>{sk}</span>
          ))}
          {project.skills.length > 4 && (
            <span style={{ ...pillStyle, background: '#f3f4f6', color: '#9ca3af', fontSize: 11 }}>+{project.skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #f5f4fe' }}>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>
          {isOwner ? `Posted ${project.created_at}` : `Owner: ${project.owner_name}`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isOwner && project.pending_count > 0 && (
            <span style={{ background: '#fef3c7', color: '#d97706', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
              {project.pending_count} pending
            </span>
          )}
          <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>View →</span>
        </div>
      </div>
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

const pillStyle = {
  display: 'inline-block', padding: '3px 10px',
  borderRadius: 20, fontSize: 12, fontWeight: 600,
};