import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './features/pages/Login';
import Register from './features/pages/Register';
import './App.css';

function App() {
  return (
    <div>
      <h2>Welcome to CineClub</h2>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
// This is a simple React application that sets up routing for a login and registration page.