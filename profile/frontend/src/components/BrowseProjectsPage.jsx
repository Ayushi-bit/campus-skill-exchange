// ============================================================
//  BROWSE PROJECTS PAGE
//  File: src/components/BrowseProjectsPage.jsx
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { browseProjects } from '../services/api';
import Sidebar from './Sidebar';

 // Replace with session user after login

const statusColors = {
  'Open':        { bg: '#e8f5e9', color: '#2e7d32' },
  'In progress': { bg: '#fff8e1', color: '#f57f17' },
  'In Progress': { bg: '#fff8e1', color: '#f57f17' },
  'Completed':   { bg: '#e3f2fd', color: '#1565c0' },
};

const levelColors = {
  'Beginner':     { bg: '#f0fdf4', color: '#16a34a' },
  'Intermediate': { bg: '#fffbeb', color: '#d97706' },
  'Advanced':     { bg: '#fef2f2', color: '#dc2626' },
};

export default function BrowseProjectsPage({ userId, currentUser, onNavigate, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Filters
  const [search, setSearch]           = useState('');
  const [domainId, setDomainId]       = useState(0);
  const [experience, setExperience]   = useState('');
  const [statusFilter, setStatus]     = useState('open');
  const [selectedSkills, setSelected] = useState([]);
  const [searchMode, setSearchMode]   = useState('any');
  const [skillInput, setSkillInput]   = useState('');
  const [skillDropOpen, setSkillDrop] = useState(false);

  const fetchProjects = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        user_id:          userId,
        domain_id:        overrides.domainId    ?? domainId,
        experience_level: overrides.experience  ?? experience,
        search:           overrides.search      ?? search,
        status:           overrides.status      ?? statusFilter,
        skills:           (overrides.skills     ?? selectedSkills).join(','),
        search_mode:      overrides.searchMode  ?? searchMode,
      };
      const res = await browseProjects(params);
      setData(res.data);
    } catch {
      setError('Could not load projects. Make sure your backend is running.');
    } finally {
      setLoading(false);
    }
  }, [domainId, experience, search, statusFilter, selectedSkills, searchMode]);

  useEffect(() => { fetchProjects(); }, []);

  const handleSearch = () => fetchProjects();

  const handleClear = () => {
    setSearch(''); setDomainId(0); setExperience('');
    setStatus('open'); setSelected([]); setSearchMode('any');
    fetchProjects({
      search: '', domainId: 0, experience: '',
      status: 'open', skills: [], searchMode: 'any',
    });
  };

  const addSkill = (name) => {
    if (!name.trim()) return;
    if (selectedSkills.some(s => s.toLowerCase() === name.toLowerCase())) return;
    setSelected(prev => [...prev, name.trim()]);
    setSkillInput('');
    setSkillDrop(false);
  };

  const removeSkill = (name) => setSelected(prev => prev.filter(s => s !== name));

  const filteredSkillOptions = data?.all_skills?.filter(s =>
    s.name.toLowerCase().includes(skillInput.toLowerCase()) &&
    !selectedSkills.some(sel => sel.toLowerCase() === s.name.toLowerCase())
  ) || [];

  if (error) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="browse" onNavigate={onNavigate} onLogout={onLogout} currentUser={currentUser} />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 16, padding: '32px 40px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>
        </div>
      </main>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f4fe' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="browse" onNavigate={onNavigate} onLogout={onLogout} currentUser={currentUser} />

      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>

        {/* ── HEADER BANNER ── */}
        <div className="fade-up" style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          borderRadius: 20, padding: '28px 32px', color: '#fff',
          marginBottom: 24, position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(15,23,42,0.25)',
        }}>
          {/* Grid texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                Browse Projects 🔍
              </div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                {loading ? 'Loading…' : `${data?.total ?? 0} project${data?.total !== 1 ? 's' : ''} found`}
              </div>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('post')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 10, padding: '9px 20px',
                color: '#fff', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ✦ Post a Project
            </button>
          </div>
        </div>

        {/* ── SPLIT LAYOUT: filters left, results right ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

          {/* ── FILTER PANEL ── */}
          <div className="fade-up card" style={{ animationDelay: '0.05s', position: 'sticky', top: 20 }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: '#1e1b4b', marginBottom: 20 }}>
              Filters
            </div>

            {/* Search */}
            <FilterGroup label="Search">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Title or keyword…"
                style={inputStyle}
              />
            </FilterGroup>

            {/* Domain */}
            <FilterGroup label="Domain">
              <select value={domainId} onChange={e => setDomainId(parseInt(e.target.value))} style={inputStyle}>
                <option value={0}>All Domains</option>
                {data?.domains?.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </FilterGroup>

            {/* Experience */}
            <FilterGroup label="Experience Level">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <label key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="radio"
                      name="experience"
                      value={lvl}
                      checked={experience === lvl}
                      onChange={() => setExperience(lvl)}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <span style={{ color: lvl === '' ? '#9ca3af' : '#1e1b4b' }}>
                      {lvl === '' ? 'All Levels' : lvl}
                    </span>
                  </label>
                ))}
              </div>
            </FilterGroup>

            {/* Status */}
            <FilterGroup label="Status">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { val: 'open',        label: '🟢 Open Only' },
                  { val: 'in_progress', label: '🔵 In Progress' },
                  { val: 'all',         label: '📋 All Statuses' },
                ].map(s => (
                  <label key={s.val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="radio"
                      name="status"
                      value={s.val}
                      checked={statusFilter === s.val}
                      onChange={() => setStatus(s.val)}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <span style={{ color: '#1e1b4b' }}>{s.label}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>

            {/* Skills */}
            <FilterGroup label="Required Skills">
              {/* Selected skill tags */}
              {selectedSkills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {selectedSkills.map(sk => (
                    <span key={sk} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: '#eef2ff', color: '#6366f1',
                      border: '1px solid #c7d2fe',
                      borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                    }}>
                      {sk}
                      <span
                        onClick={() => removeSkill(sk)}
                        style={{ cursor: 'pointer', color: '#a5b4fc', fontSize: 14, lineHeight: 1 }}
                      >×</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Skill input with dropdown */}
              <div style={{ position: 'relative' }}>
                <input
                  value={skillInput}
                  onChange={e => { setSkillInput(e.target.value); setSkillDrop(true); }}
                  onFocus={() => setSkillDrop(true)}
                  onBlur={() => setTimeout(() => setSkillDrop(false), 150)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (filteredSkillOptions.length > 0) addSkill(filteredSkillOptions[0].name); else addSkill(skillInput); }}}
                  placeholder="Search or add skill…"
                  style={inputStyle}
                />
                {skillDropOpen && filteredSkillOptions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: '#fff', border: '1px solid #e0dcff',
                    borderRadius: '0 0 10px 10px', maxHeight: 160, overflowY: 'auto',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.1)',
                  }}>
                    {filteredSkillOptions.slice(0, 8).map(s => (
                      <div
                        key={s.id}
                        onMouseDown={e => { e.preventDefault(); addSkill(s.name); }}
                        style={{
                          padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                          color: '#4b5563',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f4fe'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FilterGroup>

            {/* Search mode toggle */}
            <FilterGroup label="Match Mode">
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { val: 'any', label: 'Match ANY' },
                  { val: 'all', label: 'Match ALL' },
                ].map(m => (
                  <button
                    key={m.val}
                    onClick={() => setSearchMode(m.val)}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                      background: searchMode === m.val ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#f5f4fe',
                      color: searchMode === m.val ? '#fff' : '#6366f1',
                    }}
                  >{m.label}</button>
                ))}
              </div>
            </FilterGroup>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <button
                onClick={handleSearch}
                style={{
                  background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '11px', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}
              >
                🔍 Search
              </button>
              <button
                onClick={handleClear}
                style={{
                  background: '#f5f4fe', color: '#6b7280', border: 'none',
                  borderRadius: 10, padding: '9px',
                  fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* ── RESULTS PANEL ── */}
          <div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                <div style={{
                  width: 44, height: 44, border: '4px solid #ede9fe',
                  borderTop: '4px solid #6366f1', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', marginBottom: 14,
                }} />
                <p style={{ color: '#6b7280', fontSize: 14 }}>Finding projects…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : data?.projects?.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 700, color: '#1e1b4b', fontSize: 16, marginBottom: 8 }}>No projects found</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>Try adjusting your filters or clearing the search</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.projects.map((p, i) => (
                  <ProjectBrowseCard
                    key={p.id}
                    project={p}
                    onNavigate={onNavigate}
                    delay={i * 0.04}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

// ── Project card for browse results ───────────────────────
function ProjectBrowseCard({ project, onNavigate, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const sc  = statusColors[project.status]           || { bg: '#f3f4f6', color: '#6b7280' };
  const lc  = levelColors[project.experience_level]  || { bg: '#f3f4f6', color: '#6b7280' };

  const isOwner  = project.is_owner;
  const appStatus = project.application_status;

  return (
    <div
      className="fade-up"
      onClick={() => onNavigate && onNavigate('project', project.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px 22px',
        border: `1px solid ${hovered ? '#c7d2fe' : '#f1f0ff'}`,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
        boxShadow: hovered ? '0 6px 24px rgba(99,102,241,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        animationDelay: `${delay}s`,
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, color: '#1e1b4b', fontSize: 15, lineHeight: 1.3 }}>
          {project.title}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
            {project.status}
          </span>
          <span style={{ background: lc.bg, color: lc.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
            {project.experience_level}
          </span>
        </div>
      </div>

      {/* Description preview */}
      <p style={{
        fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 12,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {project.description}
      </p>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#9ca3af', marginBottom: 12, flexWrap: 'wrap' }}>
        <span>📂 {project.domain}</span>
        <span>👥 {project.member_count}/{project.max_members} members</span>
        <span>📨 {project.applicant_count} applicants</span>
        <span>🕒 {project.date}</span>
        <span>by <strong style={{ color: '#6366f1' }}>{project.owner_name}</strong></span>
      </div>

      {/* Skills */}
      {project.skills.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {project.skills.slice(0, 4).map((sk, i) => (
            <span key={i} style={{
              background: '#f5f4fe', color: '#6366f1',
              border: '1px solid #e0dcff',
              borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
            }}>{sk}</span>
          ))}
          {project.skills.length > 4 && (
            <span style={{ background: '#f3f4f6', color: '#9ca3af', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>
              +{project.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer: owner badge OR application status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {isOwner && (
            <span style={{
              background: '#eef2ff', color: '#6366f1',
              borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700,
            }}>📌 Your Project</span>
          )}
          {!isOwner && appStatus && (
            <span style={{
              background: appStatus === 'accepted' ? '#f0fdf4' : appStatus === 'rejected' ? '#fef2f2' : '#fffbeb',
              color:      appStatus === 'accepted' ? '#16a34a' : appStatus === 'rejected' ? '#dc2626' : '#d97706',
              borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700,
            }}>
              {appStatus === 'accepted' ? '✅ Accepted' : appStatus === 'rejected' ? '❌ Rejected' : '⏳ Applied'}
            </span>
          )}
        </div>
        <span style={{
          fontSize: 12, color: hovered ? '#6366f1' : '#9ca3af',
          fontWeight: 600, transition: 'color 0.15s',
        }}>
          View Details →
        </span>
      </div>
    </div>
  );
}

// ── Small reusable filter group ────────────────────────────
function FilterGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8,
  padding: '8px 12px', fontSize: 13, color: '#1e1b4b',
  outline: 'none', fontFamily: 'inherit', background: '#fafafa',
  boxSizing: 'border-box',
};