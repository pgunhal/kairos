// src/pages/AlumniResultsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { FaLinkedin } from 'react-icons/fa';
import '../styles/AlumniResults.css';

function AlumniResultsPage() {
  const location = useLocation();
  const alumniRaw = useMemo(() => location.state?.alumni || [], [location.state?.alumni]);
  const searchId = location.state?.searchId; // ✅

  const [contacted, setContacted] = useState({});
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingContactAll, setLoadingContactAll] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/api/emails/templates');
        setTemplates(res.data || []);
        if (res.data.length > 0) {
          setSelectedTemplate(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err.message);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
  };

  const handleContact = async (alum) => {
    try {
      console.log(`Sending email to ${alum.email} with template ${selectedTemplate}`);
  
      await api.post('/api/emails/send', {
        email: alum.email,
        name: alum.name,
        jobTitle: alum.title,
        company: alum.company,
        location: alum.location,
        linkedin_url: alum.linkedin_url,
        templateId: selectedTemplate,
        searchId // ✅ Pass the searchId
      });
  
      setContacted(prev => ({ ...prev, [alum.email]: true }));
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message || 'Already contacted.');
        setContacted(prev => ({ ...prev, [alum.email]: true }));
      } else {
        console.error('Error contacting alumni:', error.message);
      }
    }
  };

  const confirmContactAll = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmContactAll = async () => {
    setShowConfirmModal(false);
    setLoadingContactAll(true);

    for (const alum of alumniRaw) {
      if (!contacted[alum.email]) {
        await handleContact(alum);
      }
    }

    setLoadingContactAll(false);
  };

  return (
    <div className="alumni-results-container">
      <div className="top-bar">
        <div className="template-selector">
          <label>Select Email Template:</label>
          <select value={selectedTemplate} onChange={handleTemplateChange}>
            {templates.map(template => (
              <option key={template._id} value={template._id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <button className="contact-all-button" onClick={confirmContactAll} disabled={loadingContactAll}>
          {loadingContactAll ? 'Sending...' : 'Contact All'}
        </button>
      </div>

      <div className="alumni-list">
        {alumniRaw.length > 0 ? (
          alumniRaw.map((alum, idx) => (
            <div
              key={idx}
              className={`alumni-card ${contacted[alum.email] ? 'contact-card' : ''}`}
            >
              <div className="alumni-info">
                <div className="alumni-details">
                  <h2>{alum.name}</h2>
                  <div className="alumni-job">{alum.title}</div>
                  <div className="tags">
                    {alum.company && <div className="tag">{alum.company}</div>}
                    {alum.location && <div className="tag">{alum.location}</div>}
                  </div>
                  {alum.email && (
                    <div className="email-line">
                      <strong>Email:</strong> {alum.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="alumni-actions">
                {alum.linkedin_url && (
                  <a
                    href={alum.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkedin-icon"
                  >
                    <FaLinkedin />
                  </a>
                )}
                <button
                  className="contact-button"
                  disabled={contacted[alum.email]}
                  onClick={() => handleContact(alum)}
                >
                  {contacted[alum.email] ? 'Contacted' : 'Contact'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No matching alumni found.</p>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Contact All?</h3>
            <p>This will email all alumni listed using the selected template.</p>
            <div className="modal-actions">
              <button className="contact-button" onClick={handleConfirmContactAll}>
                Yes, Send All
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlumniResultsPage;
