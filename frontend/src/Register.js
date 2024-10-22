import React, { useState } from 'react';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    agreement: false,
  });

  const handleGetCode = () => {
    // Logic to generate or send verification code goes here
    alert('Verification code sent to ' + formData.email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registering:', formData);
    // After form submission, redirect to the Password Setup page
    window.location.href = '/password-setup';
  };

  return (
    <div className="register-container">
      <h1>Register for iMusic</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Verification Code</label>
          <div className="verification-group">
            <input
              type="text"
              placeholder="Enter verification code"
              required
              value={formData.verificationCode}
              onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
            />
            <button type="button" className="get-code-button" onClick={handleGetCode}>
              Get Code
            </button>
          </div>
        </div>

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="agreement"
              checked={formData.agreement}
              onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
              required
            />
            I have read and agree with the <a href="#user-agreement">User Agreement</a>
          </label>
        </div>

        <button type="submit" className="next-button">Next Step</button>
      </form>
    </div>
  );
}

export default Register;