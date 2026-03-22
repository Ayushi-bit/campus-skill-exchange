import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import SkillTag from './SkillTag';
import StatusBadge from './StatusBadge';
import { useToast } from './Toast';
import { postProject, browseProjects } from '../services/api';

const LEVELS   = ['Beginner', 'Intermediate', 'Advanced'];
const STATUSES = [
  { value: 'open',        label: '🟢 Open' },
  { value: 'in_progress', label: '🔵 In Progress' },
  { value: 'completed',   label: '✅ Completed' },
  { value: 'closed',      label: '🔒 Closed' },
];
const levelColors = { Beginner: 'var(--success)', Intermediate: 'var(--warning)', Advanced: 'var(--danger)' };

export default function PostProjectPage({ userId, currentUser, onNavigate, onLogout }) {
  const toast = useToast();

  const [domains, setDomains]     = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  const [form, setForm] = useState({
    title: '', description: '', domain_id: '',
    experience_level: 'Beginner', status: 'open', max_members: 5,
  });

  const [selectedSkillIds,   setSelectedSkillIds]   = useState([]);
  const [selectedNewSkills,  setSelectedNewSkills]  = useState([]);
  const [skillSearch,        setSkillSearch]        = useState('');
  const [skillDropOpen,      setSkillDropOpen]      = useState(false);
  const [customSkill,        setCustomSkill]        = useState('');

  useEffect(() => {
    browseProjects({ user_id: userId })
      .then(res => {
        if (res.data.domains)    setDomains(res.data.domains);
        if (res.data.all_skills) setAllSkills(res.data.all_skills);
      }).catch(() => {});
  }, [userId]);

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: '' })); };

  const selectedSkillNames = [
    ...allSkills.filter(s => selectedSkillIds.includes(s.id)).map(s => s.name),
    ...selectedNewSkills,
  ];

  const addExisting = (skill) => {
    if (!selectedSkillIds.includes(skill.id)) setSelectedSkillIds(ids => [...ids, skill.id]);
    setSkillSearch(''); setSkillDropOpen(false);
  };

  const addCustom = () => {
    const name = customSkill.trim();
    if (!name) return;
    const found = allSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (found) addExisting(found);
    else if (!selectedNewSkills.includes(name)) setSelectedNewSkills(s => [...s, name]);
    setCustomSkill('');
  };

  const removeSkill = (name) => {
    const found = allSkills.find(s => s.name === name);
    if (found) setSelectedSkillIds(ids => ids.filter(id => id !== found.id));
    else setSelectedNewSkills(s => s.filter(x => x !== name));
  };

  const filteredSkills = allSkills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkillIds.includes(s.id)
  );

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.domain_id)          e.domain_id   = 'Please select a domain';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await postProject({
        user_id: userId, title: form.title.trim(),
        description: form.description.trim(), domain_id: Number(form.domain_id),
        experience_level: form.experience_level, status: form.status,
        max_members: Number(form.max_members),
        skill_ids: selectedSkillIds, new_skills: selectedNewSkills,
      });
      if (res.data.success) { toast('Project published! 🚀', 'success'); setTimeout(() => onNavigate('myprojects'), 1000); }
      else toast(res.data.error || 'Failed to post project', 'error');
    } catch (e) { toast(e.response?.data?.error || 'Failed to post project', 'error'); }
    finally { setLoading(false); }
  };

  // Live preview domain name
  const previewDomain = domains.find(d => d.id === Number(form.domain_id));

  return (
    <div className="app-layout">
      <Sidebar currentPage="post" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="main-content page-enter">
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: 26 }}>Post a Project 🚀</h1>
            <p>Share your project and find talented collaborators</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }}>
          {/* ── FORM ── */}
          <div>
            {/* Basic Info */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>📋 Basic Information</h3>
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input className={`form-input ${errors.title ? 'error' : ''}`} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Campus Event Finder" />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Domain *</label>
                <select className={`form-input ${errors.domain_id ? 'error' : ''}`} value={form.domain_id} onChange={e => set('domain_id', e.target.value)}>
                  <option value="">Select a domain...</option>
                  {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.domain_id && <span className="form-error">{errors.domain_id}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className={`form-input ${errors.description ? 'error' : ''}`} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the project goals, what contributors will learn..." style={{ minHeight: 110 }} />
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>
            </div>

            {/* Experience & Status */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>🎓 Experience & Status</h3>
              <div className="form-group">
                <label className="form-label">Experience Level *</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {LEVELS.map(lvl => (
                    <button key={lvl} type="button" onClick={() => set('experience_level', lvl)} style={{
                      padding: '9px 20px', borderRadius: 22, border: `2px solid ${form.experience_level === lvl ? levelColors[lvl] : 'var(--border)'}`,
                      background: form.experience_level === lvl ? `${levelColors[lvl]}15` : 'var(--surface)',
                      color: form.experience_level === lvl ? levelColors[lvl] : 'var(--muted)',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      {lvl === 'Beginner' ? '🟢' : lvl === 'Intermediate' ? '🟡' : '🔴'} {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Project Status</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUSES.map(s => (
                    <button key={s.value} type="button" onClick={() => set('status', s.value)} style={{
                      padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${form.status === s.value ? 'var(--orange)' : 'var(--border)'}`,
                      background: form.status === s.value ? 'var(--orange-dim)' : 'var(--surface)',
                      color: form.status === s.value ? 'var(--orange)' : 'var(--muted)',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                    }}>{s.label}</button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ maxWidth: 180 }}>
                <label className="form-label">Max Team Members</label>
                <input type="number" className="form-input" min={1} max={20} value={form.max_members} onChange={e => set('max_members', e.target.value)} />
              </div>
            </div>

            {/* Skills */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>🛠 Required Skills</h3>
              {selectedSkillNames.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {selectedSkillNames.map(s => <SkillTag key={s} name={s} removable onRemove={() => removeSkill(s)} />)}
                </div>
              )}
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label className="form-label" style={{ marginBottom: 6 }}>Pick Existing Skill</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" style={{ fontSize: 13 }} placeholder="Search skills..." value={skillSearch}
                      onChange={e => { setSkillSearch(e.target.value); setSkillDropOpen(true); }}
                      onFocus={() => setSkillDropOpen(true)}
                      onBlur={() => setTimeout(() => setSkillDropOpen(false), 200)}
                    />
                    {skillDropOpen && filteredSkills.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', maxHeight: 180, overflowY: 'auto', zIndex: 50, boxShadow: 'var(--shadow)' }}>
                        {filteredSkills.slice(0, 15).map(s => (
                          <div key={s.id} onMouseDown={() => addExisting(s)}
                            style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >{s.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ marginBottom: 6 }}>Add Custom Skill</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" style={{ fontSize: 13 }} placeholder="e.g. FastAPI..." value={customSkill}
                      onChange={e => setCustomSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCustom()}
                    />
                    <button className="btn btn-ghost btn-sm" onClick={addCustom}>+ Add</button>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={loading}>
              {loading ? '⏳ Publishing...' : '🚀 Publish Project'}
            </button>
          </div>

          {/* ── LIVE PREVIEW ── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div className="form-label" style={{ marginBottom: 10 }}>👁 Live Preview</div>
            <div className="card" style={{ opacity: form.title ? 1 : 0.5, transition: 'opacity 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--orange-dim)', color: 'var(--orange)', fontSize: 11, fontWeight: 700 }}>
                  {previewDomain?.name || 'Domain'}
                </span>
                <StatusBadge status={form.status || 'open'} />
              </div>
              <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--brown)' }}>{form.title || 'Project Title'}</h3>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {form.description || 'Your description will appear here...'}
              </p>
              {selectedSkillNames.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {selectedSkillNames.slice(0, 4).map(s => <SkillTag key={s} name={s} small />)}
                  {selectedSkillNames.length > 4 && <span style={{ fontSize: 11, color: 'var(--muted)', padding: '2px 6px' }}>+{selectedSkillNames.length - 4}</span>}
                </div>
              )}
              <div className="divider" style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--muted)' }}>
                <span>🎓 {form.experience_level}</span>
                <span>👥 0/{form.max_members}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
