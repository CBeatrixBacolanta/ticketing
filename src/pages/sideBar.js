import React from 'react';
import { Link } from 'react-router-dom'; // Crucial for navigation without refreshing
import '../styles/SideBar.css';
import Logo from '../assets/images/logo.png';
import DefaultProfile from '../assets/images/casino.jpg';

const SideBar = ({ user }) => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        {/* DOLE Branding Section */}
        <div className="dole-header-container">
          <img src={Logo} alt="DOLE Logo" className="dole-mini-logo" />
          <div className="dole-text-block">
            <p className="gov-text">Republic of the Philippines</p>
            <p className="dept-text">Department of Labor and Employment</p>
            <p className="office-text">Regional Office No. X</p>
            <p className="office-text">Cagayan de Oro - Field Office</p>
          </div>
        </div>

        {/* Dynamic Profile Section */}
        <div className="profile-section">
          <div className="profile-image-container">
            <img 
              src={user.profilePic || DefaultProfile} 
              alt="User Profile" 
              className="profile-pic" 
            />
          </div>
          <h2 className="profile-name">
            {/* Displays: LASTNAME, Firstname M. */}
            {user.lastName.toUpperCase()}, {user.firstName} {user.middleInitial ? `${user.middleInitial}.` : ''}
          </h2>
          <p className="profile-email">{user.email}</p>
          
          {/* Link to the Edit Profile Page */}
          <Link to="/edit-profile" className="edit-profile-btn-link">
            <button className="edit-profile-btn">Edit Profile</button>
          </Link>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/remarks">Hearing Remarks</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/schedule">Schedule</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
          <li className="logout-item">
            <Link to="/logout">Logout</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;