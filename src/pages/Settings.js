import React, { useState, useEffect } from "react";
import "../styles/Settings.css";

const Settings = ({ user, onSave }) => {
  const [notifications, setNotifications] = useState(true);
  const [password, setPassword] = useState("password123");

  // 1. Notification State
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // 2. Auto-hide notification after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 3. Helper to trigger the toast
  const triggerToast = (message, type) => {
    setToast({ show: true, message: message, type: type });
  };

  const handleSave = () => {
    // Simulated success logic
    onSave(user);
    triggerToast("Settings saved successfully!", "success");
  };

  const handleDiscard = () => {
    // Simulated error/warning logic
    triggerToast("Changes discarded!", "error");
  };

  const handleDelete = () => {
    triggerToast("Account deletion is disabled in demo mode.", "error");
  };

  return (
    <div className="settings-page">
      {/* 4. The Notification Toast UI */}
      {toast.show && (
        <div className={`notification-toast ${toast.type}`}>
          <span className="toast-icon">{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
        </div>
      )}

      <div className="settings-bg-split"></div>
      
      <div className="settings-content-wrapper">
        <div className="settings-header">
          <h1 className="settings-title"> Settings</h1>
        </div>

        <div className="settings-main-layout">
          <div className="settings-column">
            <div className="settings-card shadow-glow">
              <h3>Notifications</h3>
              <p className="sub-text">Enable all notifications</p>
              <div className="notif-control">
                <div className="status-indicator">
                  <span className={notifications ? "text-on" : "text-off"}>• On</span>
                  <span className={!notifications ? "text-on" : "text-off"}>Off</span>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
                  <span className="settings-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-card shadow-glow">
              <h3>Account Management</h3>
              <div className="settings-input-container">
                <input 
                  type="password" 
                  className="settings-input"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              <button className="btn-delete-account" onClick={handleDelete}>Delete Account</button>
            </div>
          </div>

          <div className="settings-column">
            <div className="settings-card profile-card-center shadow-glow">
              <h3>Profile Picture</h3>
              <div className="profile-avatar-border">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="User Profile" className="profile-avatar-img" />
                ) : (
                  <div className="profile-placeholder">User Profile</div>
                )}
              </div>
              <h2 className="profile-display-name">
                {user.firstName} {user.middleInitial ? `${user.middleInitial}. ` : ""}{user.lastName}
              </h2>
              <button className="btn-logout-settings">Logout</button>
            </div>
          </div>
        </div>

        <div className="settings-action-footer">
          <button className="btn-save-changes" onClick={handleSave}>SAVE CHANGES</button>
          <button className="btn-discard-settings" onClick={handleDiscard}>DISCARD</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;