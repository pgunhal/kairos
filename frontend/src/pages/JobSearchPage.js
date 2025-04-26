
// client/src/pages/JobSearchPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/JobSearch.css';

function JobSearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a job title');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/api/jobs/search', { query });
      navigate(`/alumni/${encodeURIComponent(query)}`);
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
      console.error('Search error:', error);
    }
  };

  return (
    <div className="job-search-container">
      <h1>Find Alumni by Job Title</h1>
      <p className="search-description">
        Search for job titles to find alumni who work in those roles.
        You'll be able to reach out to them for networking and career advice.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter job title (e.g. Software Engineer, Data Scientist)"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      <div className="search-tips">
        <h3>Search Tips</h3>
        <ul>
          <li>Be specific with job titles for better results</li>
          <li>Try different variations of the same job title</li>
          <li>Include industry or specialization if relevant</li>
        </ul>
      </div>
      
      <div className="popular-searches">
        <h3>Popular Searches</h3>
        <div className="search-tags">
          <button onClick={() => setQuery('Software Engineer')}>Software Engineer</button>
          <button onClick={() => setQuery('Data Scientist')}>Data Scientist</button>
          <button onClick={() => setQuery('Product Manager')}>Product Manager</button>
          <button onClick={() => setQuery('Marketing Manager')}>Marketing Manager</button>
          <button onClick={() => setQuery('Financial Analyst')}>Financial Analyst</button>
        </div>
      </div>
    </div>
  );
}

export default JobSearchPage;