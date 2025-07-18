import React from 'react';
import Navbar from './components/Navbar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/pages/Login';
import Register from './features/pages/Register';
import Feed from './features/pages/Feed';
import ClubPage from './features/pages/ClubPage';
import MovieTracker from './features/pages/MovieTracker';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/feed" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/club" element={<ClubPage />} />
        <Route path="/tracker" element={<MovieTracker />} />
      </Routes>
    </>
  );
}

export default App;
