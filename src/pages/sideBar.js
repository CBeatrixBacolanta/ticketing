import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserEdit, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";

const SideBar = ({ user, isOpen, setIsOpen, onLogout }) => { 
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to check if a path is active
  const isActive = (path) => location.pathname === path;

  // Handle Logout with confirmation
  const handleLogoutClick = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout(); 
      navigate('/login');
    }
  };

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
        
        .ad-name { font-size: 16px; font-weight: 800; margin: 0; text-align: center; padding: 0 5px; color: white; }
        .ad-email { font-size: 12px; color: #cbd5e0; margin-top: 2px; opacity: 0.9; word-break: break-all; text-align: center; }
        
        .edit-profile-btn { background: none; border: none; color: #4ba2f3; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 5px; margin-top: 12px; }

        nav { width: 100%; display: flex; flex-direction: column; gap: 5px; }
        .nav-link { 
          color: white; 
          text-decoration: none; 
          padding: 12px; 
          border-radius: 8px; 
          font-size: 14px; 
          border: none; 
          background: none; 
          cursor: pointer;
          transition: 0.2s; 
          width: 100%; 
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .nav-link:hover, .nav-link.active { 
          background: rgba(255,255,255,0.1); 
          color: #00c6ff; 
          font-weight: bold;
        }

        .logout-link {
          color: #ff4d4d !important;
          margin-top: 20px;
        }
        .logout-link:hover {
          background: rgba(255, 77, 77, 0.1) !important;
        }
      `}</style>

      {/* Button to show sidebar when closed */}
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
          {/* Profile Picture Fallback */}
          {user?.profilePic ? (
             <img src={user.profilePic} className="profile-img" alt="User" />
          ) : (
            <div style={{width: '90px', height: '90px', borderRadius: '50%', background: '#cbd5e0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: '2px solid white'}}>
              <svg viewBox="0 0 24 24" fill="#718096" width="50" height="50"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            </div>
          )}
          
          {/* NAME DISPLAY: Defaults to "User" if names are empty */}
          <h4 className="ad-name">
            {user?.firstName || user?.lastName 
              ? `${user.firstName} ${user.middleInitial ? `${user.middleInitial}. ` : ""}${user.lastName}` 
              : "User"}
          </h4>

          {/* EMAIL DISPLAY: Defaults to email@email.com */}
          <p className="ad-email">{user?.email || "email@email.com"}</p>
          
          <button 
            className={`edit-profile-btn ${isActive('/edit-profile') ? 'active' : ''}`} 
            onClick={() => navigate("/edit-profile")}
          >
            <FaUserEdit /> Edit Profile
          </button>
        </div>

        <nav>
          <button 
            className={`nav-link ${isActive('/') || isActive('/dashboard') ? 'active' : ''}`} 
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>

          <button 
            className={`nav-link ${isActive('/reports') ? 'active' : ''}`} 
            onClick={() => navigate('/reports')}
          >
            Report
          </button>

          <button 
            className={`nav-link ${isActive('/settings') ? 'active' : ''}`} 
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
          
          <button className="nav-link logout-link" onClick={handleLogoutClick}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default SideBar;