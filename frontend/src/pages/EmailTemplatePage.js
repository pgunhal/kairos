
// client/src/pages/EmailTemplatePage.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/EmailTemplate.css';

function EmailTemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: ''
  });
  
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/api/emails/templates');
        setTemplates(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError('Failed to load email templates');
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate({ ...newTemplate, [name]: value });
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const res = await api.post('/api/emails/templates', newTemplate);
      setTemplates([...templates, res.data]);
      setNewTemplate({ name: '', subject: '', body: '' });
      setIsCreating(false);
      setError('');
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template');
    }
  };

  if (loading) {
    return <div className="loading">Loading templates...</div>;
  }

  return (
    <div className="email-template-container">
      <h1>Email Templates</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="template-actions">
        <button 
          className="btn btn-primary" 
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? 'Cancel' : 'Create New Template'}
        </button>
      </div>
      
      {isCreating && (
        <div className="template-form-container">
          <h2>Create New Template</h2>
          <form onSubmit={handleCreateTemplate}>
            <div className="form-group">
              <label htmlFor="name">Template Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newTemplate.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Email Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={newTemplate.subject}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="body">Email Body</label>
              <textarea
                id="body"
                name="body"
                value={newTemplate.body}
                onChange={handleInputChange}
                rows={10}
                required
                placeholder="Available placeholders: {{name}}, {{jobTitle}}, {{company}}, {{senderName}}"
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Template</button>
          </form>
        </div>
      )}
      
      <div className="templates-list">
        <h2>Your Templates</h2>
        
        {templates.length === 0 ? (
          <p>No templates found. Create one to get started.</p>
        ) : (
          templates.map((template) => (
            <div key={template._id} className="template-card">
              <h3>{template.name}</h3>
              <div className="template-details">
                <div className="template-field">
                  <label>Subject:</label>
                  <p>{template.subject}</p>
                </div>
                <div className="template-field">
                  <label>Body:</label>
                  <pre>{template.body}</pre>
                </div>
              </div>
              {template.isDefault && (
                <div className="default-badge">Default Template</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EmailTemplatePage;