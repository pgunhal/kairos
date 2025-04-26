import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/JobSearch.css';

function JobSearchPage() {
  const [filters, setFilters] = useState({
    role: '',
    company: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const res = await api.post('/api/jobs/search', filters);
      console.log('Response from backend:', res.data);
  
    //   navigate(`/alumni/${encodeURIComponent(filters.role || 'all')}`, {
    //     state: { jobs: res.data.jobs.filter(job => job.toLowerCase().includes(filters.role.toLowerCase()))
    //     }
    //   });

      navigate(`/alumni/${encodeURIComponent(filters.role || 'all')}`, {
        state: { alumni: res.data.alumni } // not jobs anymore
      });
      
    } catch (err) {
      console.error('Error searching:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="job-search-container">
      <h1>Find Alumni</h1>
      <p className="search-description">
        Search alumni by role, company, or location to build your network.
      </p>

      {error && <div className="error-message">{error}</div>}

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-group">
          <input
            type="text"
            name="role"
            placeholder="Job Role (e.g. Software Engineer)"
            value={filters.role}
            onChange={handleChange}
          />
          <input
            type="text"
            name="company"
            placeholder="Company (e.g. Google)"
            value={filters.company}
            onChange={handleChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location (e.g. San Francisco)"
            value={filters.location}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      <div className="search-tips">
        <h3>Search Tips</h3>
        <ul>
          <li>Be specific with job titles (e.g., "Front-end Developer" instead of "Developer")</li>
          <li>Try variations of company names (e.g., "Meta" and "Facebook")</li>
          <li>Include city or region for more targeted results</li>
        </ul>
      </div>

      <div className="popular-searches">
        <h3>Quick Picks</h3>
        <div className="search-tags">
          <button type="button" onClick={() => setFilters({ role: 'Software Engineer', company: '', location: '' })}>Software Engineer</button>
          <button type="button" onClick={() => setFilters({ role: 'Data Scientist', company: '', location: '' })}>Data Scientist</button>
          <button type="button" onClick={() => setFilters({ role: 'Product Manager', company: '', location: '' })}>Product Manager</button>
          <button type="button" onClick={() => setFilters({ role: '', company: 'Google', location: '' })}>Google</button>
          <button type="button" onClick={() => setFilters({ role: '', company: '', location: 'New York' })}>New York</button>
        </div>
      </div>
    </div>
  );
}

export default JobSearchPage;
