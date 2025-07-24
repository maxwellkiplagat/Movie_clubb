import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile, updateUserProfile, clearError } from '../auth/authSlice'; 
import { fetchMyClubs } from '../clubs/clubSlice'; 
import PostCard from '../../components/PostCard'; 

// Simple Modal Component for Edit Profile
const EditProfileModal = ({ user, onClose, onSave, isLoading, error }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '', // Allow password change
  });

  // Effect to reset form data when user prop changes
  useEffect(() => {
    console.log("EditProfileModal useEffect: User prop changed, resetting form data.");
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      password: '', // Always clear password field on user change/modal open
    });
  }, [user?.id, user?.username, user?.email]); // ADDED user?.username, user?.email to dependencies

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      username: formData.username,
      email: formData.email,
    };
    if (formData.password) {
      dataToSave.password = formData.password;
    }
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-orange-400 mb-4">Edit Profile</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 text-sm font-bold mb-2">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">New Password (optional):</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error: authError } = useSelector((state) => state.auth); 
  const { myClubs, isMyClubsLoading, error: clubsError } = useSelector((state) => state.clubs); 
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasFetchedDashboardClubs, setHasFetchedDashboardClubs] = useState(false); // NEW STATE for Dashboard clubs

  // Debugging logs for Dashboard render
  useEffect(() => {
    console.log("Dashboard Render - user state:", user);
    console.log("Dashboard Render - isAuthenticated:", isAuthenticated);
    console.log("Dashboard Render - auth isLoading:", isLoading);
    console.log("Dashboard Render - auth error:", authError);
    console.log("Dashboard Render - myClubs count:", myClubs ? myClubs.length : 0);
    console.log("Dashboard Render - isMyClubsLoading:", isMyClubsLoading); 
    console.log("Dashboard Render - hasFetchedDashboardClubs:", hasFetchedDashboardClubs); // NEW LOG
  }, [user, isAuthenticated, isLoading, authError, myClubs, isMyClubsLoading, hasFetchedDashboardClubs]); // Added hasFetchedDashboardClubs to dependencies

  // Main effect for fetching user profile and clubs
  useEffect(() => {
    console.log("Dashboard useEffect (fetch): Checking conditions for fetching data.");
    console.log("  isAuthenticated:", isAuthenticated);
    console.log("  user?.id:", user?.id);
    console.log("  user?.username:", user?.username);
    console.log("  user?.email:", user?.email);
    console.log("  isMyClubsLoading:", isMyClubsLoading);
    console.log("  myClubs?.length:", myClubs?.length);
    console.log("  hasFetchedDashboardClubs:", hasFetchedDashboardClubs); // NEW LOG

    // Only proceed if authenticated and user ID is available
    if (isAuthenticated && user?.id) { 
        // Fetch user profile only if it's not already fully populated
        // Check for essential profile data (username or email)
        if (!user.username || !user.email) {
            console.log("Dashboard useEffect: User authenticated but profile incomplete, dispatching fetchUserProfile.");
            dispatch(fetchUserProfile(user.id));
        }

        // Fetch myClubs only if not loading, myClubs is empty, AND we haven't already attempted to fetch them for the dashboard
        if (!isMyClubsLoading && (!myClubs || myClubs?.length === 0) && !hasFetchedDashboardClubs) { // MODIFIED CONDITION
            console.log("Dashboard useEffect: User authenticated and myClubs not populated, dispatching fetchMyClubs.");
            dispatch(fetchMyClubs());
            setHasFetchedDashboardClubs(true); // Set flag after dispatch
        } else {
            console.log(`Dashboard useEffect: Not dispatching fetchMyClubs. isMyClubsLoading: ${isMyClubsLoading}, myClubs.length: ${myClubs?.length}, hasFetchedDashboardClubs: ${hasFetchedDashboardClubs}`);
        }
    } else if (!isAuthenticated) {
        console.log("Dashboard useEffect: Not authenticated. User profile and clubs will not be fetched.");
        // Reset flag if user logs out
        if (hasFetchedDashboardClubs) {
            console.log("Dashboard useEffect: Not authenticated, resetting hasFetchedDashboardClubs flag.");
            setHasFetchedDashboardClubs(false);
        }
    }
  // All dependencies for the conditions above must be included here
  }, [isAuthenticated, user?.id, dispatch, isMyClubsLoading, myClubs?.length, user?.username, user?.email, hasFetchedDashboardClubs]); // ADDED hasFetchedDashboardClubs


  // Handle profile save
  const handleSaveProfile = async (updatedData) => {
    if (!user || !user.id) {
      console.error("User ID missing for profile update.");
      return;
    }
    console.log("handleSaveProfile: Data being sent to updateUserProfile:", updatedData); 
    try {
      const resultAction = await dispatch(updateUserProfile({ userId: user.id, userData: updatedData })).unwrap();
      console.log("Profile update successful:", resultAction); 
      setShowEditModal(false); 
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  // Clear error when modal is closed
  const handleCloseModal = () => {
    setShowEditModal(false);
    dispatch(clearError()); 
  };

  // --- Mock Data (To be replaced with Redux/Backend data later) ---
  const mockPosts = [
    { id: 1, movieTitle: 'Inception', content: 'Mind-blowing plot!', clubName: 'Sci-Fi Nerds', date: '2025-07-15', likes: 5, comments: [] },
    { id: 2, movieTitle: 'Titanic', content: 'So emotional.', clubName: 'Rom-Com Lovers', date: '2025-07-14', likes: 3, comments: [] },
  ];

  const mockFollowing = [
    { id: 1, username: 'filmfan' },
    { id: 2, username: 'cinebuff' },
  ];

  const mockFollowers = [
    { id: 3, username: 'user123' },
    { id: 4, username: 'tvlover' },
  ];

  const [following, setFollowing] = useState(mockFollowing);
  const [followers] = useState(mockFollowers); 

  const handleUnfollow = (userId) => {
    setFollowing(prev => prev.filter(u => u.id !== userId));
  };
  

// Conditional rendering based on authentication and loading state
  // Combined loading checks for a cleaner initial render state
  if (!user?.id || isLoading || isMyClubsLoading || !isAuthenticated) { 
    return (
      <div className="dashboard-loading p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <p className="text-blue-400 text-xl">Loading user profile and clubs...</p>
      </div>
    );
  }
  
  // Show error state if any
  if (authError || clubsError) { 
    return (
      <div className="dashboard-error p-6 bg-gray-900 min-h-screen text-red-500 text-center">
        <p>Error loading dashboard: {authError || clubsError}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
          Retry
        </button>
      </div>
    );
  }


  return (
    <div className="dashboard-container p-6 bg-gray-900 min-h-screen text-white">
      <div className="feed-welcome-box bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h1 className="text-3xl font-bold mb-3 text-orange-400">Welcome, {user?.username || 'User'}!</h1>
        <p className="text-gray-300">Manage your clubs, posts, and more below.</p>
        
        <div className="user-info-box mt-6 p-4 bg-gray-700 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-white">Profile Info</h2>
          <p className="text-gray-300"><strong>Username:</strong> {user?.username || 'N/A'}</p>
          <p className="text-gray-300"><strong>Email:</strong> {user?.email || 'N/A'}</p>
          {user?.bio && <p className="text-gray-300"><strong>Bio:</strong> {user.bio}</p>}
          <button 
            onClick={() => setShowEditModal(true)} 
            className="
              bg-blue-600 hover:bg-blue-700
              text-white font-bold
              py-2 px-4 rounded-full
              shadow-md transition duration-300 ease-in-out
              transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
              mt-4 inline-block
            "
          >
            Edit Profile
          </button>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal 
          user={user} 
          onClose={handleCloseModal} 
          onSave={handleSaveProfile}
          isLoading={isLoading}
          error={authError} 
        />
      )}

      <div className="section bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="section-title text-xl font-semibold mb-4 text-orange-400">My Posts</h2>
        {mockPosts.length === 0 ? (
          <p className="text-gray-400">You haven’t created any posts yet.</p>
        ) : (
          <div className="feed-list">
            {mockPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* My Clubs Section - Now using Redux myClubs */}
      <div className="section bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="section-title text-xl font-semibold mb-4 text-orange-400">My Clubs</h2>
        {myClubs && myClubs.length === 0 ? ( 
          <p className="text-gray-400">You haven't joined any clubs yet.</p>
        ) : (
          <div className="club-grid mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClubs && myClubs.map(club => ( 
              <div key={club.id} className="club-card bg-gray-700 rounded-lg p-4 shadow-md border-2 border-green-500">
                <h3 className="club-title text-xl font-bold text-blue-400 mb-2">{club.name}</h3>
                <p className="club-desc text-gray-300 text-sm mb-4">{club.description}</p>
                <Link to={`/clubs/${club.id}`} className="
                  bg-blue-600 hover:bg-blue-700
                  text-white font-bold
                  py-2 px-4 rounded-full
                  shadow-md transition duration-300 ease-in-out
                  transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
                  mt-3 inline-block
                ">Go to Club</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      
      
      <div className="section bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="section-title text-xl font-semibold mb-4 text-orange-400">People I’m Following</h2>
        {following.length === 0 ? (
          <p className="text-gray-400">You're not following anyone yet.</p>
        ) : (
          <ul className="feed-list">
            {following.map(user => (
              <li key={user.id} className="post-card bg-gray-700 rounded-lg p-4 shadow-md flex justify-between items-center mb-4">
                <p className="text-white text-lg">@{user.username}</p>
                <button 
                  className="
                    bg-red-600 hover:bg-red-700
                    text-white font-bold
                    py-2 px-4 rounded-full
                    shadow-md transition duration-300 ease-in-out
                    transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75
                  " 
                  onClick={() => handleUnfollow(user.id)}
                >
                  Unfollow
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      
      
      <div className="section bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="section-title text-xl font-semibold mb-4 text-orange-400">My Followers</h2>
        {followers.length === 0 ? (
          <p className="text-gray-400">You don't have any followers yet.</p>
        ) : (
          <ul className="feed-list">
            {followers.map(user => (
              <li key={user.id} className="post-card bg-gray-700 rounded-lg p-4 shadow-md mb-4">
                <p className="text-white text-lg">@{user.username}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
