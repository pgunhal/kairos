import React from 'react';
import '../styles/Shared.css';

function MetricCard({ title, value, trend }) {
  return (
    <div className="metric-card">
      <p className="metric-card-title">{title}</p>
      <h3 className="metric-card-value">{value}</h3>
      {trend && <p className="metric-card-trend">{trend}</p>}
    </div>
  );
}

export default MetricCard;
