import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import SkillTag from './SkillTag';
import { SkeletonBox } from './LoadingSkeleton';
import { getEditProfile, updateProfile, sendEmailOtp, verifyEmailOtp, changePassword, deleteAccount } from '../services/api';
import { useToast } from './Toast';

function Section({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>{title}</h3>
      {children}
    </div>
  );
}

function SkillPicker({ allSkills, selectedIds, onChange }) {
  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState(false);

  const selectedSkills = allSkills.filter(s => selectedIds.includes(s.id));
  const filtered       = allSkills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) && !selectedIds.includes(s.id)
  );

  const add    = (id) => onChange([...selectedIds, id]);
  const remove = (id) => onChange(selectedIds.filter(i => i !== id));

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10, minHeight: 32 }}>
        {selectedSkills.map(s => (
          <SkillTag key={s.id} name={s.name} removable onRemove={() => remove(s.id)} />
        ))}
        {selectedSkills.length === 0 && <span style={{ fontSize: 12, color: 'var(--muted)' }}>No skills selected yet</span>}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          placeholder="Search and add skills..."
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {open && filtered.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: '0 0 8px 8px', maxHeight: 180, overflowY: 'auto',
            boxShadow: 'var(--shadow)',
          }}>
            {filtered.slice(0, 20).map(s => (
              <div key={s.id}
                onMouseDown={() => { add(s.id); setSearch(''); }}
                style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--text)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {s.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditProfilePage({ userId, currentUser, onNavigate, onLogout, onBack }) {
  const toast = useToast();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  // Form state
  const [form, setForm]         = useState({});
  const [skillIds, setSkillIds] = useState([]);

  // Email change flow
  const [newEmail, setNewEmail]         = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [otpSent, setOtpSent]           = useState(false);
  const [otp, setOtp]                   = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change
  const [pwForm, setPwForm]   = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Delete account
  const [showDelete, setShowDelete]     = useState(false);
  const [deletePass, setDeletePass]     = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getEditProfile(userId)
      .then(res => {
        const d = res.data;
        setProfileData(d);
        setForm({
          name:              d.user.name || '',
          email:             d.user.email || '',
          bio:               d.user.bio || '',
          profile_image:     d.user.profile_image || '',
          experience_level:  d.user.experience_level || 'Beginner',
          primary_domain_id: d.user.primary_domain_id || '',
          github_url:        d.user.github_url || '',
          linkedin_url:      d.user.linkedin_url || '',
          portfolio_url:     d.user.portfolio_url || '',
          whatsapp_number:   d.user.whatsapp_number || '',
        });
        setSkillIds(d.user_skills.map(s => s.id));
      })
      .catch(() => toast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, [userId]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({ action: 'save', user_id: userId, ...form, skill_ids: skillIds });
      if (res.data.success) {
        toast('Profile saved successfully! ✅', 'success');
      } else if (res.data.email_changed) {
        toast('Email changed — please verify via OTP', 'info');
        setShowEmailForm(true);
      } else {
        toast(res.data.error || 'Failed to save', 'error');
      }
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to save profile';
      if (msg.includes('email') || msg.includes('Email')) setShowEmailForm(true);
      else toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    setEmailLoading(true);
    try {
      await sendEmailOtp({ user_id: userId, ...form, email: newEmail, skill_ids: skillIds });
      setOtpSent(true);
      toast(`OTP sent to ${newEmail}`, 'success');
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to send OTP', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setEmailLoading(true);
    try {
      const res = await verifyEmailOtp({ user_id: userId, ...form, email: newEmail, otp, skill_ids: skillIds });
      if (res.data.success) {
        toast('Email updated successfully! ✅', 'success');
        set('email', newEmail);
        setShowEmailForm(false);
        setOtpSent(false);
        setOtp('');
      } else {
        toast(res.data.error || 'Invalid OTP', 'error');
      }
    } catch (e) {
      toast(e.response?.data?.error || 'Invalid OTP', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (pwForm.new_password !== pwForm.confirm) { toast('Passwords do not match', 'error'); return; }
    if (pwForm.new_password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setPwLoading(true);
    try {
      const body = { user_id: userId, new_password: pwForm.new_password };
      if (!currentUser?.is_google_user) body.current_password = pwForm.current_password;
      const res = await changePassword(body);
      if (res.data.success) {
        toast('Password updated! ✅', 'success');
        setPwForm({ current_password: '', new_password: '', confirm: '' });
      } else {
        toast(res.data.error || 'Failed to update password', 'error');
      }
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to update password', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const body = { user_id: userId };
      if (!currentUser?.is_google_user) body.password = deletePass;
      const res = await deleteAccount(body);
      if (res.data.success) window.location.href = '/';
      else toast(res.data.error || 'Failed to delete account', 'error');
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to delete account', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
  const levelColors = { Beginner: 'var(--success)', Intermediate: 'var(--warning)', Advanced: 'var(--danger)' };

  return (
    <div className="app-layout">
      <Sidebar currentPage="profile" currentUser={currentUser} onNavigate={onNavigate} onLogout={() => {}} />
      <main className="main-content page-enter">

        <div className="page-header">
          <div>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              ← Back
            </button>
            <h1 style={{ fontSize: 24 }}>Edit Profile</h1>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="card"><SkeletonBox height={100} /></div>)}
          </div>
        ) : (
          <div style={{ maxWidth: 720 }}>

            {/* Personal Info */}
            <Section title="👤 Personal Information">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Profile Image URL</label>
                  <input className="form-input" value={form.profile_image} onChange={e => set('profile_image', e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-input" value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell others about yourself..." style={{ minHeight: 80 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Domain / Specialization</label>
                <select className="form-input" value={form.primary_domain_id} onChange={e => set('primary_domain_id', e.target.value)}>
                  <option value="">Select domain...</option>
                  {profileData?.domains?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {LEVELS.map(lvl => (
                    <button key={lvl} type="button" onClick={() => set('experience_level', lvl)} style={{
                      padding: '8px 18px', borderRadius: 20,
                      border: `2px solid ${form.experience_level === lvl ? levelColors[lvl] : 'var(--border)'}`,
                      background: form.experience_level === lvl ? `${levelColors[lvl]}15` : 'var(--surface)',
                      color: form.experience_level === lvl ? levelColors[lvl] : 'var(--muted)',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      {lvl === 'Beginner' ? '🟢' : lvl === 'Intermediate' ? '🟡' : '🔴'} {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* Skills */}
            <Section title="🛠 Skills">
              <SkillPicker
                allSkills={profileData?.all_skills || []}
                selectedIds={skillIds}
                onChange={setSkillIds}
              />
            </Section>

            {/* Social Links */}
            <Section title="🔗 Social Links">
              <div className="grid-2">
                {[
                  { key: 'github_url',      label: 'GitHub URL',      icon: '🐙', placeholder: 'https://github.com/...' },
                  { key: 'linkedin_url',    label: 'LinkedIn URL',    icon: '💼', placeholder: 'https://linkedin.com/in/...' },
                  { key: 'portfolio_url',   label: 'Portfolio URL',   icon: '🌐', placeholder: 'https://yoursite.com' },
                  { key: 'whatsapp_number', label: 'WhatsApp Number', icon: '💬', placeholder: '+91XXXXXXXXXX' },
                ].map(field => (
                  <div key={field.key} className="form-group">
                    <label className="form-label">{field.icon} {field.label}</label>
                    <input className="form-input" value={form[field.key]} onChange={e => set(field.key, e.target.value)} placeholder={field.placeholder} />
                  </div>
                ))}
              </div>
            </Section>

            {/* Email */}
            <Section title="📧 Email Address">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: showEmailForm ? 16 : 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--brown)' }}>{form.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Current email address</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowEmailForm(!showEmailForm)}>
                  Change Email
                </button>
              </div>
              {showEmailForm && (
                <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: 8, marginTop: 12 }}>
                  {!otpSent ? (
                    <>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label">New Email Address</label>
                        <input className="form-input" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@email.com" />
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={handleSendOtp} disabled={emailLoading || !newEmail}>
                        {emailLoading ? '⏳ Sending...' : '📤 Send OTP'}
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>OTP sent to <strong>{newEmail}</strong></p>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label">Enter OTP</label>
                        <input className="form-input" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} style={{ letterSpacing: 8, textAlign: 'center', fontSize: 20 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={handleVerifyOtp} disabled={emailLoading || otp.length < 6}>
                          {emailLoading ? '⏳ Verifying...' : '✅ Verify OTP'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setOtpSent(false); setOtp(''); }}>
                          Resend
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Section>

            {/* Change Password */}
            <Section title="🔒 Change Password">
              {!currentUser?.is_google_user && (
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-input" type="password" value={pwForm.current_password} onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))} placeholder="Current password" />
                </div>
              )}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} placeholder="New password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat new password" />
                </div>
              </div>
              <button className="btn btn-secondary" onClick={handlePasswordChange} disabled={pwLoading}>
                {pwLoading ? '⏳ Updating...' : '🔑 Update Password'}
              </button>
            </Section>

            {/* Danger Zone */}
            <div className="card" style={{ border: '1px solid rgba(200,64,64,0.4)', background: 'rgba(200,64,64,0.03)' }}>
              <h3 style={{ fontSize: 15, color: 'var(--danger)', marginBottom: 8 }}>⚠️ Danger Zone</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
                Permanently delete your account and all your data. This action cannot be undone.
              </p>
              {!showDelete ? (
                <button className="btn btn-danger" onClick={() => setShowDelete(true)}>🗑️ Delete Account</button>
              ) : (
                <div style={{ padding: '14px', background: 'var(--danger-bg)', borderRadius: 8 }}>
                  <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600, marginBottom: 12 }}>
                    Are you absolutely sure? This cannot be undone.
                  </p>
                  {!currentUser?.is_google_user && (
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Enter Password to Confirm</label>
                      <input className="form-input" type="password" value={deletePass} onChange={e => setDeletePass(e.target.value)} placeholder="Your password" />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={deleteLoading}>
                      {deleteLoading ? '⏳ Deleting...' : '🗑️ Yes, Delete My Account'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => { setShowDelete(false); setDeletePass(''); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
