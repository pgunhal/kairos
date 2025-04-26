import React from 'react';
import '../styles/Shared.css';

function MetricCard({ title, value }) {
  return (
    <div className="metric-card">
      <h4>{title}</h4>
      <p className="metric-value">{value}</p>
    </div>
  );
}

export default MetricCard;
