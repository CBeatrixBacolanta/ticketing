import React, { useState } from 'react';
import '../styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, officer: "CASIÑO, Roy S.", action: "hearing completed", time: "13 mins ago", status: "yellow", isRead: false },
    { id: 2, officer: "CASIÑO, Roy S.", action: "hearing completed", time: "26 mins ago", status: "green", isRead: false },
    { id: 3, officer: "CASIÑO, Roy S.", action: "hearing completed", time: "26 mins ago", status: "green", isRead: false },
    { id: 4, officer: "CASIÑO, Roy S.", action: "hearing completed", time: "13 mins ago", status: "yellow", isRead: true },
    { id: 5, officer: "CASIÑO, Roy S.", action: "hearing completed", time: "1 day ago", status: "yellow", isRead: true },
  ]);

  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  return (
    <div className="notifications-fullscreen-v2">
      <div className="notifications-header-v2">
        <button className="back-btn-v2" onClick={() => window.history.back()}>
          ←
        </button>
        <span>Notifications</span>
      </div>
      
      {/* Simple Notification List */}
      <div className="notifications-list-v2">
        {notifications.map((n) => (
          <div 
            key={n.id}
            className="notification-row"
            onClick={() => handleNotificationClick(n.id)}
          >
            <div className="left-accent"></div>

            <div className="notif-main">
              <p className="notif-status">
                <strong>Status:</strong> {n.action}
              </p>

              <p className="notif-remarks">
                Remarks: Quarterly goals reviewed and resource allocation finalized
              </p>

              <p className="notif-officer">
                Officer: <span>{n.officer}</span>
              </p>
            </div>

            <div className="notif-meta">
              <p>🕒 Time: 09:30-10:00 am (Duration: 20 min)</p>
              <p>📅 Date: February 10, 2026</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;