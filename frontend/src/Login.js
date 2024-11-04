import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation before sending to backend
    if (!loginData.email || !loginData.password) {
      setMessage('Email and password are required.');
      return;
    }

    // Call to backend login endpoint
    try {
      const response = await fetch('http://localhost:5000/login', {  // Backend URL
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),  // Send login data to backend
      });

      const result = await response.json();  // Parse backend response

      if (response.ok) {
        setMessage('Login successful. Redirecting to authorization...');
        
        // Redirect to auth_url on success
        setTimeout(() => {
          requestAuthorization(); // Call the function to redirect to Spotify authorization
        }, 1000);
      } else {
        // Display error message returned by backend
        setMessage(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage('There was an error connecting to the server.');
    }
  };

  // Function to generate Spotify authorization URL and redirect
  function requestAuthorization() {
    const CLIENT_ID = '5de8da9998ff4436abab42f799e1476c';  // Replace with your Spotify client ID
    const CLIENT_SECERT = 'ed07ca9837c240fea4b153a56566f3b0';  // Replace with your Spotify client secret
    const REDIRECT_URI = 'http://localhost:5000/loading';  // Replace with your redirect URI
    const AUTH_URL = 'https://accounts.spotify.com/authorize';

    // Store credentials in localStorage (not secure, for demonstration only)
    localStorage.setItem("client_id", CLIENT_ID);
    localStorage.setItem("client_secret", CLIENT_SECERT);

    // Construct the authorization URL
    let url = AUTH_URL;
    url += `?client_id=${CLIENT_ID}`;
    url += `&response_type=code`;
    url += `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    url += `&show_dialog=true`;
    url += `&scope=user-read-private user-read-email playlist-read-private playlist-read-collaborative`;

    // Redirect to Spotify's authorization screen
    window.location.href = url;
  }

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div id="message" className={message.includes('successful') ? 'message-success' : 'message-error'}>
          {message}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
}

export default Login;