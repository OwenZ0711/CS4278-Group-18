import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './Intro.css'; // Same CSS file
import Login from './Login';
import Register from './Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="container">
            <h1>iMusic</h1>
            <div className="button-container">
              <button onClick={() => window.location.href = "/login"}>Login</button>
              <button onClick={() => window.location.href = "/register"}>Register</button>
            </div>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;