import React, { useState } from 'react';
import './Register.css';  // Make sure to link the correct CSS file

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    agreement: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic for form submission or code verification
    console.log(formData);
  };

  const handleGetCode = () => {
    // Logic to get the verification code
    alert("Verification code sent!");
  };

  return (
    <div className="register-container">
      <h1>iMusic</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="code">Verification Code</label>
          <div className="verification-group">
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
            <button type="button" className="get-code-button" onClick={handleGetCode}>Get Code</button>
          </div>
        </div>

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="agreement"
              checked={formData.agreement}
              onChange={handleChange}
              required
            />
            I have read and agreed with the <a href="#user-agreement">user agreement</a>
          </label>
        </div>

        <button type="submit" className="next-button">Next Step</button>
      </form>
    </div>
  );
}

export default Register;