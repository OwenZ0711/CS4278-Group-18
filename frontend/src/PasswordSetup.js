import React, { useState } from 'react';
import './PasswordSetup.css';
import { useLocation, useNavigate } from 'react-router-dom';

function PasswordSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  const email = location.state?.email;

  if (!email) {
    // If email is missing, redirect to register page
    navigate('/register');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.password !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/password-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: passwordData.password,
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert('Password set successfully!');
        navigate('/location-selection');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert('There was an error connecting to the server.');
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