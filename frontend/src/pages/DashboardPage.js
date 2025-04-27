import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import ActivityFeed from '../components/ActivityFeed';
import LoadingSkeleton from '../components/LoadingSkeleton';
import '../styles/Dashboard.css';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await api.get('/api/analytics/user-stats');
        setStats(statsRes.data);
        setActivity([
          { type: 'email_sent', name: 'Pranav Gunhal!', time: '2 hours ago' },
          { type: 'meeting_scheduled', name: 'Jane Smith', time: '5 hours ago' }
        ]);
      } catch (error) {
        console.error('Error loading dashboard', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="gradient-overlay"></div>
        <h1>Welcome back!</h1>
        <p>Your journey toward meaningful alumni connections continues here.</p>
      </div>

      <div className="quick-actions">
        <Link to="/templates" className="action-button secondary">
          <span className="icon">📝</span>
          Email Templates
        </Link>
        <Link to="/search" className="action-button secondary">
          <span className="icon">🔍</span>
          New Search
        </Link>
        <Link to="/analytics" className="action-button secondary">
          <span className="icon">📊</span>
          View Analytics
        </Link>
        <Link to="/profile" className="action-button secondary">
          <span className="icon">👤</span>
          Update Profile
        </Link>
      </div>

      <h2 className="section-title">Your Progress</h2>
      <div className="metric-grid">
        <div className="metric-card">
          <p className="metric-card-title">Total Searches</p>
          <h3 className="metric-card-value">{stats?.totalSearches+7 || 0}</h3>
          <p className="metric-card-trend">
            Sweet!
          </p>
        </div>
        
        <div className="metric-card">
          <p className="metric-card-title">Emails Sent</p>
          <h3 className="metric-card-value">{stats?.totalEmails+51 || 0}</h3>
          <p className="metric-card-trend">
            Good Work!
          </p>
        </div>
        
        <div className="metric-card">
          <p className="metric-card-title">Success Rate</p>
          <h3 className="metric-card-value">{`${Math.round((stats?.totalEmails+7 / (stats?.totalSearches+51 || 1)) * 100)}%`}</h3>
          <p className="metric-card-trend">
            Awesome job!
          </p>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="footer-sections">
          <div>
            <h2 className="section-title">Recent Activity</h2>
            <div className="compact-activity">
              {activity.length > 0 ? (
                <ActivityFeed activities={activity.slice(0, 1)} />
              ) : (
                <p>No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
