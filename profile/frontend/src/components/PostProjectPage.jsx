// ============================================================
//  POST PROJECT PAGE
//  File: src/components/PostProjectPage.jsx
// ============================================================

import React, { useEffect, useState } from 'react';
import { browseProjects, postProject } from '../services/api';
import Sidebar from './Sidebar';

const USER_ID = 2; // Replace with session user after login

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const STATUSES = [
  { val: 'open',        label: '🟢 Open' },
  { val: 'in_progress', label: '🔵 In Progress' },
  { val: 'closed',      label: '🔒 Closed' },
];

const levelColors = {
  Beginner:     { active: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Intermediate: { active: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  Advanced:     { active: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export default function PostProjectPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [domains, setDomains]         = useState([]);
  const [allSkills, setAllSkills]     = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState({
    title:            '',
    description:      '',
    domain_id:        '',
    experience_level: '',
    status:           'open',
    max_members:      5,
  });
  const [selectedSkillIds, setSelectedIds] = useState([]);
  const [newSkillNames, setNewNames]       = useState([]);
  const [skillInput, setSkillInput]        = useState('');
  const [skillDropOpen, setSkillDrop]      = useState(false);

  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  // Load domains + skills from browse endpoint
  useEffect(() => {
    browseProjects({ user_id: USER_ID, status: 'all' })
      .then(res => {
        setDomains(res.data.domains || []);
        setAllSkills(res.data.all_skills || []);
      })
      .catch(() => setError('Could not load form data. Make sure backend is running.'))
      .finally(() => setLoadingMeta(false));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  // Selected skills display (ids + custom names combined)
  const selectedSkillNames = [
    ...allSkills.filter(s => selectedSkillIds.includes(parseInt(s.id))).map(s => s.name),
    ...newSkillNames,
  ];

  const filteredSkillOptions = allSkills.filter(s =>
    s.name.toLowerCase().includes(skillInput.toLowerCase()) &&
    !selectedSkillIds.includes(parseInt(s.id))
  );

  const addExistingSkill = (skill) => {
    setSelectedIds(prev => [...prev, parseInt(skill.id)]);
    setSkillInput('');
    setSkillDrop(false);
  };

  const addCustomSkill = () => {
    const name = skillInput.trim();
    if (!name) return;
    // Check if it already exists in allSkills
    const existing = allSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!selectedSkillIds.includes(parseInt(existing.id))) {
        setSelectedIds(prev => [...prev, parseInt(existing.id)]);
      }
    } else {
      if (!newSkillNames.some(n => n.toLowerCase() === name.toLowerCase())) {
        setNewNames(prev => [...prev, name]);
      }
    }
    setSkillInput('');
    setSkillDrop(false);
  };

  const removeSkillName = (name) => {
    const existing = allSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setSelectedIds(prev => prev.filter(id => id !== parseInt(existing.id)));
    } else {
      setNewNames(prev => prev.filter(n => n !== name));
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim())       { setError('Project title is required.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (!form.domain_id)          { setError('Please select a domain.'); return; }
    if (!form.experience_level)   { setError('Please select an experience level.'); return; }

    setSaving(true);
    setError(null);
    try {
      const res = await postProject({
        user_id:          USER_ID,
        ...form,
        domain_id:        parseInt(form.domain_id),
        max_members:      parseInt(form.max_members),
        skill_ids:        selectedSkillIds,
        new_skills:       newSkillNames,
      });
      if (res.data.success) {
        setSuccess(res.data);
        // Reset form
        setForm({ title: '', description: '', domain_id: '', experience_level: '', status: 'open', max_members: 5 });
        setSelectedIds([]); setNewNames([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f4fe' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="post" onNavigate={onNavigate} />

      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', maxWidth: 860 }}>

        {/* ── HEADER ── */}
        <div className="fade-up" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
            <button
              onClick={() => onNavigate && onNavigate('browse')}
              style={{
                background: '#f5f4fe', border: 'none', borderRadius: 10,
                padding: '8px 16px', color: '#6366f1', fontWeight: 600,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >← Browse Projects</button>
            <h1 style={{
              fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800,
              color: '#1e1b4b', margin: 0,
            }}>Post a Project</h1>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 13, marginLeft: 120 }}>
            Share a project idea and find collaborators with the right skills.
          </p>
        </div>

        {/* ── SUCCESS STATE ── */}
        {success && (
          <div className="fade-up card" style={{ marginBottom: 20, border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 32 }}>🎉</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, color: '#15803d', fontSize: 16, marginBottom: 4 }}>
                  Project published!
                </div>
                <div style={{ fontSize: 13, color: '#16a34a', marginBottom: 14 }}>
                  "{success.project.title}" is now live and accepting applications.
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => onNavigate && onNavigate('project', success.project_id)}
                    style={{
                      background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: '#fff',
                      border: 'none', borderRadius: 10, padding: '9px 20px',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >View Project →</button>
                  <button
                    onClick={() => setSuccess(null)}
                    style={{
                      background: '#f5f4fe', color: '#6366f1',
                      border: 'none', borderRadius: 10, padding: '9px 18px',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >Post Another</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FORM CARD ── */}
        <div className="fade-up card" style={{ animationDelay: '0.05s' }}>

          {/* Basic Info */}
          <SectionLabel>📋 Basic Information</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px', marginBottom: 4 }}>

            <div style={{ gridColumn: '1 / -1' }}>
              <FieldLabel required>Project Title</FieldLabel>
              <input
                name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Campus Event Finder"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <FieldLabel required>Description</FieldLabel>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Describe the project goals, what contributors will build and learn…"
                style={{ ...inputStyle, height: 110, resize: 'vertical' }}
              />
            </div>

            <div>
              <FieldLabel required>Domain</FieldLabel>
              <select name="domain_id" value={form.domain_id} onChange={handleChange} style={inputStyle}>
                <option value="">Select domain…</option>
                {domains.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Max Team Members</FieldLabel>
              <input
                type="number" name="max_members" value={form.max_members}
                onChange={handleChange} min={1} max={20}
                style={inputStyle}
              />
            </div>

          </div>

          <Divider />

          {/* Experience Level */}
          <SectionLabel>🎓 Experience Level</SectionLabel>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {LEVELS.map(lvl => {
              const lc = levelColors[lvl];
              const isActive = form.experience_level === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => { setForm({ ...form, experience_level: lvl }); setError(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 20px', borderRadius: 22, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${isActive ? lc.border : '#e5e7eb'}`,
                    background: isActive ? lc.bg : '#fafafa',
                    color: isActive ? lc.active : '#6b7280',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: isActive ? lc.active : '#d1d5db', flexShrink: 0,
                  }} />
                  {lvl}
                </button>
              );
            })}
          </div>

          {/* Status */}
          <SectionLabel>📌 Project Status</SectionLabel>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {STATUSES.map(s => {
              const isActive = form.status === s.val;
              return (
                <button
                  key={s.val}
                  onClick={() => setForm({ ...form, status: s.val })}
                  style={{
                    padding: '9px 18px', borderRadius: 22, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${isActive ? '#c7d2fe' : '#e5e7eb'}`,
                    background: isActive ? '#eef2ff' : '#fafafa',
                    color: isActive ? '#6366f1' : '#6b7280',
                    transition: 'all 0.15s',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <Divider />

          {/* Skills */}
          <SectionLabel>🛠 Required Skills
            <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 8, fontSize: 12 }}>
              ({selectedSkillNames.length} selected)
            </span>
          </SectionLabel>

          {/* Selected skill tags */}
          {selectedSkillNames.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
              {selectedSkillNames.map(name => (
                <span key={name} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(124,58,237,0.1))',
                  border: '1.5px solid #c7d2fe', borderRadius: 20,
                  padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#6366f1',
                }}>
                  {name}
                  <span
                    onClick={() => removeSkillName(name)}
                    style={{ cursor: 'pointer', color: '#a5b4fc', fontSize: 15, lineHeight: 1 }}
                  >×</span>
                </span>
              ))}
            </div>
          )}

          {/* Skill picker */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input
              value={skillInput}
              onChange={e => { setSkillInput(e.target.value); setSkillDrop(true); }}
              onFocus={() => setSkillDrop(true)}
              onBlur={() => setTimeout(() => setSkillDrop(false), 150)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredSkillOptions.length > 0) addExistingSkill(filteredSkillOptions[0]);
                  else addCustomSkill();
                }
              }}
              placeholder="Search existing skills or type a new one…"
              style={inputStyle}
            />
            {skillDropOpen && (skillInput.length > 0 || filteredSkillOptions.length > 0) && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                background: '#fff', border: '1px solid #e0dcff',
                borderRadius: '0 0 10px 10px', maxHeight: 180, overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(99,102,241,0.1)',
              }}>
                {filteredSkillOptions.slice(0, 8).map(s => (
                  <div key={s.id}
                    onMouseDown={e => { e.preventDefault(); addExistingSkill(s); }}
                    style={{ padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: '#4b5563' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f4fe'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {s.name}
                  </div>
                ))}
                {skillInput.trim() && !allSkills.some(s => s.name.toLowerCase() === skillInput.toLowerCase()) && (
                  <div
                    onMouseDown={e => { e.preventDefault(); addCustomSkill(); }}
                    style={{
                      padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                      color: '#7c3aed', fontWeight: 600,
                      borderTop: '1px solid #f1f0ff',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f4fe'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    ✦ Add "{skillInput.trim()}" as new skill
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '12px 16px', color: '#dc2626',
              fontSize: 13, marginBottom: 16,
            }}>⚠️ {error}</div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving || loadingMeta}
            style={{
              width: '100%', padding: '14px',
              background: saving ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#7c3aed)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              transition: 'opacity 0.2s, transform 0.2s',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'; }}
          >
            {saving ? 'Publishing…' : '🚀 Publish Project'}
          </button>

        </div>
      </main>

      {/* Close skill dropdown on outside click */}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 700, color: '#1e1b4b',
      marginBottom: 14, marginTop: 4,
      paddingBottom: 10, borderBottom: '1px solid #f1f0ff',
    }}>
      {children}
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#f1f0ff', margin: '4px 0 20px' }} />;
}

const inputStyle = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, color: '#1e1b4b',
  outline: 'none', fontFamily: 'inherit', background: '#fafafa',
  boxSizing: 'border-box',
};