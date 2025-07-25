import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector
import { checkSession } from './features/auth/authSlice'; // Import checkSession thunk

import NavBar from "./components/Navbar"; // Corrected to Navbar (lowercase 'b') based on common convention
import HomePage from "./features/pages/HomePage"; // Assuming you have a HomePage for '/'
import Login from "./features/pages/Login";
import Register from "./features/pages/Register";
import Feed from "./features/pages/Feed";
import ClubPage from "./features/pages/ClubPage"; // For listing all clubs
import ClubDetail from "./features/pages/ClubDetail"; // For individual club pages (ASSUMPTION: This file exists)
import MovieTracker from "./features/pages/MovieTracker";
import PrivateRoute from './components/PrivateRoute'; // Assuming this component exists for protected routes

function App() {
  const dispatch = useDispatch();
  // Select relevant auth state to optionally log or use for conditional rendering here
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth); 

  // Centralized checkSession on app load
  useEffect(() => {
    console.log("App.jsx: Dispatching checkSession on initial app load.");
    dispatch(checkSession());
  }, [dispatch]); // Dispatch only once on mount

  // Optional: Log auth state changes in App.jsx for debugging
  useEffect(() => {
    console.log("App.jsx Auth State Changed - isAuthenticated:", isAuthenticated);
    console.log("App.jsx Auth State Changed - isLoading:", isLoading);
    console.log("App.jsx Auth State Changed - user:", user);
  }, [isAuthenticated, isLoading, user]);

  return (
    <Router>
      <NavBar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} /> {/* Assuming HomePage is your landing */}
        <Route path="/feed" element={<Feed />} /> {/* Your existing feed route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Main Clubs Listing Page - This is the one that was missing! */}
        <Route path="/clubs" element={<ClubPage />} /> 
        
        {/* Protected Routes - If PrivateRoute component exists */}
        <Route element={<PrivateRoute />}>
          {/* Individual Club Detail Page - Assuming ClubDetail is a separate component */}
          <Route path="/clubs/:id" element={<ClubDetail />} /> 
          <Route path="/mytracker" element={<MovieTracker />} /> {/* Corrected path based on NavBar */}
          {/* Add other protected routes like Dashboard here if it's protected */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>

        {/* Fallback for unhandled routes */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
