import React, { useState } from 'react';
import '../styles/Settings.css';

function SettingsPage() {
  const [tone, setTone] = useState('professional');

  return (
    <div className="settings-container">
      <h1>Personalization Settings</h1>

      <div className="form-group">
        <label>Email Tone</label>
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="enthusiastic">Enthusiastic</option>
        </select>
      </div>

      <button className="btn btn-primary">Save Settings</button>
    </div>
  );
}

export default SettingsPage;
