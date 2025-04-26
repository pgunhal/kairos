// client/src/pages/DashboardPage.js
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Dashboard.css';

function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, searchesRes] = await Promise.all([
          api.get('/api/analytics/user-stats'),
          api.get('/api/jobs/history')
        ]);
        
        setStats(statsRes.data);
        setRecentSearches(searchesRes.data.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.firstName}!</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Searches</h3>
          <p className="stat-number">{stats?.totalSearches || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Emails Sent</h3>
          <p className="stat-number">{stats?.totalEmails || 0}</p>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <Link to="/search" className="action-card">
          <h3>Search Jobs</h3>
          <p>Find alumni in your desired role</p>
        </Link>
        <Link to="/templates" className="action-card">
          <h3>Email Templates</h3>
          <p>Manage your outreach templates</p>
        </Link>
        <Link to="/analytics" className="action-card">
          <h3>Analytics</h3>
          <p>View detailed activity stats</p>
        </Link>
      </div>
      
      <div className="recent-searches">
        <h2>Recent Searches</h2>
        {recentSearches.length > 0 ? (
          <div className="search-list">
            {recentSearches.map((search) => (
              <div key={search._id} className="search-item">
                <div className="search-info">
                  <h4>{search.jobTitle}</h4>
                  <p>Results: {search.resultsCount} | Emails: {search.emailsSent}</p>
                </div>
                <Link to={`/alumni/${encodeURIComponent(search.jobTitle)}`} className="btn btn-small">
                  View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent searches</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;