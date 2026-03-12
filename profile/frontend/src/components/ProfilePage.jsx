// ============================================================
//  PROFILE PAGE  (Updated — onNavigate prop for sidebar routing)
//  File: src/components/ProfilePage.jsx
// ============================================================

import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/api';
import Sidebar from './Sidebar';
import ProfileHeader from './ProfileHeader';
import AboutSection from './AboutSection';
import AnalyticsSection from './AnalyticsSection';
import ProjectsSection from './ProjectsSection';
import ReviewsSection from './ReviewsSection';
import EditProfilePage from './EditProfilePage';

const USER_ID = 6; // Replace with session user ID after login

export default function ProfilePage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [isEditing, setIsEditing]     = useState(false);

  useEffect(() => {
    getProfile(USER_ID)
      .then(res => setProfileData(res.data))
      .catch(() => setError("Could not load profile. Make sure your backend is running."))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSaved = (updatedUser, updatedSkills) => {
    setProfileData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        name:             updatedUser.name,
        email:            updatedUser.email,
        bio:              updatedUser.bio,
        profile_image:    updatedUser.profile_image,
        experience_level: updatedUser.experience_level,
        domain:           updatedUser.domain_name,
        level:            updatedUser.experience_level,
        github_url:       updatedUser.github_url,
        linkedin_url:     updatedUser.linkedin_url,
        portfolio_url:    updatedUser.portfolio_url,
        whatsapp_number:  updatedUser.whatsapp_number,
      },
      skills: updatedSkills || prev.skills,
    }));
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="profile" onNavigate={onNavigate} />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid #ede9fe',
            borderTop: '4px solid #6366f1', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading profile...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────
  if (error) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activePage="profile" onNavigate={onNavigate} />
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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activePage="profile"
        onNavigate={onNavigate}
      />

      {isEditing ? (
        <EditProfilePage
          userId={USER_ID}
          onBack={() => setIsEditing(false)}
          onSaved={handleProfileSaved}
        />
      ) : (
        <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', maxWidth: 940 }}>
          <ProfileHeader user={profileData.user} onEditClick={() => setIsEditing(true)} />
          <AboutSection bio={profileData.user.bio} skills={profileData.skills} user={profileData.user} />
          <AnalyticsSection analytics={profileData.analytics} />
          <ProjectsSection projects={profileData.projects} />
          <ReviewsSection reviews={profileData.reviews} />
        </main>
      )}
    </div>
  );
}
