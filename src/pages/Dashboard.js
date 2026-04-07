import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { FaTimes } from 'react-icons/fa';

const Dashboard = ({ user, notifications, onMarkAsRead, onClearAll }) => {
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);
  const [hearings, setHearings] = useState([]);
  
  // 1. IMPROVED NAME LOGIC: Check props, then the 'user' object in storage
  const [currentName, setCurrentName] = useState(() => {
    if (user?.firstName) return user.firstName;
    
    // Attempt to pull from the saved user object in localStorage
    try {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      return savedUser?.firstName || "User";
    } catch (e) {
      return "User";
    }
  });

  const reportMonths = [
    { name: 'January', key: 'JAN' }, { name: 'February', key: 'FEB' },
    { name: 'March', key: 'MAR' }, { name: 'April', key: 'APR' },
    { name: 'May', key: 'MAY' }, { name: 'June', key: 'JUN' },
    { name: 'July', key: 'JUL' }, { name: 'August', key: 'AUG' },
    { name: 'September', key: 'SEP' }, { name: 'October', key: 'OCT' },
    { name: 'November', key: 'NOV' }, { name: 'December', key: 'DEC' }
  ];

  // 2. Sync name when the 'user' prop changes (from EditProfile save)
  useEffect(() => {
    if (user?.firstName) {
      setCurrentName(user.firstName);
    } else {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser?.firstName) {
        setCurrentName(savedUser.firstName);
      }
    }
  }, [user]);

  // 3. Sync Report Summary with Daily Records and handle storage events
  useEffect(() => {
    const loadData = () => {
      // Load Hearings
      const savedData = JSON.parse(localStorage.getItem('hearings')) || [];
      setHearings(savedData);
      
      // Secondary check for name sync across tabs
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser?.firstName) setCurrentName(savedUser.firstName);
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="dashboard-container">
      {showPanel && <div className="overlay" onClick={() => setShowPanel(false)} />}

      <div className={`side-notif-panel ${showPanel ? 'open' : ''}`}>
        <div className="side-panel-header">
          <h3>Notifications ({unreadCount})</h3>
          <button className="close-panel-btn" onClick={() => setShowPanel(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="side-panel-content">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`side-notif-item ${n.isRead ? 'read' : 'unread'}`}
                onClick={() => !n.isRead && onMarkAsRead(n.id)}
              >
                <p><strong>{n.title}</strong></p>
                <small>{n.date}</small>
              </div>
            ))
          ) : (
            <div className="empty-notifs">No new notifications</div>
          )}
        </div>

        <div className="side-panel-footer">
          <button 
            className="footer-action-btn" 
            onClick={() => navigate('/notifications')}
          >
            See All
          </button>
          <button 
            className="footer-action-btn clear-btn" 
            onClick={onClearAll}
          >
            Clear All
          </button>
        </div>
      </div>

      <main className="dashboard-content">
        <header className="welcome-section">
          <h1>Hello {currentName},</h1>
          <p>What's on the agenda for today?</p>
        </header>

        <div className="quick-actions">
          <div className="action-card yellow" onClick={() => navigate('/schedule')}>
            <div className="action-icon">📅</div>
            <span>Schedule</span>
          </div>

          <div className="action-card navy" onClick={() => setShowPanel(true)}>
            <div className="action-icon">
              🔔
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </div>
            <span>Notifications</span>
          </div>
        </div>

        <section className="summary-section">
          <h2>Report Summary</h2>
          <div className="summary-grid">
            {reportMonths.map((m) => (
              <div key={m.name} className="month-card">
                <div className="month-count">
                  {hearings.filter(h => h.date?.toUpperCase().includes(m.key)).length}
                </div>
                <div className="month-label">{m.name}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;