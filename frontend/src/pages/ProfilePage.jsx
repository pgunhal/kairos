import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    profileImage: '', // <<< added here
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get('/api/users/profile');
        setProfile(data);
        setPreview(data.profileImage || '');
      } catch (error) {
        console.error('Error loading profile', error);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profileImage: reader.result });
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      <div className="profile-card">
        <div className="profile-picture-container">
          {preview ? (
            <img src={preview} alt="Profile" className="profile-picture" />
          ) : (
            <div className="empty-picture">No Image</div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <h2>{profile.firstName} {profile.lastName}</h2>
        <p>{profile.university}</p>
        <p>{profile.industry}</p>
      </div>

      <div className="edit-form">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <input name="firstName" placeholder="First Name" value={profile.firstName} onChange={handleChange} />
          <input name="lastName" placeholder="Last Name" value={profile.lastName} onChange={handleChange} />
          <input name="email" placeholder="Email" value={profile.email} onChange={handleChange} />
          <input name="linkedinUrl" placeholder="LinkedIn URL" value={profile.linkedinUrl} onChange={handleChange} />
          <input name="university" placeholder="University" value={profile.university} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={profile.phone} onChange={handleChange} />
          <input name="industry" placeholder="Industry" value={profile.industry} onChange={handleChange} />
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>

        {/* Mailbox Connect Widget */}
        <div className="mailbox-widget">
          <h3>Connect Google Mailbox</h3>
          <button onClick={() => window.location.href = '/link-mailbox'}>Connect</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
