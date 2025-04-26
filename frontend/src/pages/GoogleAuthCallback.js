import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

function GoogleAuthCallback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL params
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange the code for tokens
        await api.post('/api/mailbox/connect', { code });
        
        // Redirect back to mailbox page with success
        navigate('/link-mailbox', { 
          state: { success: true }
        });
      } catch (err) {
        console.error('Error connecting mailbox:', err);
        setError('Failed to connect your Google account. Please try again.');
        setTimeout(() => {
            navigate('/link-mailbox', { 
                state: { error: 'Failed to connect your Google account' }
            });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, location]);

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Connection Failed</h2>
          <p>{error}</p>
          <p>Redirecting you back...</p>
        </div>
      </div>
    );
  }

  return <LoadingSkeleton />;
}

export default GoogleAuthCallback;