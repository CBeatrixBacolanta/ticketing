import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SideBar from './pages/SideBar';
import EditProfile from './pages/EditProfile';
import Remarks from './pages/Remarks';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('profileData');
    return saved ? JSON.parse(saved) : { firstName: "User", email: "email@email.com", profilePic: null };
  });

  const handleUserUpdate = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('profileData', JSON.stringify(updatedData));
  };

  return (
    <Router>
      <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#d1d5db' }}>
        
        {/* Pass state to Sidebar */}
        <SideBar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Dynamic margin-left ensures centering works perfectly */}
        <main className="main-content" style={{ 
          flex: 1, 
          marginLeft: sidebarOpen ? '260px' : '0px', 
          transition: 'all 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 20px'
        }}>
          
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <Routes>
              <Route path="/" element={<Remarks />} />
              <Route path="/edit-profile" element={<EditProfile user={user} onSave={handleUserUpdate} />} />
              <Route path="/remarks" element={<Remarks />} />
            </Routes>
          </div>

        </main>
      </div>
    </Router>
  );
}

export default App;