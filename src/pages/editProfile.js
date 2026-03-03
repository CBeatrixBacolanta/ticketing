import React, { useState, useRef, useEffect } from 'react';
import '../styles/EditProfile.css';
import { FaEye, FaEyeSlash, FaCloudUploadAlt } from 'react-icons/fa';

const EditProfile = ({ user, onSave }) => {
  const [formData, setFormData] = useState({
    ...user,
    currentPassword: 'password123',
    newPassword: '',
    retypePassword: ''
  });

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRetype, setShowRetype] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification({ ...notification, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Special handling for Middle Initial to keep it one uppercase letter
    const val = name === "middleInitial" ? value.charAt(0).toUpperCase() : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = () => {
    // 1. Strict Validation: Check if First Name, Last Name, or Email are blank
    const isFirstNameEmpty = !formData.firstName || formData.firstName.trim() === "";
    const isLastNameEmpty = !formData.lastName || formData.lastName.trim() === "";
    const isEmailEmpty = !formData.email || formData.email.trim() === "";

    if (isFirstNameEmpty || isLastNameEmpty || isEmailEmpty) {
      setNotification({ 
        show: true, 
        message: "Action Denied: First Name, Last Name, and Email cannot be blank.", 
        type: "error" 
      });
      // Scroll to top so user sees the notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Password Match Validation
    if (formData.newPassword && formData.newPassword !== formData.retypePassword) {
      setNotification({ show: true, message: "The new passwords do not match.", type: "error" });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Process Update
    let updatedData = { ...formData };

    // If a new password was entered, update the "current" one
    if (formData.newPassword) {
      updatedData.currentPassword = formData.newPassword;
      updatedData.newPassword = '';
      updatedData.retypePassword = '';
      setFormData(updatedData);
    }

    onSave(updatedData);
    setNotification({ show: true, message: "Profile updated successfully!", type: "success" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="profile-wrapper">
      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
          <span className="icon">{notification.type === 'success' ? '✓' : '✕'}</span>
          {notification.message}
        </div>
      )}

      <div className="profile-header">
        <h1>Profile</h1>
        <p>Update your profile</p>
      </div>

      {/* PHOTO SECTION */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Profile Picture</h2>
          <p>This image will be displayed on your sidebar.</p>
        </div>
        <div className="inner-card photo-flex">
          <div className="avatar-large">
             {formData.profilePic ? (
               <img src={formData.profilePic} alt="Profile" />
            ) : (
              <div className="guest-avatar-edit">
                <svg viewBox="0 0 24 24" fill="#718096"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
          <div className="upload-box" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
            <FaCloudUploadAlt className="upload-icon-svg" />
            <p><strong>Click to upload</strong> or drag and drop</p>
          </div>
          <div className="card-actions">
            <button type="button" className="btn-link save" onClick={handleSaveClick}>Save</button>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Personal Information</h2>
          <p>Update your personal details here.</p>
        </div>
        <div className="inner-card">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Required" />
            </div>
            <div className="form-group" style={{ flex: '0 0 80px' }}>
              <label htmlFor="middleInitial">M.I.</label>
              <input type="text" id="middleInitial" name="middleInitial" value={formData.middleInitial} onChange={handleChange} maxLength="1" style={{ textAlign: 'center' }} />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Required" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="userEmail">Email *</label>
            <input type="email" id="userEmail" name="email" value={formData.email} onChange={handleChange} placeholder="Required" />
          </div>
          <div className="card-actions">
            <button type="button" className="btn-link save" onClick={handleSaveClick}>Save</button>
          </div>
        </div>
      </div>

      {/* PASSWORD SECTION */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Password</h2>
          <p>Update your security settings</p>
        </div>
        <div className="inner-card">
          <div className="form-group">
            <label htmlFor="currentPass">Current Password</label>
            <div className="input-with-icon">
              <input type={showCurrent ? "text" : "password"} id="currentPass" name="currentPassword" value={formData.currentPassword} onChange={handleChange} />
              <span className="icon-trigger" onClick={() => setShowCurrent(!showCurrent)}>{showCurrent ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="newPass">New Password</label>
            <div className="input-with-icon">
              <input type={showNew ? "text" : "password"} id="newPass" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Enter new password" />
              <span className="icon-trigger" onClick={() => setShowNew(!showNew)}>{showNew ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="retypePass">Re-type New Password</label>
            <div className="input-with-icon">
              <input type={showRetype ? "text" : "password"} id="retypePass" name="retypePassword" value={formData.retypePassword} onChange={handleChange} placeholder="Confirm new password" />
              <span className="icon-trigger" onClick={() => setShowRetype(!showRetype)}>{showRetype ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
          </div>
          <div className="card-actions">
            <button type="button" className="btn-link save" onClick={handleSaveClick}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;