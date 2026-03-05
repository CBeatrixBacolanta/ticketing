import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hearings, setHearings] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
    
    const monthMap = {
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };

    const sorted = savedHearings.sort((a, b) => {
      const monthA = monthMap[a.date.split(' ')[0].toUpperCase()];
      const monthB = monthMap[b.date.split(' ')[0].toUpperCase()];
      const dayA = parseInt(a.day || a.date.split(' ')[1]);
      const dayB = parseInt(b.day || b.date.split(' ')[1]);

      if (monthA !== monthB) return monthA - monthB;
      if (dayA !== dayB) return dayA - dayB;

      const parseTimeToMinutes = (timeStr) => {
        const startTime = timeStr.split(' to ')[0]; 
        const [time, modifier] = startTime.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
        if (hours === 12) hours = 0;
        if (modifier.toLowerCase() === 'pm') hours += 12;
        return hours * 60 + minutes;
      };

      return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
    });

    setHearings(sorted);
    const savedNotifs = JSON.parse(localStorage.getItem('notifications')) || [];
    setNotifications(savedNotifs);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getCountForMonth = (monthName) => {
    return hearings.filter(h => 
      h.date && h.date.toUpperCase().includes(monthName.substring(0, 3).toUpperCase())
    ).length;
  };

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
      {showNotifications && (
        <div className="page-overlay" onClick={() => setShowNotifications(false)}></div>
      )}

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
                  
                  <div className="btn-card navy" onClick={() => setShowNotifications(!showNotifications)}>
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
                        <span className="count">{getCountForMonth(m.name)}</span>
                        <span className="month">{m.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="report-column">
                    {reportMonths.filter((_, i) => i % 2 === 1).map((m) => (
                      <div key={m.name} className="report-box">
                        <span className="count">{getCountForMonth(m.name)}</span>
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
                          <span className="m-month">{m.date.split(' ')[0]}</span>
                          <strong className="m-day">{m.day || m.date?.split(' ')[1]}</strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-meetings">
                      No upcoming hearings found in schedule.
                    </div>
                  )}
                </div>

                {/* PAGINATION MOVED TO THE BOTTOM */}
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