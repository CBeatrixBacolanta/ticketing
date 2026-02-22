import React from 'react';
import '../styles/SideBar.css';
import Logo from '../assets/images/logo.png';
import DefaultProfile from '../assets/images/casino.jpg';

const SideBar = ({ user }) => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <div className="dole-header-container">
          <img src={Logo} alt="DOLE Logo" className="dole-mini-logo" />
          <div className="dole-text-block">
            <p className="gov-text">Republic of the Philippines</p>
            <p className="dept-text">Department of Labor and Employment</p>
            <p className="office-text">Regional Office No. X</p>
            <p className="office-text">Cagayan de Oro - Field Office</p>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-image-container">
            <img
              src={user.profilePic || DefaultProfile}
              alt="User Profile"
              className="profile-pic"
            />
          </div>
          {/* UPDATED: Dynamic Last Name, First Name, and Middle Initial */}
          <h2 className="profile-name">
            {user.lastName.toUpperCase()}, {user.firstName} {user.middleInitial ? `${user.middleInitial}.` : ''}
          </h2>
          <p className="profile-email">{user.email}</p>
          <button className="edit-profile-btn">Edit Profile</button>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/schedule">Schedule</a></li>
          <li><a href="/settings">Settings</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;