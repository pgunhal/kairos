import React, { useState } from 'react';
import api from '../services/api';
import '../styles/TemplateEditor.css';

function TemplateEditorPage() {
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateAI = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/emails/generate', { prompt }); // notice: we send the raw prompt now
      setBody(res.data.body);
      setSubject(res.data.subject || '');
    } catch (error) {
      console.error('Error generating:', error);
      alert('Failed to generate with AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    console.log('Saving template:', { subject, body });
    alert('Template saved!');
  };

  return (
    <div className="template-editor-container">
      <h1>Edit Email Template</h1>

      <textarea
        className="editor-prompt"
        placeholder="Describe what kind of email you want to generate (e.g., 'Outreach to a Software Engineer at Google')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />

      <div className="editor-actions">
        <button className="btn btn-secondary" onClick={handleGenerateAI} disabled={loading}>
          {loading ? 'Generating...' : 'Submit to AI'}
        </button>
      </div>

      <input
        className="editor-input"
        type="text"
        placeholder="Template Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <textarea
        className="editor-textarea"
        placeholder="Email Body..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={10}
      />

      <div className="editor-actions">
        <button className="btn btn-primary" onClick={handleSave}>Save Template</button>
      </div>
    </div>
  );
}

export default TemplateEditorPage;
