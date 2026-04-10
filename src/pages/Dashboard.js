import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { FaTimes } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const Dashboard = ({ user, notifications, onMarkAsRead, onClearAll }) => {
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);
  const [hearings, setHearings] = useState([]);
  
  const now = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const [selectedMonth, setSelectedMonth] = useState(monthNames[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [reportData, setReportData] = useState([]);
  
  // Cleaned up: Removed setCurrentName as it was causing the warning
  const currentName = user?.firstName || "User";

  const reportMonths = [
    { name: 'January', key: 'JAN' }, { name: 'February', key: 'FEB' },
    { name: 'March', key: 'MAR' }, { name: 'April', key: 'APR' },
    { name: 'May', key: 'MAY' }, { name: 'June', key: 'JUN' },
    { name: 'July', key: 'JUL' }, { name: 'August', key: 'AUG' },
    { name: 'September', key: 'SEP' }, { name: 'October', key: 'OCT' },
    { name: 'November', key: 'NOV' }, { name: 'December', key: 'DEC' }
  ];

  useEffect(() => {
    const loadData = () => {
      const savedData = JSON.parse(localStorage.getItem('hearings')) || [];
      setHearings(savedData);
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  useEffect(() => {
    const processGraphData = () => {
      const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
      const dailyCounts = Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        clients: 0 
      }));

      savedHearings.forEach(h => {
        if (h.status?.toLowerCase() === 'done') {
          let hMonth = "";
          let hDay = 0;
          let hYear = parseInt(h.year || 2026);

          if (h.date && h.date.includes(' ')) {
            const parts = h.date.split(' ');
            const monthMap = { 
              'JAN':'January','FEB':'February','MAR':'March','APR':'April','MAY':'May','JUN':'June',
              'JUL':'July','AUG':'August','SEP':'September','OCT':'October','NOV':'November','DEC':'December' 
            };
            hMonth = monthMap[parts[0].toUpperCase()];
            hDay = parseInt(parts[1]);
          } else {
            hMonth = h.monthName;
            hDay = parseInt(h.day);
          }

          if (hMonth === selectedMonth && hYear === selectedYear) {
            if (dailyCounts[hDay - 1]) {
              dailyCounts[hDay - 1].clients += 1;
            }
          }
        }
      });
      setReportData(dailyCounts);
    };

    processGraphData();
    window.addEventListener('storage', processGraphData);
    return () => window.removeEventListener('storage', processGraphData);
  }, [selectedMonth, selectedYear]);

  const renderCustomLabel = ({ x, y, width, value }) => {
    if (value === 0) return null;
    return (
      <text x={x + width / 2} y={y - 10} fill="#666" textAnchor="middle" fontSize="12" fontWeight="bold">
        {value}
      </text>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="dashboard-container">
      {showPanel && <div className="overlay" onClick={() => setShowPanel(false)} />}
      <div className={`side-notif-panel ${showPanel ? 'open' : ''}`}>
        <div className="side-panel-header">
          <h3>Notifications ({unreadCount})</h3>
          <button className="close-panel-btn" onClick={() => setShowPanel(false)}><FaTimes /></button>
        </div>
        <div className="side-panel-content">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className={`side-notif-item ${n.isRead ? 'read' : 'unread'}`} onClick={() => !n.isRead && onMarkAsRead(n.id)}>
                <p><strong>{n.title}</strong></p>
                <small>{n.date}</small>
              </div>
            ))
          ) : <div className="empty-notifs">No new notifications</div>}
        </div>
      </div>

      <main className="dashboard-content">
        <header className="dashboard-header-main">
          <div className="welcome-section">
            <h1>Hello {currentName},</h1>
            <p>Your successful sessions report.</p>
          </div>
        </header>

        <div className="quick-actions">
          <div className="action-card yellow" onClick={() => navigate('/schedule')}>
            <div className="action-icon">📅</div>
            <span>Schedule</span>
          </div>
          <div className="action-card navy" onClick={() => setShowPanel(true)}>
            <div className="action-icon">🔔 {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}</div>
            <span>Notifications</span>
          </div>
        </div>

        <section className="summary-section">
          <h2>Report Summary</h2>
          <div className="summary-grid">
            {reportMonths.map((m) => (
              <div key={m.name} className="month-card">
                <div className="month-count">
                  {hearings.filter(h => (h.date?.toUpperCase().includes(m.key) || h.monthName === m.name) && h.status?.toLowerCase() === 'done').length}
                </div>
                <div className="month-label">{m.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="daily-report-section">
          <div className="reports-header-container">
            <h2 className="reports-title">Daily Report Graph</h2>
            <div className="reports-filters">
              <select className="month-dropdown" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {monthNames.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="month-dropdown" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="reports-main-card shadow-glow">
            <div className="reports-grid-layout">
              <div className="officer-summary">
                <div className="officer-avatar-wrapper">
                  {user?.profilePic ? <img src={user.profilePic} alt="PFP" /> : <div className="avatar-placeholder">?</div>}
                </div>
                <h3 className="officer-name">{user?.lastName}, {user?.firstName}</h3>
                <p className="officer-role">SR. LEO</p>
              </div>

              <div className="graph-section-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={reportData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} width={30} />
                    <Tooltip />
                    <Bar dataKey="clients" fill="#030a49" radius={[10, 10, 0, 0]} barSize={15}>
                      <LabelList dataKey="clients" content={renderCustomLabel} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;