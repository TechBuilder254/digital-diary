import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaCalendarAlt, FaLock, FaEye, FaEyeSlash, FaStickyNote, FaClipboardList, FaHeart, FaCheckCircle } from 'react-icons/fa';
import Modal from './Modal';

interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  join_date: string;
  last_updated?: string;
}

interface UserStats {
  totalNotes: number;
  totalTodos: number;
  completedTodos: number;
  favoriteNotes: number;
}

interface EditForm {
  username: string;
  email: string;
  bio: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: '',
    username: '',
    email: '',
    avatar: '',
    bio: '',
    join_date: '',
    last_updated: ''
  });

  const [userStats, setUserStats] = useState<UserStats>({
    totalNotes: 0,
    totalTodos: 0,
    completedTodos: 0,
    favoriteNotes: 0
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [editForm, setEditForm] = useState<EditForm>({
    username: '',
    email: '',
    bio: ''
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  const fetchUserProfile = async (): Promise<void> => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.id) {
          const response = await fetch(`/api/users/profile/${user.id}`);
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
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const fetchUserStats = async (): Promise<void> => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.id) {
          const response = await fetch(`/api/users/profile/${user.id}/stats`);
          if (response.ok) {
            const stats = await response.json();
            setUserStats(stats);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleEditProfile = (): void => {
    setIsEditing(true);
  };

  const handleSaveProfile = async (): Promise<void> => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      
      const user = JSON.parse(storedUser);
      const response = await fetch(`/api/users/profile/${user.id}`, {
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

  const handleCancelEdit = (): void => {
    setEditForm({
      username: userInfo.username,
      email: userInfo.email,
      bio: userInfo.bio || ''
    });
    setIsEditing(false);
  };

  const handleChangePassword = async (): Promise<void> => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      
      const user = JSON.parse(storedUser);
      const response = await fetch(`/api/users/profile/${user.id}/password`, {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FaUser />
              My Profile
            </h1>
            <p className="text-white/90 text-lg">Manage your account and view your activity</p>
          </div>
          {!isEditing && (
            <button 
              className="px-6 py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
              onClick={handleEditProfile}
            >
              <FaEdit />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-6 py-4 rounded-xl ${
          messageType === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {message}
        </div>
      )}

      {/* Profile Info Card */}
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="text-center md:text-left">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto md:mx-0 mb-4">
              {userInfo.avatar ? (
                <img src={userInfo.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <FaUser className="text-white text-5xl" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{userInfo.username}</h2>
            <p className="text-gray-600">{userInfo.email}</p>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaUser />
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaEnvelope />
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none resize-none"
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    onClick={handleSaveProfile}
                  >
                    <FaSave />
                    Save Changes
                  </button>
                  <button 
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    onClick={handleCancelEdit}
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {userInfo.bio && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">About Me</h3>
                    <p className="text-gray-700">{userInfo.bio}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    <span>Joined {new Date(userInfo.join_date).toLocaleDateString()}</span>
                  </div>
                  {userInfo.last_updated && (
                    <div className="flex items-center gap-2">
                      <FaEdit />
                      <span>Last updated {new Date(userInfo.last_updated).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaStickyNote className="text-purple-600 text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.totalNotes}</div>
              <div className="text-sm text-gray-600">Total Notes</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-blue-600 text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.totalTodos}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.completedTodos}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <FaHeart className="text-pink-600 text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.favoriteNotes}</div>
              <div className="text-sm text-gray-600">Favorites</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h3>
        <button 
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          onClick={() => setShowPasswordModal(true)}
        >
          <FaLock />
          Change Password
        </button>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Change Password"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaLock />
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none pr-12"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              onClick={handleChangePassword}
            >
              <FaSave />
              Change Password
            </button>
            <button 
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
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
      </Modal>
    </div>
  );
};

export default Profile;


