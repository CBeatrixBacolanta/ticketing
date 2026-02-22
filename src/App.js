import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SideBar from './pages/SideBar';
import EditProfile from './pages/EditProfile';
import Remarks from './pages/Remarks';
import './App.css';

function App() {
  const [user, setUser] = useState({
    firstName: "Roy",
    middleInitial: "S",
    lastName: "Casiño",
    email: "roycasino@gmail.com",
    position: "SR. LEO",
    profilePic: null 
  });

  const handleUserUpdate = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <Router>
      <div className="app-layout">
        <SideBar user={user} />
        
        <main className="main-content">
          <Routes>
            {/* This sets the "Home" page to Remarks so you see it first */}
            <Route path="/" element={<Remarks />} /> 
            
            {/* This sets the path for Edit Profile */}
            <Route path="/edit-profile" element={
              <EditProfile user={user} onSave={handleUserUpdate} />
            } />
            
            {/* You can add more routes here as your teammate finishes them */}
            <Route path="/remarks" element={<Remarks />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;