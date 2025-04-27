import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import ActivityFeed from '../components/ActivityFeed';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Navbar from '../components/Navbar'; // 👈 IMPORT NAVBAR
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
          // You can optionally populate this later
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
    <div style={{ display: 'flex', height: '100vh' }}>
      <Navbar /> {/* 👈 ADD NAVBAR ON THE SIDE */}

      <div className="dashboard-container" style={{ flex: 1, padding: '40px' }}>
        <h1>Welcome back!</h1>
        <p>Your journey toward meaningful alumni connections continues here.</p>

        <div className="quick-actions">
          <Link to="/search" className="btn btn-primary">🔍 New Search</Link>
          <Link to="/templates" className="btn btn-secondary">📝 Templates</Link>
          <Link to="/analytics" className="btn btn-secondary">📈 View Analytics</Link>
        </div>

        <h2>Your Progress</h2>
        <div className="metric-grid">
          <MetricCard title="Total Searches" value={stats?.totalSearches || 0} />
          <MetricCard title="Emails Sent" value={stats?.totalEmails || 0} />
          <MetricCard title="Success Rate" value={`${Math.round((stats?.totalEmails / (stats?.totalSearches || 1)) * 100)}%`} />
        </div>

        <h2>Recent Activity</h2>
        <ActivityFeed activities={activity} />
      </div>
    </div>
  );
}

export default DashboardPage;
