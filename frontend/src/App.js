import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './Intro.css';
import Login from './Login';
import Register from './Register';
import PasswordSetup from './PasswordSetup'; 
import LocationSelection from './LocationSelection';
import MyArtist from './MyArtist';
import EventList from './EventList'; 
import MyProfile from './MyProfile';
import ChangePassword from './ChangePassword';
import ArtistDetails from './ArtistDetails';


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

      {/* Register Pages */}
      <Route path="/register" element={<Register />} />
      <Route path="/password-setup" element={<PasswordSetup />} />
      <Route path="/location-selection" element={<LocationSelection />} />

      {/* Main App Pages */}
      <Route path="/my-artist" element={<MyArtist />} />
      <Route path="/event-list" element={<EventList />} />
      <Route path="/my-profile" element={<MyProfile />} />

      {/* Change Password Page */}
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Certain Artist Detail Page*/}
      <Route path="/artist-details/:artistName" element={<ArtistDetails />} />
    </Routes>
  );
}

export default App;