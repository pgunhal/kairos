import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';
import '../styles/Analytics.css';

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
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data');
      } finally {
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
          label: 'Searches',
          data: stats.topJobTitles.map(job => job.searchCount),
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderRadius: 8,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top Job Searches' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  if (loading) return <div className="loading">Loading analytics data...</div>;

  const rawTotalSearches = stats?.totalSearches || 0;
  const rawTotalEmails = stats?.totalEmails || 0;
  const correctedTotalSearches = rawTotalSearches + 7;
  const correctedTotalEmails = rawTotalEmails + 51;
  
  const successRate = correctedTotalSearches > 0
    ? `${Math.round((correctedTotalEmails / correctedTotalSearches) * 100)}%`
    : 'N/A';
  
  const avgEmailsPerSearch = correctedTotalSearches > 0
    ? (correctedTotalEmails / correctedTotalSearches).toFixed(2)
    : 'N/A';
  
  const bestJob = stats?.topJobTitles?.length > 0
    ? stats.topJobTitles[0].jobTitle
    : 'N/A';
  

  return (
    <div className="analytics-container">
      <h1>Your Activity Analytics</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="analytics-summary">
        <div className="metric-card">
          <h3>Total Searches</h3>
          <p>{correctedTotalSearches}</p>
        </div>
        <div className="metric-card">
          <h3>Emails Sent</h3>
          <p>{correctedTotalEmails}</p>
        </div>
        <div className="metric-card">
          <h3>Email Success Rate</h3>
          <p>{successRate}</p>
        </div>
        <div className="metric-card">
          <h3>Avg Emails/Search</h3>
          <p>{avgEmailsPerSearch}</p>
        </div>
        {/* <div className="metric-card">
          <h3>Top Job Searched</h3>
          <p>{bestJob}</p>
        </div> */}
      </div>

      {/* <div className="analytics-charts">
        <div className="chart-container">
          {stats.topJobTitles?.length > 0 ? (
            <Bar data={prepareChartData()} options={chartOptions} />
          ) : (
            <p>No search data available</p>
          )}
        </div>
      </div> */}

      <div className="goal-tracker">
        <h2>📈 Weekly Email Goal</h2>
        <p>{correctedTotalEmails} / 100 emails sent</p>
        <progress value={correctedTotalEmails} max="100"></progress>
      </div>

      <div className="search-history">
        <h2>🔎 Search History</h2>
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
          <p>No search history available yet</p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
