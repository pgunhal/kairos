import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/TemplateEditDrawer.css';

function TemplateEditDrawer({ template, onClose }) {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const [aiOptions, setAIOptions] = useState({
    role: '',
    company: '',
    experienceLevel: 'student',
    tone: 'friendly',
  });

  useEffect(() => {
    setSubject(template.subject);
    setBody(template.body);
  }, [template]);  // Update whenever template changes!

  const handleSave = () => {
    console.log('Saving', { subject, body });
    onClose();
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/emails/generate', aiOptions);
      setBody(res.data.body);
      setShowAIOptions(false);
    } catch (error) {
      console.error('Error generating AI email:', error);
      alert('Failed to generate.');
    } finally {
      setLoading(false);
    }
  };

  const handleAIInputChange = (e) => {
    setAIOptions({
      ...aiOptions,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="drawer-overlay">
      <div className="drawer-panel">
        <div className="drawer-header">
          <h2>Edit Template</h2>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>

        <input
          type="text"
          className="drawer-input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Template Subject"
        />

        <div className="drawer-toolbar">
          <button>{'{{name}}'}</button>
          <button>{'{{jobTitle}}'}</button>
          <button>{'{{company}}'}</button>
          <button>{'{{senderName}}'}</button>
        </div>

        <textarea
          className="drawer-textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          placeholder="Write your email body here..."
        />

        {showAIOptions ? (
          <div className="ai-form">
            <input
              name="role"
              value={aiOptions.role}
              onChange={handleAIInputChange}
              placeholder="Role (e.g., Software Engineer)"
              className="input-field"
            />
            <input
              name="company"
              value={aiOptions.company}
              onChange={handleAIInputChange}
              placeholder="Company (e.g., Google)"
              className="input-field"
            />
            <select
              name="experienceLevel"
              value={aiOptions.experienceLevel}
              onChange={handleAIInputChange}
              className="input-field"
            >
              <option value="student">Student</option>
              <option value="entry">Entry-Level</option>
              <option value="experienced">Experienced</option>
            </select>
            <select
              name="tone"
              value={aiOptions.tone}
              onChange={handleAIInputChange}
              className="input-field"
            >
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="excited">Excited</option>
            </select>

            <div className="drawer-actions">
              <button className="btn btn-primary" onClick={handleGenerateAI} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Email'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAIOptions(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="drawer-actions">
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
            <button className="btn btn-secondary" onClick={() => setShowAIOptions(true)}>
              Generate with AI
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateEditDrawer;
