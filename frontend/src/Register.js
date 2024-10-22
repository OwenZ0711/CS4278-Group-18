import React, { useState } from 'react';
import './Register.css';  // Make sure to link the correct CSS file
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    agreement: false,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send registration data to backend
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 1,
          email: formData.email,
          // code: formData.code
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setCurrentStep(2);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert('There was an error connecting to the server.');
    }

    navigate('/login'); //need to be modified
  };

  // const handleGetCode = () => {
  //   // Logic to get the verification code
  //   alert("Verification code sent!");
  // };

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