import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    linkedinUrl: '',
    university: '',
    phone: '',
    industry: '',
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get('/api/users/profile');
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile', error);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/api/users/profile', profile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile', error);
      alert('Failed to update profile.');
    }
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <div className="tabs-container">
        <div className="tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={activeTab === 'edit' ? 'active' : ''} onClick={() => setActiveTab('edit')}>Edit Profile</button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Settings</button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="profile-info-card">
              <h2>My Profile</h2>
              <div className="profile-details">
                <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                <p><strong>University:</strong> {profile.university}</p>
                <p><strong>Industry:</strong> {profile.industry}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>LinkedIn:</strong> <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">{profile.linkedinUrl}</a></p>
                <p><strong>Phone:</strong> {profile.phone}</p>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="edit-form">
              <h2>Edit Profile</h2>
              <form className="edit-form-grid" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name</label>
                    <input name="firstName" value={profile.firstName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input name="lastName" value={profile.lastName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input name="email" value={profile.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" value={profile.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>University</label>
                    <input name="university" value={profile.university} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Industry</label>
                    <input name="industry" value={profile.industry} onChange={handleChange} />
                  </div>
                  <div className="form-full-width">
                    <label>LinkedIn URL</label>
                    <input name="linkedinUrl" value={profile.linkedinUrl} onChange={handleChange} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-card">
              <h2>Settings</h2>
              <div className="mailbox-connect">
                <h3>Connect Google Mailbox</h3>
                <p>Link your Gmail to send emails directly from Kairos.</p>
                <button className="btn btn-secondary" onClick={() => window.location.href = '/link-mailbox'}>
                  Connect Google Mail
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
