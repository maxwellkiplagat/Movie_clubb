import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <nav className="flex items-center justify-between p-4 bg-gray-800">
        <div className="flex items-center">
          <svg className="w-8 h-8 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <h1 className="text-2xl font-bold text-red-500">CineClub</h1>
        </div>
        <div className="flex space-x-4">
          <Link to="/feed" className="hover:text-red-500">Feed</Link>
          <Link to="/tracker" className="hover:text-red-500">My Tracker</Link>
          <Link to="/club" className="hover:text-red-500">Watchlist</Link>
          <Link to="/login" className="hover:text-red-500">Login</Link>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Join Now</button>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center h-screen bg-indigo-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-5xl font-bold text-red-500 mb-4">Welcome to CineClub</h2>
        <p className="text-center text-lg mb-6">Connect with fellow movie and TV series enthusiasts</p>
        <div className="flex space-x-4">
          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded">Join the Community</button>
          <button className="bg-transparent border-2 border-red-500 hover:bg-red-500 text-red-500 hover:text-white px-6 py-2 rounded">Sign In</button>
        </div>
      </div>

      <div className="flex mt-6 p-4 bg-gray-800">
        <div className="w-1/2 p-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-2">M</div>
              <div>
                <p className="text-sm">@moviebuff23</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <p className="text-sm">Just watched Dune Part Two and it was absolutely incredible! The...</p>
          </div>
        </div>
        <div className="w-1/2 p-4">
          <h3 className="text-lg font-bold mb-2">Popular Clubs</h3>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm">Sci-Fi Enthusiasts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;