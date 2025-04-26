// TemplateEditorPage.js

import React, { useState } from 'react';
import api from '../services/api';
import '../styles/TemplateEditor.css';

function TemplateEditorPage() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateAI = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/emails/generate', { subject });
      setBody(res.data.body);  // Fill the body with generated content
    } catch (error) {
      console.error('Error generating:', error);
      alert('Failed to generate with AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // Save updated template
    console.log('Saving template:', { subject, body });
    alert('Template saved!');
  };

  return (
    <div className="template-editor-container">
      <h1>Edit Template</h1>

      <input
        className="editor-input"
        type="text"
        placeholder="Template Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <div className="editor-toolbar">
        <button>{'{{name}}'}</button>
        <button>{'{{jobTitle}}'}</button>
        <button>{'{{company}}'}</button>
        <button>{'{{senderName}}'}</button>
      </div>

      <textarea
        className="editor-textarea"
        placeholder="Email Body..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={10}
      />

      <div className="editor-actions">
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
        <button className="btn btn-secondary" onClick={handleGenerateAI} disabled={loading}>
          {loading ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>
    </div>
  );
}

export default TemplateEditorPage;
