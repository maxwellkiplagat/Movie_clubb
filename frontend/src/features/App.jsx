import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import ClubPage from "./pages/ClubPage";
import MovieTracker from "./pages/MovieTracker";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/clubs/:id" element={<ClubPage />} />
        <Route path="/watchlist" element={<MovieTracker />} />
      </Routes>
    </Router>
  );
}

export default App;
