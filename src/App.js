import React from 'react';
import SideBar from './pages/SideBar';
import EditProfile from './pages/EditProfile';
import './App.css';

function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#d1d5db' }}>
      {/* 1. The Sidebar you just created */}
      <SideBar />

      {/* 2. The Main Content Area */}
      <main style={{ flex: 1, padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <EditProfile />
      </main>
    </div>
  );
}

export default App;