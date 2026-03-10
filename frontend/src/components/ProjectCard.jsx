import React from 'react';
const statusColors = {
  "Open":        { bg: "#e8f5e9", color: "#2e7d32" },
  "In Progress": { bg: "#fff8e1", color: "#f57f17" },
  "In progress": { bg: "#fff8e1", color: "#f57f17" },
  "Completed":   { bg: "#e3f2fd", color: "#1565c0" },
};

export default function ProjectCard({ project }) {
  const sc = statusColors[project.status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <div
      className="project-card"
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '16px 18px',
        border: '1px solid #f1f0ff',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: 15 }}>
          {project.title}
        </span>
        <span
          style={{
            background: sc.bg,
            color: sc.color,
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {project.status}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 12, color: '#6366f1', background: '#eef2ff',
            padding: '2px 10px', borderRadius: 20, fontWeight: 500,
          }}
        >
          {project.domain}
        </span>
        <span
          style={{
            fontSize: 12, color: '#7c3aed', background: '#f5f3ff',
            padding: '2px 10px', borderRadius: 20, fontWeight: 500,
          }}
        >
          {project.skill}
        </span>
      </div>
      <span style={{ fontSize: 11, color: '#9ca3af' }}>Posted {project.date}</span>
    </div>
  );
}
