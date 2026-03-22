import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Avatar from './Avatar';
import StarRating from './StarRating';
import StatusBadge from './StatusBadge';
import SkillTag from './SkillTag';
import { SkeletonBox, SkeletonCard } from './LoadingSkeleton';
import { getProjectDetails, applyToProject, submitRating, updateProject } from '../services/api';
import { useToast } from './Toast';

function OwnerCard({ owner, onNavigate }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 14, marginBottom: 16, color: 'var(--muted)', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>Project Owner</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <Avatar name={owner.name} image={owner.profile_image} size={52} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--brown)', marginBottom: 4 }}>{owner.name}</div>
          <StarRating value={owner.avg_rating} readOnly size={14} />
        </div>
      </div>
      {owner.bio && (
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
          {owner.bio}
        </p>
      )}
      {owner.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {owner.skills.map(s => <SkillTag key={s} name={s} small />)}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {owner.github_url    && <a href={owner.github_url}    target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>🐙 GitHub</a>}
        {owner.linkedin_url  && <a href={owner.linkedin_url}  target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>💼 LinkedIn</a>}
        {owner.portfolio_url && <a href={owner.portfolio_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>🌐 Portfolio</a>}
      </div>
    </div>
  );
}

function MemberCard({ member, userId, projectId, alreadyRated, onRated, canRate, isOwner, projectStatus, onMemberRemoved }) {
  const toast = useToast();
  const [rating, setRating]     = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [removing, setRemoving] = useState(false);
  const isRated = alreadyRated.includes(member.id);
  const isSelf  = member.id === userId;

  const handleRemove = async () => {
    if (!window.confirm(`Remove ${member.name} from this project?`)) return;
    setRemoving(true);
    try {
      const res = await updateProject({ action: 'remove_member', project_id: projectId, member_id: member.id, user_id: userId });
      if (res.data.success) {
        toast(`${member.name} removed from project`, 'success');
        onMemberRemoved(member.id);
      } else {
        toast(res.data.error || 'Failed to remove member', 'error');
      }
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to remove member', 'error');
    } finally {
      setRemoving(false);
    }
  };

  const handleSubmit = async () => {
    if (!rating) { toast('Please select a star rating', 'error'); return; }
    setLoading(true);
    try {
      const res = await submitRating({ project_id: projectId, receiver_id: member.id, rating, feedback, user_id: userId });
      if (res.data.success) {
        toast(`Rating submitted for ${member.name}! ⭐`, 'success');
        setShowForm(false);
        onRated(member.id);
      } else {
        toast(res.data.error || 'Failed to submit rating', 'error');
      }
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to submit rating', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: showForm ? 12 : 0 }}>
        <Avatar name={member.name} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brown)' }}>{member.name}</span>
            {member.role === 'owner' && (
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'var(--orange-dim)', color: 'var(--orange)', fontWeight: 700 }}>Owner</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <StatusBadge status={member.experience_level || 'Beginner'} />
            <StarRating value={member.avg_rating} readOnly size={12} />
          </div>
        </div>
        {isOwner && !isSelf && member.role !== 'owner' && projectStatus === 'open' && (
          <button className="btn btn-ghost btn-sm" onClick={handleRemove} disabled={removing}
            style={{ color: 'var(--danger)', fontSize: 11 }}>
            {removing ? '⏳' : '✖ Remove'}
          </button>
        )}
        {!isSelf && canRate && !isRated && (
          <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(f => !f)}>
            {showForm ? 'Cancel' : '⭐ Rate'}
          </button>
        )}
        {!isSelf && canRate && isRated && (
          <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700 }}>✅ Rated</span>
        )}
      </div>

      {showForm && (
        <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: 8 }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>Your Rating</div>
            <StarRating value={rating} onChange={setRating} size={24} />
          </div>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="form-label">Feedback (optional)</label>
            <textarea className="form-input" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Share your experience working with this person..." style={{ minHeight: 60 }} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={loading || !rating}>
            {loading ? '⏳ Submitting...' : '⭐ Submit Rating'}
          </button>
        </div>
      )}
    </div>
  );
}

function ApplySection({ project, applicationStatus, isOwner, userId, onNavigate }) {
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const status = applied ? 'pending' : applicationStatus;

  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await applyToProject({ project_id: project.id, user_id: userId, message });
      if (res.data.success) {
        toast('Application submitted! ✅', 'success');
        setApplied(true);
      } else {
        toast(res.data.error || 'Failed to apply', 'error');
      }
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to apply', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isOwner) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>👑</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brown)', marginBottom: 8 }}>You own this project</div>
        <button className="btn btn-primary" onClick={() => onNavigate('applications')}>
          📩 Manage Applications
        </button>
      </div>
    );
  }

  if (project.status !== 'open') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>This project is not accepting applications</div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 24, background: 'var(--warning-bg)', border: '1px solid rgba(200,151,58,0.3)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)' }}>Application Pending</div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Your application is under review</p>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 24, background: 'var(--success-bg)', border: '1px solid rgba(90,138,90,0.3)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>You're on the team!</div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Your application was accepted</p>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 24, background: 'var(--danger-bg)', border: '1px solid rgba(200,64,64,0.3)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>😔</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)' }}>Application Not Accepted</div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Keep exploring other projects!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: 15, marginBottom: 14 }}>📩 Apply to this Project</h3>
      <div className="form-group" style={{ marginBottom: 14 }}>
        <label className="form-label">Cover Message (optional)</label>
        <textarea
          className="form-input"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Introduce yourself, mention relevant skills or experience..."
          style={{ minHeight: 90 }}
        />
      </div>
      <button className="btn btn-primary btn-full btn-lg" onClick={handleApply} disabled={loading}>
        {loading ? '⏳ Submitting...' : '🚀 Submit Application'}
      </button>
    </div>
  );
}

export default function ProjectDetailPage({ userId, currentUser, projectId, onBack, onNavigate, onLogout }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [rated, setRated]     = useState([]);

  useEffect(() => {
    if (!projectId) return;
    getProjectDetails(projectId, userId)
      .then(res => {
        setData(res.data);
        setRated(res.data.already_rated || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId, userId]);

  const handleRated = (memberId) => setRated(r => [...r, memberId]);

  const project = data?.project;
  const owner   = data?.owner;
  const canRate = project?.status === 'completed' &&
    (data?.members?.some(m => m.id === userId) || data?.is_owner);

  return (
    <div className="app-layout">
      <Sidebar currentPage="browse" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="main-content page-enter">

        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: 0 }}>
          ← Back
        </button>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SkeletonBox height={180} />
              <SkeletonBox height={120} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : project && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Project header */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <h1 style={{ fontSize: 24, lineHeight: 1.3, flex: 1 }}>{project.title}</h1>
                  <StatusBadge status={project.status} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--orange-dim)', color: 'var(--orange)', fontSize: 12, fontWeight: 600 }}>
                    📁 {project.domain}
                  </span>
                  <StatusBadge status={project.experience_level} />
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--surface)', color: 'var(--muted)', fontSize: 12 }}>
                    👥 {data.members?.length || 0}/{project.max_members} members
                  </span>
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--surface)', color: 'var(--muted)', fontSize: 12 }}>
                    📅 {project.created_at}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8, marginBottom: 16 }}>
                  {project.description}
                </p>
                {data.skills?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
                      Required Skills
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {data.skills.map(s => <SkillTag key={s} name={s} />)}
                    </div>
                  </div>
                )}
              </div>

              {/* Team Members */}
              {data.members?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: 15, marginBottom: 14 }}>
                    👥 Team Members
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400, marginLeft: 8, fontFamily: "'Nunito', sans-serif" }}>
                      ({data.members.length}/{project.max_members})
                    </span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.members.map(m => (
                      <MemberCard
                        key={m.id}
                        member={m}
                        userId={userId}
                        projectId={project.id}
                        alreadyRated={rated}
                        onRated={handleRated}
                        canRate={canRate}
                        isOwner={data.is_owner}
                        projectStatus={project.status}
                        onMemberRemoved={(id) => setData(d => ({ ...d, members: d.members.filter(m => m.id !== id) }))}
                      />
                    ))}
                  </div>
                  {canRate && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--orange-dim)', borderRadius: 8, fontSize: 13, color: 'var(--orange)', fontWeight: 600 }}>
                      ⭐ This project is completed — rate your teammates above!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ApplySection
                project={project}
                applicationStatus={data.application_status}
                isOwner={data.is_owner}
                userId={userId}
                onNavigate={onNavigate}
              />
              {data.total_applicants > 0 && !data.is_owner && (
                <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                  {data.total_applicants} other student{data.total_applicants !== 1 ? 's' : ''} applied
                </div>
              )}
              {owner && <OwnerCard owner={owner} onNavigate={onNavigate} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}