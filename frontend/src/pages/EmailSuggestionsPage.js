import React, { useState } from 'react';
import api from '../services/api'; // Axios instance
import '../styles/EmailSuggestions.css';

function EmailSuggestionsPage() {
  const [suggestions, setSuggestions] = useState([
    { id: 1, subject: "Opportunity to Connect", body: "Hi there, I would love to chat about opportunities at your company." },
    { id: 2, subject: "Networking Request", body: "Hope you're doing well! I'm reaching out to learn more about your experience." }
  ]);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ subject: '', body: '' });

  const handleSave = async (subject, body) => {
    try {
      const res = await api.post('/api/emails/templates', { name: subject, subject, body });
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Try again.');
    }
  };

  const handleRegenerate = (index) => {
    // Replace with your actual AI generation later
    const newSuggestion = {
      id: Date.now(),
      subject: 'New AI Suggestion',
      body: 'This is a newly AI-generated email suggestion.'
    };
    const updatedSuggestions = [...suggestions];
    updatedSuggestions[index] = newSuggestion;
    setSuggestions(updatedSuggestions);
  };

  const handleInputChange = (e, index, field) => {
    const updatedSuggestions = [...suggestions];
    updatedSuggestions[index][field] = e.target.value;
    setSuggestions(updatedSuggestions);
  };

  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate({ ...newTemplate, [name]: value });
  };

  const handleCreateNewTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplate.subject.trim() || !newTemplate.body.trim()) {
      alert('Please fill out both fields.');
      return;
    }
    await handleSave(newTemplate.subject, newTemplate.body);
    setCreatingNew(false);
    setNewTemplate({ subject: '', body: '' });
  };

  return (
    <div className="email-suggestions-container">
      <h1>AI Email Suggestions</h1>
      <p>Pick, edit, or create your own outreach templates!</p>

      <div className="template-actions">
        <button className="btn btn-primary" onClick={() => setCreatingNew(!creatingNew)}>
          {creatingNew ? 'Cancel' : 'Create New Template'}
        </button>
      </div>

      {creatingNew && (
        <form className="create-template-form" onSubmit={handleCreateNewTemplate}>
          <input
            type="text"
            name="subject"
            placeholder="Template Subject"
            value={newTemplate.subject}
            onChange={handleNewInputChange}
            className="input-field"
            required
          />
          <textarea
            name="body"
            placeholder="Template Body"
            value={newTemplate.body}
            onChange={handleNewInputChange}
            rows={6}
            className="input-field"
            required
          />
          <button type="submit" className="btn btn-primary">Save Template</button>
        </form>
      )}

      <div className="suggestions-grid">
        {suggestions.map((s, index) => (
          <div key={s.id} className="suggestion-card">
            <input
              type="text"
              value={s.subject}
              onChange={(e) => handleInputChange(e, index, 'subject')}
              className="input-field"
            />
            <textarea
              value={s.body}
              onChange={(e) => handleInputChange(e, index, 'body')}
              rows={6}
              className="input-field"
            />
            <div className="suggestion-actions">
              <button className="btn btn-primary" onClick={() => handleSave(s.subject, s.body)}>
                Save This
              </button>
              <button className="btn btn-secondary" onClick={() => handleRegenerate(index)}>
                Regenerate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmailSuggestionsPage;
