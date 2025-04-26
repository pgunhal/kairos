// client/src/pages/AnalyticsPage.js
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';
import '../styles/Analytics.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, searchesRes] = await Promise.all([
          api.get('/api/analytics/user-stats'),
          api.get('/api/jobs/history')
        ]);
        
        setStats(statsRes.data);
        setRecentSearches(searchesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const prepareChartData = () => {
    if (!stats || !stats.topJobTitles) return null;
    
    return {
      labels: stats.topJobTitles.map(job => job.jobTitle),
      datasets: [
        {
          label: 'Search Count',
          data: stats.topJobTitles.map(job => job.searchCount),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Job Searches'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics data...</div>;
  }

  return (
    <div className="analytics-container">
      <h1>Your Activity Analytics</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="analytics-summary">
        <div className="stat-card">
          <h3>Total Searches</h3>
          <p className="stat-number">{stats?.totalSearches || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Emails Sent</h3>
          <p className="stat-number">{stats?.totalEmails || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Email Success Rate</h3>
          <p className="stat-number">
            {stats?.totalSearches > 0 
              ? `${Math.round((stats.totalEmails / stats.totalSearches) * 100)}%` 
              : '0%'}
          </p>
        </div>
      </div>
      
      <div className="analytics-charts">
        <div className="chart-container">
          <h2>Top Job Searches</h2>
          {stats?.topJobTitles && stats.topJobTitles.length > 0 ? (
            <Bar data={prepareChartData()} options={chartOptions} />
          ) : (
            <p>No search data available</p>
          )}
        </div>
      </div>

      <div className="goal-tracker">
        <h3>📅 Weekly Goal</h3>
        <p>{stats?.totalEmails || 0} / 10 emails sent</p>
        <progress value={stats?.totalEmails || 0} max="10"></progress>
    </div>

      
      <div className="search-history">
        <h2>Search History</h2>
        {recentSearches.length > 0 ? (
          <table className="history-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Date</th>
                <th>Results</th>
                <th>Emails Sent</th>
              </tr>
            </thead>
            <tbody>
              {recentSearches.map((search) => (
                <tr key={search._id}>
                  <td>{search.jobTitle}</td>
                  <td>{new Date(search.timestamp).toLocaleDateString()}</td>
                  <td>{search.resultsCount}</td>
                  <td>{search.emailsSent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No search history available</p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;