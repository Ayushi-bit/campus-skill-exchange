import React from 'react';
const statusColors = {
  "Open":        { bg: "#e8f5e9", color: "#2e7d32" },
  "In Progress": { bg: "#fff8e1", color: "#f57f17" },
  "In progress": { bg: "#fff8e1", color: "#f57f17" },
  "Completed":   { bg: "#e3f2fd", color: "#1565c0" },
};

export default function ProjectCard({ project, onNavigate }) {
  const sc = statusColors[project.status] || { bg: '#f3f4f6', color: '#6b7280' };
  const isClickable = !!project.id && !!onNavigate;

  return (
    <div
      className="project-card"
      onClick={() => isClickable && onNavigate('project', project.id)}
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '16px 18px',
        border: '1px solid #f1f0ff',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => {
        if (!isClickable) return;
        e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.13)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: 15 }}>
          {project.title}
        </span>
        <span style={{
          background: sc.bg, color: sc.color,
          borderRadius: 20, padding: '2px 10px',
          fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          {project.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 12, color: '#6366f1', background: '#eef2ff',
          padding: '2px 10px', borderRadius: 20, fontWeight: 500,
        }}>
          {project.domain}
        </span>
        {/* skills is now an array — show first 2 */}
        {Array.isArray(project.skills) && project.skills.slice(0, 2).map((sk, i) => (
          <span key={i} style={{
            fontSize: 12, color: '#7c3aed', background: '#f5f3ff',
            padding: '2px 10px', borderRadius: 20, fontWeight: 500,
          }}>
            {sk}
          </span>
        ))}
        {Array.isArray(project.skills) && project.skills.length > 2 && (
          <span style={{
            fontSize: 12, color: '#9ca3af', background: '#f3f4f6',
            padding: '2px 10px', borderRadius: 20, fontWeight: 500,
          }}>
            +{project.skills.length - 2} more
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{project.date}</span>
        {isClickable && (
          <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>View →</span>
        )}
      </div>
    </div>
  );
}