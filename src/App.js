import React, { useState } from 'react';
import SideBar from './pages/sideBar';
import EditProfile from './pages/editProfile';
import './App.css';

function App() {
  // Just a "Mock Database"
  const [user, setUser] = useState({
    firstName: "Roy",
    middleInitial: "S", // Added this
    lastName: "Casiño",
    email: "roycasino@gmail.com",
    position: "SR. LEO",
    profilePic: null
  });

  // Function to save changes from EditProfile back to the app
  const handleUserUpdate = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <div className="app-layout">
      <SideBar user={user} />
      <main className="main-content">
        <EditProfile user={user} onSave={handleUserUpdate} />
      </main>
    </div>
  );
}

export default App;