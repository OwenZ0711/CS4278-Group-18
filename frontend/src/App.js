import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './Intro.css'; // Same CSS file
import Login from './Login';
import Register from './Register';
import PasswordSetup from './PasswordSetup';  // Your Password Setup page
import SpotifyAccount from './SpotifyAccount'; 
import LocationSelection from './LocationSelection';


function App() {
  return (
    <Router>
      <Routes>
        {/* Intro Page */}
        <Route path="/" element={
          <div className="container">
            <h1>iMusic</h1>
            <div className="button-container">
              <button onClick={() => window.location.href = "/login"}>Login</button>
              <button onClick={() => window.location.href = "/register"}>Register</button>
            </div>
          </div>
        } />
        
        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        
        {/* Register Page */}
        <Route path="/register" element={<Register />} />
        
        {/* Password Setup Page */}
        <Route path="/password-setup" element={<PasswordSetup />} />

        {/*Spotify Account Linking page */}
        <Route path="/spotify-account" element={<SpotifyAccount />} />

        {/* Location Selection page */}
        <Route path="/location-selection" element={<LocationSelection />} />


      </Routes>
    </Router>
  );
}

export default App;