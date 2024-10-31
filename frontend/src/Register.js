import React, { useState } from 'react';
import './Register.css';  // Make sure to link the correct CSS file
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send registration data to backend
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        navigate('/password-setup', { state: { email } }); // Navigate to password setup page with email
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert('There was an error connecting to the server.');
    }
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className="next-button">Next Step</button>
      </form>
    </div>
  );
}

export default Register;