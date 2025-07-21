// src/App.js
import React from 'react';
import Navbar from './components/Navbar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/pages/Login';
import Register from './features/pages/Register';
import Feed from './features/pages/Feed';
import ClubPage from './features/pages/ClubPage';
import MovieTracker from './features/pages/MovieTracker';
import Watchlist from './features/pages/Watchlist';
import Dashboard from './features/pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ClubDetails from './features/pages/ClubDetails';
import CreatePostInClub from './features/pages/CreatePostInClub';
import EditProfile from './features/pages/EditProfile'; // ✅ import the new component

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

        {/* ✅ New Club Routes */}
        <Route
          path="/clubs/:id"
          element={
            <PrivateRoute>
              <ClubDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/clubs/:id/create-post"
          element={
            <PrivateRoute>
              <CreatePostInClub />
            </PrivateRoute>
          }
        />

        {/* ✅ Protected Routes */}
        <Route
          path="/tracker"
          element={
            <PrivateRoute>
              <MovieTracker />
            </PrivateRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <PrivateRoute>
              <Watchlist />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
