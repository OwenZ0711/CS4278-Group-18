import React, { useState } from 'react';
import './Register.css';  // Make sure to link the correct CSS file
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    agreement: false,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleGetCode = () => {
    // Logic to generate or send verification code goes here
    alert('Verification code sent to ' + formData.email);
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

    navigate('/password-setup');
  };

  // const handleGetCode = () => {
  //   // Logic to get the verification code
  //   alert("Verification code sent!");
  // };

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