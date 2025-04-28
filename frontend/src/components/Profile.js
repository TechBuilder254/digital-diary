import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    // Retrieve the user data from localStorage (assuming you stored the user details during login)
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser) {
      setUserInfo({
        username: storedUser.username,
        email: storedUser.email
      });
    }
  }, []);

  return (
    <div className="profile-content">
      <header className="profile-header">
        <h2>Profile</h2>
      </header>
      <section className="profile-details">
        <h3>User Information</h3>
        <p><strong>Username:</strong> {userInfo.username}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
      </section>
      <section className="profile-actions">
        <button>Edit Profile</button>
      </section>
    </div>
  );
};

export default Profile;
