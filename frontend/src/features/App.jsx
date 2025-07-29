import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'; 
import { checkSession } from './features/auth/authSlice'; 

import NavBar from "./components/Navbar"; 
import HomePage from "./features/pages/HomePage";
import Login from "./features/pages/Login";
import Register from "./features/pages/Register";
import Feed from "./features/pages/Feed";
import ClubPage from "./features/pages/ClubPage"; 
import ClubDetail from "./features/pages/ClubDetail"; 
import MovieTracker from "./features/pages/MovieTracker";
import PrivateRoute from './components/PrivateRoute'; 

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
        
        <Route path="/" element={<HomePage />} /> 
        <Route path="/feed" element={<Feed />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
    
        <Route path="/clubs" element={<ClubPage />} /> 
        
        
        <Route element={<PrivateRoute />}>
          
          <Route path="/clubs/:id" element={<ClubDetail />} /> 
          <Route path="/mytracker" element={<MovieTracker />} /> 
          
          
        </Route>

        
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
