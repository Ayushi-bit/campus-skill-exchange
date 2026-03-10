import React, { useState } from 'react';
import ProjectCard from './ProjectCard';

const TABS = [
  { key: 'posted',    label: 'Posted'    },
  { key: 'applied',   label: 'Applied'   },
  { key: 'completed', label: 'Completed' },
];

export default function ProjectsSection({ projects }) {
  const [activeTab, setActiveTab] = useState('posted');

  return (
    <div
      className="fade-up card"
      style={{ animationDelay: '0.15s', marginBottom: 20 }}
    >
      <div className="section-title">Projects</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className="tab-btn"
            onClick={() => setActiveTab(key)}
            style={{
              background:
                activeTab === key
                  ? 'linear-gradient(135deg,#6366f1,#7c3aed)'
                  : '#f5f4fe',
              color: activeTab === key ? '#fff' : '#6366f1',
              boxShadow:
                activeTab === key ? '0 4px 12px rgba(99,102,241,0.25)' : 'none',
            }}
          >
            {label} ({projects[key].length})
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 14,
        }}
      >
        {projects[activeTab].map((p, i) => (
          <ProjectCard key={i} project={p} />
        ))}
      </div>
    </div>
  );
}
