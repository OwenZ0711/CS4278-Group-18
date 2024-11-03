import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './Intro.css';
import Login from './Login';
import Register from './Register';
import PasswordSetup from './PasswordSetup'; 
import SpotifyAccount from './SpotifyAccount'; 
import LocationSelection from './LocationSelection';


function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>iMusic</h1>
      <div className="button-container">
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/register")}>Register</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Intro Page */}
      <Route path="/" element={<IntroPage />} />
      
      {/* Login Page */}
      <Route path="/login" element={<Login />} />
      
      {/* Register Page */}
      <Route path="/register" element={<Register />} />
      
      {/* Password Setup Page */}
      <Route path="/password-setup" element={<PasswordSetup />} />

      {/* Spotify Account Linking page */}
      <Route path="/spotify-account" element={<SpotifyAccount />} />

      {/* Location Selection page */}
      <Route path="/location-selection" element={<LocationSelection />} />
    </Routes>
  );
}

export default App;