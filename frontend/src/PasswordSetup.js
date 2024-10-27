import React, { useState } from 'react';
import './PasswordSetup.css';
import { useNavigate } from 'react-router-dom';

function PasswordSetup() {
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.password === passwordData.confirmPassword) {
      console.log('Password set successfully!');
      // Redirect to the Spotify Account linking page
      window.location.href = '/spotify-account';
    } else {
      alert('Passwords do not match');
    }
  };

  return (
    <div className="password-setup-container">
      <h1>iMusic</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            required
            value={passwordData.password}
            onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            required
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
        </div>

        <button type="submit" className="next-button">Next Step</button>
      </form>
    </div>
  );
}

export default PasswordSetup;