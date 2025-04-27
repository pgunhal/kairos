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
      <div className="profile-info-card">
        <h2>My Profile</h2>
        <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
        <p><strong>University:</strong> {profile.university}</p>
        <p><strong>Industry:</strong> {profile.industry}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>LinkedIn:</strong> <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">{profile.linkedinUrl}</a></p>
        <p><strong>Phone:</strong> {profile.phone}</p>
      </div>

      <div className="edit-form">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input name="firstName" placeholder="First Name" value={profile.firstName} onChange={handleChange} />
            <input name="lastName" placeholder="Last Name" value={profile.lastName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input name="email" placeholder="Email" value={profile.email} onChange={handleChange} />
            <input name="phone" placeholder="Phone" value={profile.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input name="university" placeholder="University" value={profile.university} onChange={handleChange} />
            <input name="industry" placeholder="Industry" value={profile.industry} onChange={handleChange} />
          </div>
          <input name="linkedinUrl" placeholder="LinkedIn URL" value={profile.linkedinUrl} onChange={handleChange} />
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="mailbox-widget">
          <h3>Connect Google Mailbox</h3>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/link-mailbox'}>
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
