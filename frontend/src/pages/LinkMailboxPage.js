import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/LinkMailbox.css';

function LinkMailboxPage() {
  const [linkedEmail, setLinkedEmail] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const checkMailboxStatus = async () => {
    try {
      const response = await api.get('/api/mailbox/status');
      if (response.data.isConnected) {
        setLinkedEmail(response.data.email || 'Your Google account');
      } else {
        setLinkedEmail(null);
      }
      setSuccessMessage('');
      setError('');
      // Clear location state
      if (location.state) {
        navigate(location.pathname, { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // If 404, assume mailbox is not connected
        setLinkedEmail(null);
        setError('');
      } else {
        console.error('Error checking mailbox status:', err);
        setError('Failed to check mailbox connection status.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only check status if we haven't just completed OAuth flow
    if (!location.state?.success) {
      checkMailboxStatus();
    } else {
      // If we just completed OAuth flow successfully, just update the state
      setLinkedEmail('Your Google account');
      setLoading(false);
      setError('');
      // Clear location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const handleGoogleConnect = async () => {
    setError('');
    try {
      const response = await api.get('/api/mailbox/auth-url');
      window.location.href = response.data.url;
    } catch (err) {
      setError('Failed to initiate Google connection. Please try again.');
      console.error('Error getting auth URL:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await api.delete('/api/mailbox/revoke');
      if (!response.data.isConnected) {
        setLinkedEmail(null);
        setError('');
        setSuccessMessage('Mailbox successfully disconnected');
      } else {
        setError('Failed to disconnect mailbox. Please try again.');
      }
    } catch (err) {
      setError('Failed to disconnect mailbox. Please try again.');
      console.error('Error disconnecting mailbox:', err);
    }
  };

  if (loading) {
    return <div className="settings-container">
      <h1>Link Your Google Mailbox</h1>
      <div className="loading">Checking connection status...</div>
    </div>;
  }

  return (
    <div className="settings-container">
      <h1>Link Your Google Mailbox</h1>
      <p className="description">
        Connect your Google Mail account to enable automatic email sending and tracking.
      </p>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {linkedEmail ? (
        <div className="success-message">
          <h3>✓ Mailbox Connected</h3>
          <p>{linkedEmail}</p>
          <button 
            className="btn btn-secondary"
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="google-login-container">
          <button 
            className="btn btn-primary"
            onClick={handleGoogleConnect}
          >
            Connect with Google
          </button>
        </div>
      )}

      <div className="info-section">
        <h3>What happens when you connect?</h3>
        <ul>
          <li>We can send emails on your behalf</li>
          <li>Track email open rates and responses</li>
          <li>Automatically follow up with contacts</li>
        </ul>
        <p className="privacy-note">
          We value your privacy. We will never read or store your personal emails.
        </p>
      </div>
    </div>
  );
}

export default LinkMailboxPage;