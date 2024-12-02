import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MyProfile.css';

function MyProfile() {
  const [profileData, setProfileData] = useState({
    email: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('https://backendtest3-b4ff149de3c9.herokuapp.com/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProfileData({
          email: data.email,
          location: data.location,
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = () => {
    // Logic for logging out
    console.log('User logged out');
    // Redirect to the login page or any other desired action
    navigate('/login');
  };

  const handleChangePassword = () => {
    // Logic for changing password
    console.log('Redirecting to change password page');
    // Redirect to the change password page
    navigate('/change-password');
  };

  return (
    <div className="my-profile-page">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <ul>
          <li className={location.pathname === '/my-artist' ? 'active' : ''}>
            <a href="/my-artist">My Artist</a>
          </li>
          <li className={location.pathname === '/event-list' ? 'active' : ''}>
            <a href="/event-list">My Event List</a>
          </li>
          <li className={location.pathname === '/my-profile' ? 'active' : ''}>
            <a href="/my-profile">My Profile</a>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="profile-container">
        <h1>My Profile</h1>
        {loading ? (
          <p>Loading profile...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="profile-card">
            <div className="profile-info">
              <p><strong>Email:</strong> {profileData.email}</p>
              <p><strong>Location:</strong> {profileData.location}</p>
            </div>
          </div>
        )}

        {/* Profile Actions */}
        <div className="profile-actions">
          <button onClick={handleChangePassword} className="action-button">Change Password</button>
          <button onClick={handleLogout} className="action-button logout-button">Log Out</button>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
