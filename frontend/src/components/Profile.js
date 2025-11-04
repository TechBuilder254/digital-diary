import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaCalendarAlt, FaLock, FaEye, FaEyeSlash, FaStickyNote, FaClipboardList, FaHeart, FaCheckCircle } from 'react-icons/fa';
import '../styles/design-system.css';
import './Profile.css';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    id: '',
    username: '',
    email: '',
    avatar: '',
    bio: '',
    join_date: '',
    last_updated: ''
  });

  const [userStats, setUserStats] = useState({
    totalNotes: 0,
    totalTodos: 0,
    completedTodos: 0,
    favoriteNotes: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.id) {
        const response = await fetch(`/api/users/profile/${storedUser.id}`);
        if (response.ok) {
          const userData = await response.json();
          setUserInfo(userData);
          setEditForm({
            username: userData.username,
            email: userData.email,
            bio: userData.bio || ''
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.id) {
        const response = await fetch(`/api/users/profile/${storedUser.id}/stats`);
        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`/api/users/profile/${storedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserInfo(updatedUser);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update profile');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      username: userInfo.username,
      email: userInfo.email,
      bio: userInfo.bio || ''
    });
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`/api/users/profile/${storedUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setMessage('Password changed successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to change password');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage('Failed to change password');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Background Effects */}
      <div className="profile-bg-effects"></div>
      
      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          <h1 className="profile-title">
            <FaUser className="title-icon" />
            My Profile
          </h1>
          <p className="profile-subtitle">Manage your account and view your activity</p>
        </div>
        {!isEditing && (
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            <FaEdit />
            Edit Profile
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`profile-message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Profile Content */}
    <div className="profile-content">
        {/* Profile Info Card */}
        <div className="profile-info-card">
          <div className="avatar-section">
            <div className="avatar">
              {userInfo.avatar ? (
                <img src={userInfo.avatar} alt="Profile" />
              ) : (
                <FaUser className="avatar-icon" />
              )}
            </div>
            <h2 className="username">{userInfo.username}</h2>
            <p className="email">{userInfo.email}</p>
          </div>

          <div className="profile-details">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>
                    <FaUser className="label-icon" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="profile-input"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FaEnvelope className="label-icon" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="profile-input"
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="profile-textarea"
                    placeholder="Tell us about yourself..."
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={handleSaveProfile}>
                    <FaSave />
                    Save Changes
                  </button>
                  <button className="cancel-btn" onClick={handleCancelEdit}>
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                {userInfo.bio && (
                  <div className="bio-section">
                    <h3>About Me</h3>
                    <p className="bio-text">{userInfo.bio}</p>
                  </div>
                )}
                <div className="join-info">
                  <div className="join-item">
                    <FaCalendarAlt className="join-icon" />
                    <span>Joined {new Date(userInfo.join_date).toLocaleDateString()}</span>
                  </div>
                  {userInfo.last_updated && (
                    <div className="join-item">
                      <FaEdit className="join-icon" />
                      <span>Last updated {new Date(userInfo.last_updated).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon notes-icon">
              <FaStickyNote />
            </div>
            <div className="stat-content">
              <h3>{userStats.totalNotes}</h3>
              <p>Total Notes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon todos-icon">
              <FaClipboardList />
            </div>
            <div className="stat-content">
              <h3>{userStats.totalTodos}</h3>
              <p>Total Tasks</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <h3>{userStats.completedTodos}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon favorites-icon">
              <FaHeart />
            </div>
            <div className="stat-content">
              <h3>{userStats.favoriteNotes}</h3>
              <p>Favorites</p>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="actions-card">
          <h3>Account Actions</h3>
          <div className="action-buttons">
            <button 
              className="action-btn change-password-btn"
              onClick={() => setShowPasswordModal(true)}
            >
              <FaLock />
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Change Password</h2>
            <div className="form-group">
              <label>
                <FaLock className="label-icon" />
                Current Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="profile-input"
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="profile-input"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="profile-input"
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleChangePassword}>
                <FaSave />
                Change Password
              </button>
              <button 
                className="cancel-btn" 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
