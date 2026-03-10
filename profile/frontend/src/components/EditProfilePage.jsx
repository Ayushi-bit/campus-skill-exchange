// ============================================================
//  EDIT PROFILE PAGE (v2 — includes contact fields + skills)
//  File: src/components/EditProfilePage.jsx
// ============================================================

import React, { useEffect, useState } from 'react';
import { getEditProfile, updateProfile } from '../services/api';

export default function EditProfilePage({ userId, onBack, onSaved }) {
  const [form, setForm]           = useState(null);
  const [domains, setDomains]     = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEditProfile(userId);
        const u = res.data.user;
        setForm({
          name:              u.name,
          email:             u.email,
          bio:               u.bio || '',
          profile_image:     u.profile_image || '',
          experience_level:  u.experience_level || 'Beginner',
          primary_domain_id: u.primary_domain_id || '',
          github_url:        u.github_url || '',
          linkedin_url:      u.linkedin_url || '',
          portfolio_url:     u.portfolio_url || '',
          whatsapp_number:   u.whatsapp_number || '',
        });
        setDomains(res.data.domains);
        setAllSkills(res.data.all_skills);
        setSelectedSkillIds(res.data.user_skills.map(s => parseInt(s.id)));
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
    setError(null);
  };

  const toggleSkill = (skillId) => {
    const id = parseInt(skillId);
    setSelectedSkillIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await updateProfile({ user_id: userId, ...form, skill_ids: selectedSkillIds });
      if (res.data.success) {
        setSuccess(true);
        if (onSaved) onSaved(res.data.user, res.data.skills);
        setTimeout(() => onBack(), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={s.centered}>
        <div style={s.spinner} />
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 16 }}>Loading profile...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={onBack} style={s.backBtn}>← Back to Profile</button>
        <h1 style={s.pageTitle}>Edit Profile</h1>
      </div>

      <div style={s.card}>

        {/* Avatar */}
        <div style={s.avatarSection}>
          <div style={s.avatar}>{initials}</div>
          <p style={s.avatarHint}>Avatar is generated from your name initials</p>
        </div>

        <div style={s.divider} />

        {/* ── Section: Basic Info ── */}
        <div style={s.sectionLabel}>Basic Information</div>
        <div style={s.grid}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Full Name <span style={s.required}>*</span></label>
            <input name="name" value={form.name} onChange={handleChange} style={s.input} placeholder="Your full name" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Email <span style={s.required}>*</span></label>
            <input name="email" type="email" value={form.email} onChange={handleChange} style={s.input} placeholder="your@email.com" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Experience Level</label>
            <select name="experience_level" value={form.experience_level} onChange={handleChange} style={s.input}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Primary Domain</label>
            <select name="primary_domain_id" value={form.primary_domain_id} onChange={handleChange} style={s.input}>
              <option value="">-- Select Domain --</option>
              {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={{ ...s.fieldGroup, gridColumn: '1 / -1' }}>
            <label style={s.label}>Profile Image URL</label>
            <input name="profile_image" value={form.profile_image} onChange={handleChange} style={s.input} placeholder="https://example.com/photo.jpg (optional)" />
          </div>
          <div style={{ ...s.fieldGroup, gridColumn: '1 / -1' }}>
            <label style={s.label}>Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} style={{ ...s.input, height: 100, resize: 'vertical' }} placeholder="Tell others about yourself..." />
          </div>
        </div>

        <div style={s.divider} />

        {/* ── Section: Contact Links ── */}
        <div style={s.sectionLabel}>Contact & Social Links</div>
        <div style={s.grid}>
          <div style={s.fieldGroup}>
            <label style={s.label}>🐙 GitHub URL</label>
            <input name="github_url" value={form.github_url} onChange={handleChange} style={s.input} placeholder="https://github.com/username" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>💼 LinkedIn URL</label>
            <input name="linkedin_url" value={form.linkedin_url} onChange={handleChange} style={s.input} placeholder="https://linkedin.com/in/username" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>🌐 Portfolio URL</label>
            <input name="portfolio_url" value={form.portfolio_url} onChange={handleChange} style={s.input} placeholder="https://yourportfolio.com" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>💬 WhatsApp Number</label>
            <input name="whatsapp_number" value={form.whatsapp_number} onChange={handleChange} style={s.input} placeholder="+91 98765 43210" />
          </div>
        </div>

        <div style={s.divider} />

        {/* ── Section: Skills ── */}
        <div style={s.sectionLabel}>
          Skills
          <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 8, fontSize: 13 }}>
            ({selectedSkillIds.length} selected — click to toggle)
          </span>
        </div>
        <div style={{ ...s.skillsGrid, marginBottom: 24 }}>
          {allSkills.map(skill => {
            const isSelected = selectedSkillIds.includes(parseInt(skill.id));
            return (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                style={{
                  ...s.skillChip,
                  background: isSelected ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : '#f5f4fe',
                  color:      isSelected ? '#fff' : '#6366f1',
                  border:     isSelected ? '1.5px solid #6366f1' : '1.5px solid #e0dcff',
                  boxShadow:  isSelected ? '0 2px 8px rgba(99,102,241,0.25)' : 'none',
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                {isSelected ? '✓ ' : ''}{skill.name}
              </button>
            );
          })}
        </div>

        {error   && <div style={s.errorBox}>⚠️ {error}</div>}
        {success && <div style={s.successBox}>✅ Profile saved! Redirecting back...</div>}

        <div style={s.actions}>
          <button onClick={onBack} style={s.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : '✓ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:        { flex: 1, padding: '32px 28px', maxWidth: 820, overflowY: 'auto' },
  centered:    { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner:     { width: 44, height: 44, border: '4px solid #ede9fe', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  header:      { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  pageTitle:   { fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: '#1e1b4b', margin: 0 },
  backBtn:     { background: '#f5f4fe', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#6366f1', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  card:        { background: '#fff', borderRadius: 20, padding: '32px 36px', boxShadow: '0 4px 24px rgba(99,102,241,0.08)', border: '1px solid #ede9fe' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 },
  avatar:      { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0 },
  avatarHint:  { fontSize: 13, color: '#9ca3af', margin: 0 },
  divider:     { height: 1, background: '#f1f0ff', marginBottom: 20, marginTop: 4 },
  sectionLabel:{ fontSize: 14, fontWeight: 700, color: '#1e1b4b', marginBottom: 16 },
  grid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px', marginBottom: 20 },
  fieldGroup:  { display: 'flex', flexDirection: 'column', gap: 6 },
  label:       { fontSize: 13, fontWeight: 600, color: '#4b5563' },
  required:    { color: '#ef4444' },
  input:       { border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#1e1b4b', outline: 'none', fontFamily: 'inherit', background: '#fafafa', width: '100%', boxSizing: 'border-box' },
  skillsGrid:  { display: 'flex', flexWrap: 'wrap', gap: 8 },
  skillChip:   { borderRadius: 20, padding: '6px 16px', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' },
  errorBox:    { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 },
  successBox:  { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', color: '#16a34a', fontSize: 13, marginBottom: 16 },
  actions:     { display: 'flex', justifyContent: 'flex-end', gap: 12 },
  cancelBtn:   { background: '#f5f4fe', border: 'none', borderRadius: 12, padding: '10px 24px', color: '#6366f1', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  saveBtn:     { background: 'linear-gradient(135deg, #6366f1, #7c3aed)', border: 'none', borderRadius: 12, padding: '10px 28px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },
};
