import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/EmailSuggestions.css';

function EmailSuggestionsPage() {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '' });
  const [aiOptions, setAiOptions] = useState({ role: '', company: '', experienceLevel: '', tone: '' });
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/api/emails/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const openEditor = (template) => {
    setEditingTemplate(template);
    setForm({ name: template.name, subject: template.subject, body: template.body });
    setShowAIOptions(false);
    setAiOptions({ role: '', company: '', experienceLevel: '', tone: '' });
  };

  const openNewTemplate = () => {
    setEditingTemplate(null);
    setForm({ name: '', subject: '', body: '' });
    setNewTemplateOpen(true);
    setShowAIOptions(false);
    setAiOptions({ role: '', company: '', experienceLevel: '', tone: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await api.put(`/api/emails/templates/${editingTemplate._id}`, form);
      } else {
        await api.post('/api/emails/templates', form);
      }
      fetchTemplates();
      closeEditor();
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/api/emails/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const closeEditor = () => {
    setEditingTemplate(null);
    setNewTemplateOpen(false);
    setForm({ name: '', subject: '', body: '' });
    setShowAIOptions(false);
    setAiOptions({ role: '', company: '', experienceLevel: '', tone: '' });
  };

  const insertPlaceholder = (placeholder) => {
    setForm((prev) => ({
      ...prev,
      body: prev.body + ` {{${placeholder}}} `
    }));
  };

  const handleGenerateAI = async () => {
    if (!showAIOptions) {
      setShowAIOptions(true);
      return;
    }

    if (!aiOptions.role || !aiOptions.company || !aiOptions.experienceLevel || !aiOptions.tone) {
      alert('Please fill all AI generation fields.');
      return;
    }

    setLoadingAI(true);
    try {
      const res = await api.post('/api/emails/generate', aiOptions);
      setForm((prev) => ({ ...prev, body: res.data.body }));
      setShowAIOptions(false);
      setAiOptions({ role: '', company: '', experienceLevel: '', tone: '' });
    } catch (err) {
      console.error('Error generating AI email:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="email-suggestions-page">
      <h1>Email Templates</h1>
      <p>Manage and personalize your outreach emails easily.</p>

      <div className="templates-grid">
        {templates.map((template) => (
          <div key={template._id} className="template-card">
            <div className="template-card-header">
              <h3>{template.name}</h3>
              <button className="delete-icon" onClick={() => handleDelete(template._id)}>✖</button>
            </div>
            <p>{template.subject}</p>
            <button className="edit-btn" onClick={() => openEditor(template)}>Edit</button>
          </div>
        ))}
        <div className="template-card new" onClick={openNewTemplate}>
          + Create New
        </div>
      </div>

      {(editingTemplate || newTemplateOpen) && (
        <div className="editor-sidebar slide-in">
          <div className="editor-header">
            <h2>{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
            <button className="close-btn" onClick={closeEditor}>×</button>
          </div>

          <input
            type="text"
            name="name"
            placeholder="Template Name"
            value={form.name}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="subject"
            placeholder="Template Subject"
            value={form.subject}
            onChange={handleChange}
            className="input-field"
          />

          <div className="placeholder-buttons">
            {['name', 'jobTitle', 'company', 'senderName'].map((ph) => (
              <button key={ph} onClick={() => insertPlaceholder(ph)}>
                {`{{${ph}}}`}
              </button>
            ))}
          </div>

          <textarea
            name="body"
            placeholder="Template Body"
            value={form.body}
            onChange={handleChange}
            className="input-field"
          />

          <div className="editor-actions">
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
            <button className="generate-btn" onClick={handleGenerateAI} disabled={loadingAI}>
              {loadingAI ? 'Generating...' : (showAIOptions ? 'Submit to AI' : 'Generate with AI')}
            </button>
          </div>

          {showAIOptions && (
            <div className="ai-options">
              <input
                type="text"
                placeholder="Role (e.g. Software Engineer)"
                value={aiOptions.role}
                onChange={(e) => setAiOptions({ ...aiOptions, role: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Company"
                value={aiOptions.company}
                onChange={(e) => setAiOptions({ ...aiOptions, company: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Experience Level"
                value={aiOptions.experienceLevel}
                onChange={(e) => setAiOptions({ ...aiOptions, experienceLevel: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Tone (Friendly/Professional/Excited)"
                value={aiOptions.tone}
                onChange={(e) => setAiOptions({ ...aiOptions, tone: e.target.value })}
                className="input-field"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmailSuggestionsPage;
