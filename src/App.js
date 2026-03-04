import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SideBar from './pages/SideBar';
import EditProfile from './pages/EditProfile';
import Remarks from './pages/Remarks';
import Settings from './pages/Settings';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('profileData');
    const baseData = { 
      firstName: "User", 
      lastName: "", 
      middleInitial: "", 
      email: "email@email.com", 
      profilePic: "" 
    };
    return saved ? { ...baseData, ...JSON.parse(saved) } : baseData;
  });

  const handleUserUpdate = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('profileData', JSON.stringify(updatedData));
  };

  return (
    <Router>
      <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#d1d5db' }}>
        <SideBar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="main-content" style={{ 
          flex: 1, 
          marginLeft: sidebarOpen ? '260px' : '0px', 
          transition: 'all 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '0' // Removed padding for full-width background
        }}>
          {/* Container set to 100% width */}
          <div style={{ width: '100%' }}>
            <Routes>
              <Route path="/" element={<Remarks />} />
              <Route path="/edit-profile" element={<EditProfile user={user} onSave={handleUserUpdate} />} />
              <Route path="/remarks" element={<Remarks />} />
              <Route path="/settings" element={<Settings user={user} onSave={handleUserUpdate} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;