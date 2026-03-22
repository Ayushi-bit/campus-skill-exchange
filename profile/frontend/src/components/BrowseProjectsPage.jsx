import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import StatusBadge from './StatusBadge';
import SkillTag from './SkillTag';
import StarRating from './StarRating';
import { SkeletonGrid } from './LoadingSkeleton';
import { browseProjects } from '../services/api';

function ProjectCard({ project, onNavigate }) {
  const appStatus = project.application_status;
  const isOwner   = project.is_owner;

  const appBadge = () => {
    if (isOwner) return { label: '👑 My Project', color: 'var(--brown)', bg: 'var(--orange-dim)' };
    if (appStatus === 'pending')  return { label: '⏳ Applied', color: 'var(--warning)', bg: 'var(--warning-bg)' };
    if (appStatus === 'accepted') return { label: '✅ Accepted', color: 'var(--success)', bg: 'var(--success-bg)' };
    if (appStatus === 'rejected') return { label: '❌ Rejected', color: 'var(--danger)', bg: 'var(--danger-bg)' };
    return null;
  };
  const badge = appBadge();

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0, transition: 'all 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--skin)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      onClick={() => onNavigate('project', project.id)}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--orange-dim)', color: 'var(--orange)', fontSize: 11, fontWeight: 700 }}>
          {project.domain}
        </span>
        <StatusBadge status={project.status} />
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 15, marginBottom: 8, lineHeight: 1.35, color: 'var(--brown)' }}>{project.title}</h3>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12, flex: 1,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description}
      </p>

      {/* Skills */}
      {project.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
          {project.skills.slice(0, 4).map(s => <SkillTag key={s} name={s} small />)}
          {project.skills.length > 4 && (
            <span style={{ fontSize: 11, color: 'var(--muted)', padding: '2px 8px', background: 'var(--surface)', borderRadius: 12 }}>
              +{project.skills.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="divider" style={{ margin: '10px 0' }} />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--muted)' }}>
          <span>🎓 {project.experience_level}</span>
          <span>👥 {project.member_count}/{project.max_members}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange), var(--skin))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 700 }}>
              {project.owner_name?.[0]?.toUpperCase()}
            </div>
            <span>{project.owner_name}</span>
          </div>
        </div>
        {badge ? (
          <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, color: badge.color, background: badge.bg }}>
            {badge.label}
          </span>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)' }}>View Details →</span>
        )}
      </div>
    </div>
  );
}

const EXPERIENCE_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const STATUS_OPTIONS    = ['open', 'in_progress', 'completed', 'all'];

export default function BrowseProjectsPage({ userId, currentUser, onNavigate, onLogout }) {
  const [projects, setProjects]   = useState([]);
  const [domains, setDomains]     = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);

  // Filters
  const [search, setSearch]       = useState('');
  const [domainId, setDomainId]   = useState(0);
  const [experience, setExperience] = useState('All');
  const [status, setStatus]       = useState('open');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [searchMode, setSearchMode] = useState('any');
  const [skillDropOpen, setSkillDropOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        user_id:          userId,
        search:           search,
        domain_id:        domainId || '',
        experience_level: experience === 'All' ? '' : experience,
        skills:           selectedSkills.join(','),
        search_mode:      searchMode,
        status:           status,
      };
      const res = await browseProjects(params);
      setProjects(res.data.projects || []);
      setTotal(res.data.total || 0);
      if (res.data.domains?.length) setDomains(res.data.domains);
      if (res.data.all_skills?.length) setAllSkills(res.data.all_skills);
    } catch (_) {}
    finally { setLoading(false); }
  }, [userId, search, domainId, experience, selectedSkills, searchMode, status]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const addSkill = (name) => {
    if (!selectedSkills.includes(name)) setSelectedSkills(s => [...s, name]);
    setSkillSearch('');
    setSkillDropOpen(false);
  };
  const removeSkill = (name) => setSelectedSkills(s => s.filter(x => x !== name));

  const clearAll = () => {
    setSearch(''); setDomainId(0); setExperience('All');
    setSelectedSkills([]); setSearchMode('any'); setStatus('open');
  };

  const filteredSkillOptions = allSkills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkills.includes(s.name)
  );

  return (
    <div className="app-layout">
      <Sidebar currentPage="browse" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="main-content page-enter">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: 26 }}>Browse Projects 🔍</h1>
            <p>Find projects that match your skills and interests</p>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate('post')}>➕ Post a Project</button>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--muted)' }}>🔍</span>
          <input
            className="form-input"
            style={{ paddingLeft: 40, fontSize: 15, height: 48 }}
            placeholder="Search projects by name, description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}>×</button>
          )}
        </div>

        {/* Filters row */}
        <div className="card" style={{ marginBottom: 20, padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>

            {/* Domain */}
            <div style={{ flex: '1 1 160px' }}>
              <div className="form-label" style={{ marginBottom: 6 }}>Domain</div>
              <select className="form-input" value={domainId} onChange={e => setDomainId(Number(e.target.value))}>
                <option value={0}>All Domains</option>
                {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            {/* Status */}
            <div style={{ flex: '1 1 140px' }}>
              <div className="form-label" style={{ marginBottom: 6 }}>Status</div>
              <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="all">All</option>
              </select>
            </div>

            {/* Experience */}
            <div style={{ flex: '1 1 280px' }}>
              <div className="form-label" style={{ marginBottom: 6 }}>Experience Level</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {EXPERIENCE_LEVELS.map(lvl => (
                  <button key={lvl} onClick={() => setExperience(lvl)} style={{
                    padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${experience === lvl ? 'var(--orange)' : 'var(--border)'}`,
                    background: experience === lvl ? 'var(--orange-dim)' : 'transparent',
                    color: experience === lvl ? 'var(--orange)' : 'var(--muted)',
                    transition: 'all 0.15s',
                  }}>{lvl}</button>
                ))}
              </div>
            </div>

            {/* Match mode */}
            <div>
              <div className="form-label" style={{ marginBottom: 6 }}>Match Mode</div>
              <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 8, padding: 3 }}>
                {['any', 'all'].map(mode => (
                  <button key={mode} onClick={() => setSearchMode(mode)} style={{
                    padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: searchMode === mode ? 'var(--white)' : 'transparent',
                    color: searchMode === mode ? 'var(--orange)' : 'var(--muted)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: searchMode === mode ? 'var(--shadow-sm)' : 'none',
                  }}>
                    {mode === 'any' ? 'Match ANY' : 'Match ALL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear button */}
            <button className="btn btn-secondary btn-sm" onClick={clearAll}>✕ Clear</button>
          </div>

          {/* Skills filter */}
          <div style={{ marginTop: 14 }}>
            <div className="form-label" style={{ marginBottom: 8 }}>Filter by Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: selectedSkills.length ? 8 : 0 }}>
              {selectedSkills.map(s => (
                <SkillTag key={s} name={s} removable onRemove={() => removeSkill(s)} />
              ))}
            </div>
            <div style={{ position: 'relative', maxWidth: 300 }}>
              <input
                className="form-input"
                style={{ fontSize: 13 }}
                placeholder="Add skill filter..."
                value={skillSearch}
                onChange={e => { setSkillSearch(e.target.value); setSkillDropOpen(true); }}
                onFocus={() => setSkillDropOpen(true)}
                onBlur={() => setTimeout(() => setSkillDropOpen(false), 200)}
              />
              {skillDropOpen && filteredSkillOptions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', maxHeight: 160, overflowY: 'auto', zIndex: 50, boxShadow: 'var(--shadow)' }}>
                  {filteredSkillOptions.slice(0, 15).map(s => (
                    <div key={s.id} onMouseDown={() => addSkill(s.name)}
                      style={{ padding: '7px 14px', cursor: 'pointer', fontSize: 13, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >{s.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>
            Found <strong style={{ color: 'var(--brown)' }}>{total}</strong> project{total !== 1 ? 's' : ''}
          </div>
        )}

        {/* Projects grid */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No projects found</h3>
            <p>Try adjusting your filters or search terms.</p>
            <button className="btn btn-primary btn-sm" onClick={clearAll}>Clear Filters</button>
          </div>
        ) : (
          <div className="grid-3">
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
