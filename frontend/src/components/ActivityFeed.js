import React from 'react';
import '../styles/Shared.css';

function ActivityFeed({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'email_sent':
        return '📧';
      case 'meeting_scheduled':
        return '📅';
      case 'profile_viewed':
        return '👁️';
      case 'connection_made':
        return '🤝';
      default:
        return '📌';
    }
  };

  const getActivityClass = (type) => {
    switch (type) {
      case 'email_sent':
        return 'activity-email';
      case 'meeting_scheduled':
        return 'activity-meeting';
      case 'profile_viewed':
        return 'activity-profile';
      case 'connection_made':
        return 'activity-connection';
      default:
        return '';
    }
  };

  return (
    <div className="activity-feed-container">
      {activities.map((activity, index) => (
        <div key={index} className={`activity-item ${getActivityClass(activity.type)}`}>
          <div className="activity-icon">
            {getActivityIcon(activity.type)}
          </div>
          <div className="activity-content">
            <p className="activity-text">
              <span className="activity-name">{activity.name}</span>
              <span className="activity-action">
                {activity.type === 'email_sent' 
                  ? 'received your email' 
                  : activity.type === 'meeting_scheduled'
                  ? 'scheduled a meeting with you'
                  : 'connected with you'}
              </span>
            </p>
            <p className="activity-time">{activity.time}</p>
          </div>
        </div>
      ))}
      {activities.length === 0 && (
        <div className="no-activity">
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
