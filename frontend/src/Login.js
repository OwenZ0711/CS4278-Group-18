import React, { useState } from 'react';
import './Login.css';  // Use the correct CSS file

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    agreement: false,
    keepLoggedIn: false,
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
    // Perform login logic here
    console.log(formData);
  };

  return (
    <div className="login-container">
      <h1>iMusic</h1>
      <form className="login-form" onSubmit={handleSubmit}>
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
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

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="keepLoggedIn"
              checked={formData.keepLoggedIn}
              onChange={handleChange}
            />
            Keep me logged in
          </label>
        </div>

        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
}

export default Login;