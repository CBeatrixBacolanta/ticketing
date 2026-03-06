import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Component Imports
import SideBar from './pages/SideBar';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Schedule from './pages/Schedule';
import ToastNotif from './pages/ToastNotif';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import EditProfile from './pages/EditProfile';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')) || null);
  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // State for the custom Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Updated logic to handle the countdown timing
  const triggerToast = (msg, type = "success") => {
    // Force a reset if a toast is already showing
    setToast({ show: false, message: "", type: "success" });
    
    setTimeout(() => {
      setToast({ show: true, message: msg, type });
    }, 10);

    // Auto-hide after 3 seconds to match CSS animation
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3010);
  };

  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
    triggerToast("Profile updated successfully!");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all notifications?")) {
      setNotifications([]);
      localStorage.removeItem('notifications');
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  // Status Checker Logic for Notifications
  useEffect(() => {
    const checkStatus = () => {
      const savedHearings = JSON.parse(localStorage.getItem('hearings')) || [];
      const now = new Date();
      let hasUpdates = false;

      const updatedHearings = savedHearings.map(h => {
        if (h.status === 'Done') return h;
        try {
          const endTimeStr = h.time.split('to')[1].trim(); 
          const [time, mod] = endTimeStr.split(' ');
          let [hh, mm] = time.split(':');
          let hNum = parseInt(hh);
          
          if (mod.toLowerCase() === 'pm' && hNum !== 12) hNum += 12;
          if (mod.toLowerCase() === 'am' && hNum === 12) hNum = 0;

          const monthMap = { 
            "JAN": 0, "FEB": 1, "MAR": 2, "APR": 3, "MAY": 4, "JUN": 5, 
            "JUL": 6, "AUG": 7, "SEP": 8, "OCT": 9, "NOV": 10, "DEC": 11,
            "JANUARY": 0, "FEBRUARY": 1, "MARCH": 2, "APRIL": 3, "JUNE": 5, 
            "JULY": 6, "AUGUST": 7, "SEPTEMBER": 8, "OCTOBER": 9, "NOVEMBER": 10, "DECEMBER": 11 
          };

          const dateParts = h.date.split(' '); 
          const monthStr = dateParts[0].toUpperCase();
          const year = parseInt(dateParts[2]) || 2026;
          const hearingDate = new Date(year, monthMap[monthStr], parseInt(h.day), hNum, parseInt(mm));

          if (now > hearingDate) {
            hasUpdates = true;
            setNotifications(prev => {
              if (!prev.some(n => n.hearingId === h.id)) {
                triggerToast(`${h.title} Completed`);
                const newNotif = {
                  id: Date.now(), 
                  hearingId: h.id, 
                  title: h.title, 
                  officer: h.officer || "System",
                  time: h.time, 
                  date: h.date, 
                  status: "green",
                  isRead: false
                };
                return [newNotif, ...prev];
              }
              return prev;
            });
            return { ...h, status: 'Done' };
          }
        } catch (e) { console.error(e); }
        return h;
      });

      if (hasUpdates) {
        localStorage.setItem('hearings', JSON.stringify(updatedHearings));
      }
    };

    const interval = setInterval(checkStatus, 30000);
    checkStatus();
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      {/* Toast component stays here so it can be seen on all pages */}
      <ToastNotif toast={toast} setToast={setToast} />
      
      <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        <SideBar 
          user={user} 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          onLogout={handleLogout} 
        />

        <main style={{
          flex: 1,
          marginLeft: sidebarOpen ? '260px' : '0', 
          transition: 'margin-left 0.3s ease-in-out',
          width: '100%',
          background: '#f4f7f6',
          minHeight: '100vh',
          position: 'relative'
        }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard notifications={notifications} onClearAll={handleClearAll} onMarkAsRead={handleMarkAsRead} />} />
            <Route path="/notifications" element={<Notifications notifications={notifications} isFullPage={true} onClearAll={handleClearAll} onMarkAsRead={handleMarkAsRead} />} />
            <Route path="/schedule" element={<Schedule triggerToast={triggerToast} />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/edit-profile" element={<EditProfile user={user} onSave={handleUpdateUser} />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;