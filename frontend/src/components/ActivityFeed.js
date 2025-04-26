import React from 'react';
import '../styles/Shared.css';

function ActivityFeed({ activities }) {
  return (
    <ul className="activity-feed">
      {activities.map((activity, index) => (
        <li key={index} className="activity-item">
          {activity.type === 'email_sent' ? '📧' : '📅'} {activity.name} — {activity.time}
        </li>
      ))}
    </ul>
  );
}

export default ActivityFeed;
