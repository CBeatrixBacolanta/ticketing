import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserEdit, FaBars, FaTimes } from "react-icons/fa";

const SideBar = ({ user, isOpen, setIsOpen }) => { 
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <style>{`
        .sidebar-container {
          width: 260px;
          background: #030a49;
          color: white;
          position: fixed; 
          top: 0;
          left: 0;
          height: 100vh;
          padding: 20px;
          transition: transform 0.3s ease-in-out;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: ${isOpen ? "translateX(0)" : "translateX(-260px)"};
        }

        .gov-header { 
          position: relative; 
          display: flex; 
          gap: 10px; 
          margin-bottom: 40px; 
          width: 100%;
          padding-right: 25px;
        }

        .menu-toggle { background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center; }
        .open-btn { position: absolute; top: 0; right: 0; font-size: 1.2rem; }
        
        .closed-btn {
          position: fixed; top: 20px; left: 20px; z-index: 1100;
          background: #030a49; padding: 10px; border-radius: 4px; color: white;
          border: none; cursor: pointer;
          display: ${isOpen ? "none" : "block"};
        }

        .gov-logo { width: 45px; height: 45px; margin-top: 5px; }
        .gov-text { text-align: left; }
        .gov-text p { font-size: 8px; margin: 0; text-transform: uppercase; color: #cbd5e0; }
        .gov-text h4 { font-size: 10px; margin: 2px 0; font-weight: bold; line-height: 1.2; }

        .profile-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; width: 100%; }
        .profile-img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 2px solid white; margin-bottom: 12px; }
        
        .ad-name { font-size: 16px; font-weight: 800; margin: 0; text-align: center; padding: 0 5px; }
        .ad-email { font-size: 12px; color: #cbd5e0; margin-top: 2px; opacity: 0.9; word-break: break-all; text-align: center; }
        
        .edit-profile-btn { background: none; border: none; color: #4ba2f3; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 5px; margin-top: 12px; }

        nav { width: 100%; display: flex; flex-direction: column; gap: 5px; }
        .nav-link { 
          color: white; text-decoration: none; padding: 12px; border-radius: 8px; 
          font-size: 14px; text-align: left; border: none; background: none; cursor: pointer;
          transition: 0.2s; width: 100%; text-align: center;
        }
        .nav-link:hover, .nav-link.active { background: rgba(255,255,255,0.1); color: #00c6ff; }
      `}</style>

      <button className="closed-btn" onClick={() => setIsOpen(true)}>
        <FaBars />
      </button>

      <aside className="sidebar-container">
        <div className="gov-header">
          <img src={require("../assets/images/logo.png")} alt="Logo" className="gov-logo" />
          <div className="gov-text">
            <p>Republic of the Philippines</p>
            <h4>Department of Labor and Employment</h4>
            <p>DOLE Regional Office No. X</p>
            <p>Cagayan de Oro - Field Office</p>
            <button className="menu-toggle open-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="profile-section">
          {user.profilePic ? (
             <img src={user.profilePic} className="profile-img" alt="User" />
          ) : (
            <div style={{width: '90px', height: '90px', borderRadius: '50%', background: '#cbd5e0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: '2px solid white'}}>
              <svg viewBox="0 0 24 24" fill="#718096" width="50" height="50"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            </div>
          )}
          {/* Formatted Name */}
          <h4 className="ad-name">
            {user.firstName} {user.middleInitial ? `${user.middleInitial}. ` : ""}{user.lastName}
          </h4>
          {/* Display Email */}
          <p className="ad-email">{user.email}</p>
          
          <button className="edit-profile-btn" onClick={() => navigate("/edit-profile")}>
            <FaUserEdit /> Edit Profile
          </button>
        </div>

        <nav>
          <button className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>Dashboard</button>
          <button className="nav-link">Schedule</button>
          <button className="nav-link">Report</button>
          <button className="nav-link" onClick={() => navigate('/edit-profile')}>Settings</button>
          <button className="nav-link">Logout</button>
        </nav>
      </aside>
    </>
  );
};

export default SideBar;