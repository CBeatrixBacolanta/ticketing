import React, { useState, useRef } from 'react';
import '../styles/editProfile.css';
import { FaEye, FaEyeSlash, FaCloudUploadAlt } from 'react-icons/fa';

const EditProfile = ({ user, onSave }) => {
  const [formData, setFormData] = useState({
    ...user,
    currentPassword: 'password123', // Default for demo
    newPassword: '',
    retypePassword: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRetype, setShowRetype] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setFormData({ ...formData, profilePic: tempUrl });
    }
  };

  const handleSaveClick = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      alert("Please fill in required fields.");
      return;
    }

    if (formData.newPassword !== formData.retypePassword) {
      alert("New passwords do not match!");
      return;
    }

    // Apply the swap logic
    let updatedData = { ...formData };
    if (formData.newPassword) {
      updatedData.currentPassword = formData.newPassword;
      updatedData.newPassword = '';
      updatedData.retypePassword = '';
      setFormData(updatedData);
    }

    onSave(updatedData);
    alert("Password updated! Your new password is now the 'Current Password'.");
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Update your profile</p>
      </div>

      {/* PHOTO SECTION */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Personal Information</h2>
          <p>This image will be displayed on your profile</p>
        </div>
        <div className="inner-card photo-flex">
          <div className="avatar-large">
            <img src={formData.profilePic || "https://placehold.co/110"} alt="Profile" />
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
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
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="userEmail">Email</label>
            <input type="email" id="userEmail" name="email" value={formData.email} onChange={handleChange} />
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
              <input
                type={showCurrent ? "text" : "password"}
                id="currentPass"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
              <span className="icon-trigger" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPass">New Password</label>
            <div className="input-with-icon">
              <input
                type={showNew ? "text" : "password"}
                id="newPass"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder={showNew ? "Enter new password" : ""}
              />
              <span className="icon-trigger" onClick={() => setShowNew(!showNew)}>
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="retypePass">Re-type New Password</label>
            <div className="input-with-icon">
              <input
                type={showRetype ? "text" : "password"}
                id="retypePass"
                name="retypePassword"
                value={formData.retypePassword}
                onChange={handleChange}
                placeholder={showRetype ? "Confirm new password" : ""}
              />
              <span className="icon-trigger" onClick={() => setShowRetype(!showRetype)}>
                {showRetype ? <FaEyeSlash /> : <FaEye />}
              </span>
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