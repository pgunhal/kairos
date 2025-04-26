import React from 'react';
import { useLocation } from 'react-router-dom';

function AlumniResultsPage() {
  const location = useLocation();
  const jobs = location.state?.jobs || []; 

  return (
    <div className="alumni-results-container">
      <h1>Alumni Matches</h1>
      <div className="alumni-list">
        {jobs.length > 0 ? (
          jobs.map((job, idx) => (
            <div key={idx} className="alumni-card">
              <h3>{job}</h3>
            </div>
          ))
        ) : (
          <p>No matching alumni found.</p>
        )}
      </div>
    </div>
  );
}

export default AlumniResultsPage;
