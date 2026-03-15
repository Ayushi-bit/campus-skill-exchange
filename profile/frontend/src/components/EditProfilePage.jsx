// ============================================================
//  EDIT PROFILE PAGE (v3 — email OTP, change password, delete)
//  File: src/components/EditProfilePage.jsx
// ============================================================

import React, { useEffect, useState, useRef } from 'react';
import { getEditProfile, updateProfile, sendEmailOtp, verifyEmailOtp } from '../services/api';
import EmailVerifyModal from './EmailVerifyModal';
import DeleteAccountModal from './DeleteAccountModal';
import ChangePasswordModal from './ChangePasswordModal';

export default function EditProfilePage({ userId, currentUser, onBack, onSaved, onDeleted }) {
  const [form, setForm]           = useState(null);
  const [domains, setDomains]     = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(false);
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal]     = useState(false);
  const [emailOtpError, setEmailOtpError]       = useState('');
  const [otpLoading, setOtpLoading]             = useState(false);
  const [pendingFormData, setPendingFormData]   = useState(null);

  // Use ref to track if component is still mounted
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEditProfile(userId);
        const u = res.data.user;
        if (!isMounted.current) return;
        setForm({
          name:              u.name || '',
          email:             u.email || '',
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
        if (isMounted.current) setError("Failed to load profile data.");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError(null);
  };

  const toggleSkill = (skillId) => {
    const id = parseInt(skillId);
    setSelectedSkillIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = { user_id: userId, ...form, skill_ids: selectedSkillIds, action: 'save' };

    try {
      const res = await updateProfile(payload);
      if (res.data.success) {
        if (onSaved) onSaved(res.data.user, res.data.skills);
        setSuccess(true);
        setSaving(false);
        setTimeout(() => {
          if (isMounted.current) onBack();
        }, 1500);
      }
    } catch (err) {
      const data = err.response?.data;
      setSaving(false);

      if (data?.email_changed) {
        setError(null);
        const pending = { user_id: userId, ...form, skill_ids: selectedSkillIds };
        setPendingFormData(pending);
        try {
          await sendEmailOtp(pending);
          if (isMounted.current) setShowEmailModal(true);
        } catch (otpErr) {
          if (isMounted.current) setError(otpErr.response?.data?.error || "Failed to send OTP. Please try again.");
        }
        return;
      }
      setError(data?.error || "Failed to save. Please try again.");
    }
  };

  const handleVerifyOtp = async (otp) => {
    if (otpLoading) return;
    setOtpLoading(true);
    setEmailOtpError('');
    try {
      const res = await verifyEmailOtp({ ...pendingFormData, otp });
      if (res.data.success) {
        if (onSaved) onSaved(res.data.user, res.data.skills);
        setShowEmailModal(false);
        setPendingFormData(null);
        setOtpLoading(false);
        setSuccess(true);
        setTimeout(() => {
          if (isMounted.current) onBack();
        }, 1500);
      }
    } catch (err) {
      setEmailOtpError(err.response?.data?.error || "Invalid OTP. Please try again.");
      setOtpLoading(false);
    }
  };

  if (loading) return (
    <div style={s.centered}>
      <div style={s.spinner} />
      <p style={{ color: '#6b7280', fontSize: 14, marginTop: 16 }}>Loading profile...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!form) return null;

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

        {/* Basic Info */}
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

        {/* Contact Links */}
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

        {/* Skills */}
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

        {/* Actions */}
        <div style={s.actions}>
          <button onClick={onBack} disabled={saving} style={s.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving || success} style={{ ...s.saveBtn, opacity: saving || success ? 0.7 : 1 }}>
            {saving ? 'Saving...' : success ? 'Saved! ✓' : '✓ Save Changes'}
          </button>
        </div>
      </div>

      {/* Security */}
      <div style={{ ...s.dangerCard, border: '1px solid #ede9fe', boxShadow: '0 4px 24px rgba(99,102,241,0.08)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', marginBottom: 4 }}>🔒 Change Password</div>
            <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>
              {currentUser?.is_google_user
                ? 'You signed in with Google. You can set a password to also log in with email.'
                : 'Update your password to keep your account secure.'}
            </div>
          </div>
          <button onClick={() => setShowPasswordModal(true)} style={{ ...s.deleteBtn, color: '#6366f1', borderColor: '#6366f1' }}>
            Change Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={s.dangerCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#7f1d1d', marginBottom: 4 }}>🗑 Delete Account</div>
            <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>
              Permanently delete your account and all associated data. This cannot be undone.
            </div>
          </div>
          <button onClick={() => setShowDeleteModal(true)} style={s.deleteBtn}>Delete Account</button>
        </div>
      </div>

      {/* Modals */}
      {showEmailModal && pendingFormData && (
        <EmailVerifyModal
          newEmail={pendingFormData.email}
          onVerify={handleVerifyOtp}
          onClose={() => { setShowEmailModal(false); setEmailOtpError(''); setPendingFormData(null); }}
          loading={otpLoading}
          error={emailOtpError}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          userId={userId}
          isGoogleUser={currentUser?.is_google_user || false}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          userId={userId}
          isGoogleUser={currentUser?.is_google_user || false}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={onDeleted}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  page:          { flex: 1, padding: '32px 28px', maxWidth: 820, overflowY: 'auto' },
  centered:      { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner:       { width: 44, height: 44, border: '4px solid #ede9fe', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  header:        { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  pageTitle:     { fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: '#1e1b4b', margin: 0 },
  backBtn:       { background: '#f5f4fe', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#6366f1', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  card:          { background: '#fff', borderRadius: 20, padding: '32px 36px', boxShadow: '0 4px 24px rgba(99,102,241,0.08)', border: '1px solid #ede9fe', marginBottom: 24 },
  avatarSection: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 },
  avatar:        { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0 },
  avatarHint:    { fontSize: 13, color: '#9ca3af', margin: 0 },
  divider:       { height: 1, background: '#f1f0ff', marginBottom: 20, marginTop: 4 },
  sectionLabel:  { fontSize: 14, fontWeight: 700, color: '#1e1b4b', marginBottom: 16 },
  grid:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px', marginBottom: 20 },
  fieldGroup:    { display: 'flex', flexDirection: 'column', gap: 6 },
  label:         { fontSize: 13, fontWeight: 600, color: '#4b5563' },
  required:      { color: '#ef4444' },
  input:         { border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#1e1b4b', outline: 'none', fontFamily: 'inherit', background: '#fafafa', width: '100%', boxSizing: 'border-box' },
  skillsGrid:    { display: 'flex', flexWrap: 'wrap', gap: 8 },
  skillChip:     { borderRadius: 20, padding: '6px 16px', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' },
  errorBox:      { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 },
  successBox:    { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', color: '#16a34a', fontSize: 13, marginBottom: 16 },
  actions:       { display: 'flex', justifyContent: 'flex-end', gap: 12 },
  cancelBtn:     { background: '#f5f4fe', border: 'none', borderRadius: 12, padding: '10px 24px', color: '#6366f1', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  saveBtn:       { background: 'linear-gradient(135deg, #6366f1, #7c3aed)', border: 'none', borderRadius: 12, padding: '10px 28px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' },
  dangerCard:    { background: '#fff', borderRadius: 20, padding: '24px 36px', boxShadow: '0 4px 24px rgba(239,68,68,0.08)', border: '1px solid #fecaca', marginBottom: 40 },
  deleteBtn:     { background: '#fff', border: '1.5px solid #ef4444', borderRadius: 12, padding: '10px 22px', color: '#ef4444', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'inherit' },
};