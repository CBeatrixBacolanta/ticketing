import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const Dashboard = ({ user, notifications, onMarkAsRead, onClearAll }) => {
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);
  const [hearings, setHearings] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const getMinutesAgo = (notificationId) => {
    const now = Date.now();
    const diffInMs = now - notificationId;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    
    if (diffInMinutes < 1) return "Just now";
    return `Done ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  };

  // --- SYNCED DATA LOADING ---
  useEffect(() => {
    const loadAndFilterData = () => {
      const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
      const monthMap = {
        'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
        'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
      };

      // 1. FILTER: Only show what is NOT 'Done'
      const pendingHearings = savedHearings.filter(h => h.status !== 'Done');

      // 2. SORT: Order by Date and Time
      const sorted = pendingHearings.sort((a, b) => {
        const monthA = monthMap[a.date?.split(' ')[0].toUpperCase()] || 0;
        const monthB = monthMap[b.date?.split(' ')[0].toUpperCase()] || 0;
        const dayA = parseInt(a.day || a.date?.split(' ')[1]) || 0;
        const dayB = parseInt(b.day || b.date?.split(' ')[1]) || 0;

        if (monthA !== monthB) return monthA - monthB;
        if (dayA !== dayB) return dayA - dayB;

        const parseTimeToMinutes = (timeStr) => {
          if (!timeStr) return 0;
          const startTime = timeStr.split(' to ')[0]; 
          const [time, modifier] = startTime.split(' ');
          let [hours, minutes] = time.split(':');
          hours = parseInt(hours, 10);
          minutes = parseInt(minutes, 10);
          if (hours === 12) hours = 0;
          if (modifier?.toLowerCase() === 'pm') hours += 12;
          return hours * 60 + minutes;
        };

        return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
      });

      setHearings(sorted);
    };

    loadAndFilterData();
    // Listen for storage changes (e.g. Activity Log updates)
    window.addEventListener('storage', loadAndFilterData);
    return () => window.removeEventListener('storage', loadAndFilterData);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const reportMonths = [
    { name: 'January', key: 'JAN' }, { name: 'April', key: 'APR' },
    { name: 'February', key: 'FEB' }, { name: 'May', key: 'MAY' },
    { name: 'March', key: 'MAR' }, { name: 'June', key: 'JUN' }
  ];

  const totalPages = Math.ceil(hearings.length / itemsPerPage) || 1;
  const currentMeetings = hearings.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="app-container">
      {showPanel && (
        <div className="page-overlay" onClick={() => setShowPanel(false)}></div>
      )}

      {/* --- NOTIFICATION PANEL --- */}
      <div className={`side-notif-panel ${showPanel ? 'open' : ''}`}>
        <div className="side-panel-header">
          <h3>Notifications ({unreadCount})</h3>
          <button className="close-panel-btn" onClick={() => setShowPanel(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="side-panel-scroll">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`side-notif-row ${n.isRead ? 'read' : 'unread'}`}
                onClick={() => !n.isRead && onMarkAsRead(n.id)}
                style={{ cursor: n.isRead ? 'default' : 'pointer' }}
              >
                <div className={`side-accent ${n.status}`}></div>
                <div className="side-notif-body">
                  <p className="notif-title" style={{ fontSize: '14px', marginBottom: '4px' }}>
                    <strong>{n.title}!</strong>
                  </p>
                  <p className="notif-remarks" style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                    Remarks: Task completed. Please see all notifications for more details.
                  </p>
                  <div className="notif-meta-details" style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#999', fontSize: '11px', fontWeight: '500' }}>
                      {getMinutesAgo(n.id)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#999' }}>📅 {n.date}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="none-state">No Notifications</div>
          )}
        </div>

        <div className="side-panel-footer" style={{ display: 'flex', padding: '0', borderTop: '1px solid #eee' }}>
          <button 
            onClick={() => navigate('/notifications')}
            style={{ flex: 1, padding: '15px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', borderRight: '1px solid #eee' }}
          >
            See All Notifications
          </button>
          <button 
            onClick={onClearAll}
            style={{ flex: 1, padding: '15px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#d9534f' }}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="layout-body">
        <main className="main-wrapper">
          <div className="content-area">
            <div className="dashboard-grid">
              <div className="left-col">
                <div className="action-row">
                  <div className="btn-card yellow" onClick={() => navigate('/schedule')}>
                    <svg className="custom-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <p>Schedule</p>
                  </div>
                  
                  <div className="btn-card navy" onClick={() => setShowPanel(true)}>
                    {unreadCount > 0 && <div className="badge">{unreadCount}</div>}
                    <svg className="custom-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <p>Notifications</p>
                  </div>
                </div>

                <h3 className="section-title">Report Summary</h3>
                <div className="report-summary-grid">
                  <div className="report-column">
                    {reportMonths.filter((_, i) => i % 2 === 0).map((m) => (
                      <div key={m.name} className="report-box">
                        <span className="count">{hearings.filter(h => h.date?.toUpperCase().includes(m.key)).length}</span>
                        <span className="month">{m.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="report-column">
                    {reportMonths.filter((_, i) => i % 2 === 1).map((m) => (
                      <div key={m.name} className="report-box">
                        <span className="count">{hearings.filter(h => h.date?.toUpperCase().includes(m.key)).length}</span>
                        <span className="month">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="right-col">
                <div className="upcoming-header-row">
                  <h3 className="section-title">Upcoming Meetings</h3>
                </div>

                <div className="meeting-list">
                  {currentMeetings.length > 0 ? (
                    currentMeetings.map((m, i) => (
                      <div key={i} className="meeting-card">
                        <div className="red-strip"></div>
                        <div className="m-info">
                          <h4>{m.title || "Hearing"}</h4>
                          <p>{m.time}</p>
                        </div>
                        <div className="m-date">
                          <span className="m-month">{m.date?.split(' ')[0]}</span>
                          <strong className="m-day">{m.day || m.date?.split(' ')[1]}</strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-meetings">No upcoming hearings found.</div>
                  )}
                </div>

                {/* PAGINATION DOTS SYSTEM */}
                {hearings.length > itemsPerPage && (
                  <div className="pagination-controls-bottom">
                    <FaChevronLeft 
                      className={`nav-arrow ${currentPage === 0 ? 'disabled' : ''}`}
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    />
                    <div className="pagination-dots">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <span 
                          key={i} 
                          className={`dot-item ${currentPage === i ? 'active' : ''}`} 
                          onClick={() => setCurrentPage(i)} 
                        />
                      ))}
                    </div>
                    <FaChevronRight 
                      className={`nav-arrow ${currentPage === totalPages - 1 ? 'disabled' : ''}`}
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;