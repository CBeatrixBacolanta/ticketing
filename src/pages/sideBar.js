import React from 'react';
import '../styles/SideBar.css';
import Logo from '../assets/images/logo.png';
import Profile from '../assets/images/casino.jpg';

const SideBar = () => {
    return (
        <div className="sidebar-container">
            {/* Top Section: Logo & Profile */}
            <div className="sidebar-header">
                {/* The DOLE Logo and Department Text */}
                <div className="dole-header-container">
                    {/* The Logo */}
                    <img src={Logo} alt="DOLE Logo" className="dole-mini-logo" />

                    {/* The Text Block */}
                    <div className="dole-text-block">
                        <p className="gov-text">Republic of the Philippines</p>
                        <p className="dept-text">Department of Labor and Employment</p>
                        <p className="office-text">Regional Office No. X</p>
                        <p className="office-text">Cagayan de Oro - Field Office</p>
                    </div>
                </div>

                <div className="profile-section">
                    <div className="profile-image-container">
                        <img src={Profile} alt="User Profile" className="profile-pic" />
                    </div>
                    <h2 className="profile-name">CASIÑO, Roy S.</h2>
                    <p className="profile-email">roycasino@gmail.com</p>
                    <button className="edit-profile-btn">Edit Profile</button>
                </div>
            </div>

            {/* Navigation Links */}
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