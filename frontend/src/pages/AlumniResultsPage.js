// client/src/pages/AlumniResultsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/AlumniResults.css';

function AlumniResultsPage() {
  const { jobTitle } = useParams();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [emailDraft, setEmailDraft] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [searchId, setSearchId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get alumni matching job title
        const alumniRes = await api.get(`/api/alumni/job/${jobTitle}`);
        setAlumni(alumniRes.data.alumni);
        
        // Get email templates
        const templatesRes = await api.get('/api/emails/templates');
        setTemplates(templatesRes.data);
        
        // Get search ID if available from URL query
        const urlParams = new URLSearchParams(window.location.search);
        const searchIdParam = urlParams.get('searchId');
        if (searchIdParam) {
          setSearchId(searchIdParam);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching alumni:', error);
        setError('Failed to load alumni data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobTitle]);

  const handleSelectAlumni = async (alumnus) => {
    setSelectedAlumni(alumnus);
    
    try {
      const res = await api.post('/api/emails/draft', {
        alumniId: alumnus._id,
        templateId: selectedTemplate || undefined
      });
      
      setEmailDraft(res.data);
    } catch (error) {
      console.error('Error creating email draft:', error);
    }
  };

  const handleTemplateChange = async (e) => {
    setSelectedTemplate(e.target.value);
    
    if (selectedAlumni) {
      try {
        const res = await api.post('/api/emails/draft', {
          alumniId: selectedAlumni._id,
          templateId: e.target.value || undefined
        });
        
        setEmailDraft(res.data);
      } catch (error) {
        console.error('Error creating email draft:', error);
      }
    }
  };

  const handleSendEmail = async () => {
    try {
      await api.post('/api/emails/send', {
        alumniId: selectedAlumni._id,
        to: emailDraft.to,
        subject: emailDraft.subject,
        body: emailDraft.body,
        searchId: searchId
      });
      
      // Mark alumni as contacted in UI
      setAlumni(alumni.map(a => 
        a._id === selectedAlumni._id 
          ? { ...a, contacted: true } 
          : a
      ));
      
      setSelectedAlumni(null);
      setEmailDraft(null);
      
      // Show success message
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading alumni data...</div>;
  }

  return (
    <div className="alumni-results-container">
      <h1>Alumni in {jobTitle} Roles</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="alumni-content">
        <div className="alumni-list">
          <h2>Results ({alumni.length})</h2>
          
          {alumni.length === 0 ? (
            <p>No alumni found with this job title.</p>
          ) : (
            alumni.map((alumnus) => (
              <div 
                key={alumnus._id} 
                className={`alumni-card ${selectedAlumni?._id === alumnus._id ? 'selected' : ''}`}
                onClick={() => handleSelectAlumni(alumnus)}
              >
                <h3>{alumnus.name}</h3>
                <p className="alumni-job">{alumnus.jobTitle} at {alumnus.company}</p>
                {alumnus.graduationYear && (
                  <p className="alumni-graduation">Graduated: {alumnus.graduationYear}</p>
                )}
                {alumnus.contacted && (
                  <span className="contacted-badge">Contacted</span>
                )}
              </div>
            ))
          )}
        </div>
        
        {selectedAlumni && emailDraft && (
          <div className="email-draft-container">
            <h2>Draft Email</h2>
            
            <div className="template-selector">
              <label>Email Template:</label>
              <select value={selectedTemplate} onChange={handleTemplateChange}>
                <option value="">Default Template</option>
                {templates.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="email-preview">
              <div className="email-field">
                <label>To:</label>
                <p>{emailDraft.to}</p>
              </div>
              <div className="email-field">
                <label>Subject:</label>
                <p>{emailDraft.subject}</p>
              </div>
              <div className="email-field">
                <label>Body:</label>
                <textarea
                  value={emailDraft.body}
                  onChange={(e) => setEmailDraft({...emailDraft, body: e.target.value})}
                  rows={10}
                />
              </div>
              
              <div className="email-actions">
                <button className="btn btn-secondary" onClick={() => setSelectedAlumni(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSendEmail}>
                  Send Email
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!selectedAlumni && alumni.length > 0 && (
          <div className="instructions-panel">
            <h3>Instructions</h3>
            <p>Click on an alumni to draft an email and reach out to them.</p>
            <p>You can customize your email template before sending.</p>
            <button className="btn btn-secondary" onClick={() => navigate('/templates')}>
              Manage Email Templates
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AlumniResultsPage;