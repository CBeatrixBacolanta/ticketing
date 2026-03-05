import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './pages/ScrollToTop';
import SideBar from './pages/SideBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import EditProfile from './pages/EditProfile';
import Remarks from './pages/Remarks'; // IMPORT REMARKS

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [
      { id: 1, officer: "CASIÑO, Roy S.", action: "hearing completed", time: "13 mins ago", status: "yellow", isRead: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <ScrollToTop />
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#d1d5db' }}>
          <SideBar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onLogout={handleLogout} />

          <main className="main-content" style={{
            flex: 1,
            marginLeft: sidebarOpen ? '260px' : '0px',
            transition: 'all 0.3s ease-in-out',
            width: '100%'
          }}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard user={user} notifications={notifications} />} />
              <Route path="/notifications" element={<Notifications notifications={notifications} onMarkAsRead={handleMarkAsRead} />} />
              <Route path="/reports" element={<Reports user={user} />} />
              <Route
                path="/settings"
                element={
                  <Settings
                    user={user}
                    onSave={handleLogin}
                    onLogout={handleLogout} // THIS WAS MISSING
                  />
                }
              />
              <Route path="/schedule" element={<Schedule user={user} />} />
              <Route path="/edit-profile" element={<EditProfile user={user} setUser={setUser} />} />

              <Route path="/remarks/:id" element={<Remarks />} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;