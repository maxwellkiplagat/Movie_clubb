import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUserProfile,
  updateUserProfile,
  clearError,
  fetchFollowing,
  unfollowUser,
  fetchFollowers,
  fetchUserPosts
} from '../auth/authSlice';
import { fetchMyClubs, leaveClub } from '../clubs/clubSlice';
import PostCard from '../../components/PostCard';
import ClubCard from '../../components/ClubCard';

// Simple Modal Component for Edit Profile
const EditProfileModal = ({ user, onClose, onSave, isLoading, error }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
  });

  useEffect(() => {
    console.log("EditProfileModal useEffect: User prop changed, resetting form data.");
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      password: '',
    });
  }, [user?.id, user?.username, user?.email]);

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
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    following,
    isFollowingLoading,
    followingError,
    followers,
    isFollowersLoading,
    followersError,
    userPosts,
    isUserPostsLoading,
    hasFetchedUserPosts,
  } = useSelector((state) => state.auth);
  const { myClubs, isMyClubsLoading, error: clubsError } = useSelector((state) => state.clubs);

  const [showEditModal, setShowEditModal] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Combined logging useEffect - keep this for debugging
  useEffect(() => {
    console.log("Dashboard Render - user state:", user);
    console.log("Dashboard Render - isAuthenticated:", isAuthenticated);
    console.log("Dashboard Render - auth isLoading (global):", authLoading);
    console.log("Dashboard Render - auth error:", authError);
    console.log("Dashboard Render - myClubs count:", myClubs ? myClubs.length : 0);
    console.log("Dashboard Render - isMyClubsLoading:", isMyClubsLoading);
    console.log("Dashboard Render - following count:", following ? following.length : 0);
    console.log("Dashboard Render - isFollowingLoading:", isFollowingLoading);
    console.log("Dashboard Render - followingError:", followingError);
    console.log("Dashboard Render - followers count:", followers ? followers.length : 0);
    console.log("Dashboard Render - isFollowersLoading:", isFollowersLoading);
    console.log("Dashboard Render - followersError:", followersError);
    console.log("Dashboard Render - userPosts count:", userPosts ? userPosts.length : 0);
    console.log("Dashboard Render - isUserPostsLoading (dedicated):", isUserPostsLoading);
    console.log("Dashboard Render - hasFetchedUserPosts:", hasFetchedUserPosts);
    console.log("Dashboard Render - hasLoadedInitialData:", hasLoadedInitialData);
  }, [user, isAuthenticated, authLoading, authError, myClubs, isMyClubsLoading, following, isFollowingLoading, followingError, followers, isFollowersLoading, followersError, userPosts, isUserPostsLoading, hasFetchedUserPosts, hasLoadedInitialData]);

  // Main effect for fetching user profile, clubs, and following/followers
  useEffect(() => {
    console.log("Dashboard useEffect (fetch): Checking conditions for fetching data.");
    console.log("   isAuthenticated:", isAuthenticated);
    console.log("   user?.id:", user?.id);
    console.log("   hasLoadedInitialData:", hasLoadedInitialData);

    if (isAuthenticated && user?.id && !hasLoadedInitialData) {
        let shouldFetchUserProfile = !user.username || !user.email;
        let shouldFetchMyClubs = !isMyClubsLoading && (!myClubs || myClubs.length === 0);
        let shouldFetchFollowing = !isFollowingLoading && (!following || following.length === 0);
        let shouldFetchFollowers = !isFollowersLoading && (!followers || followers.length === 0);
        let shouldFetchUserPosts = !isUserPostsLoading && !hasFetchedUserPosts;

        console.log(`   Should fetch user profile: ${shouldFetchUserProfile}`);
        console.log(`   Should fetch my clubs: ${shouldFetchMyClubs}`);
        console.log(`   Should fetch following: ${shouldFetchFollowing}`);
        console.log(`   Should fetch followers: ${shouldFetchFollowers}`);
        console.log(`   Should fetch user posts: ${shouldFetchUserPosts}`);

        if (shouldFetchUserProfile) {
            console.log("Dashboard useEffect: Dispatching fetchUserProfile.");
            dispatch(fetchUserProfile(user.id));
        }
        if (shouldFetchMyClubs) {
            console.log("Dashboard useEffect: Dispatching fetchMyClubs.");
            dispatch(fetchMyClubs());
        }
        if (shouldFetchFollowing) {
            console.log("Dashboard useEffect: Dispatching fetchFollowing.");
            dispatch(fetchFollowing(user.id));
        }
        if (shouldFetchFollowers) {
            console.log("Dashboard useEffect: Dispatching fetchFollowers.");
            dispatch(fetchFollowers(user.id));
        }
        if (shouldFetchUserPosts) {
            console.log("Dashboard useEffect: Dispatching fetchUserPosts.");
            dispatch(fetchUserPosts(user.id));
        }

        if (!shouldFetchUserProfile && !shouldFetchMyClubs && !shouldFetchFollowing && !shouldFetchFollowers && !shouldFetchUserPosts) {
            setHasLoadedInitialData(true);
            console.log("Dashboard useEffect: All initial fetches dispatched or already loaded. Setting hasLoadedInitialData to true.");
        }

    } else if (!isAuthenticated && hasLoadedInitialData) {
        console.log("Dashboard useEffect: Not authenticated and data was loaded. Resetting hasLoadedInitialData.");
        setHasLoadedInitialData(false);
    } else if (!isAuthenticated && !authLoading) {
        console.log("Dashboard useEffect: Not authenticated and not loading. Redirecting to login.");
        navigate('/login');
    } else if (isAuthenticated && user?.id && hasLoadedInitialData) {
        console.log("Dashboard useEffect: Authenticated, user ID present, and initial data already loaded. No re-fetch.");
    }

  }, [
    isAuthenticated,
    user?.id,
    user?.username,
    user?.email,
    dispatch,
    isMyClubsLoading,
    myClubs,
    isFollowingLoading,
    following,
    isFollowersLoading,
    followers,
    userPosts,
    isUserPostsLoading,
    hasFetchedUserPosts,
    hasLoadedInitialData,
    authLoading,
    navigate
  ]);

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

  const handleCloseModal = () => {
    setShowEditModal(false);
    dispatch(clearError());
  };

  const handleUnfollowFromDashboard = (userId) => {
    console.log(`Dashboard: Attempting to unfollow user with ID: ${userId}`);
    dispatch(unfollowUser(userId));
  };

  const handleLeaveClubFromDashboard = async (clubId) => {
    console.log(`Dashboard: Attempting to leave club with ID: ${clubId}`);
    try {
      await dispatch(leaveClub(clubId)).unwrap();
      console.log(`Successfully left club ${clubId}`);
    } catch (error) {
      console.error("Failed to leave club from dashboard:", error);
      alert(`Failed to leave club: ${error.message || 'An error occurred.'}`);
    }
  };

  // Sort userPosts by created_at in descending order (newest first)
  const sortedUserPosts = [...userPosts].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA; // Descending order
  });

  // Overall loading condition for the dashboard
  if (!user?.id && authLoading) {
    return (
      <div className="dashboard-loading p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <p className="text-blue-400 text-xl">Loading user profile...</p>
      </div>
    );
  }

  // Handle errors specifically
  if (authError || clubsError || followingError || followersError) {
    return (
      <div className="dashboard-error p-6 bg-gray-900 min-h-screen text-red-500 text-center">
        <p>Error loading dashboard: {authError || clubsError || followingError || followersError}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
          Retry
        </button>
      </div>
    );
  }

  // If not authenticated and not currently loading auth, redirect
  if (!isAuthenticated) {
    return null;
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
          isLoading={authLoading}
          error={authError}
        />
      )}

      <div className="section bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="section-title text-xl font-semibold mb-4 text-orange-400">My Posts</h2>
        {isUserPostsLoading && sortedUserPosts.length === 0 ? (
            <p className="text-blue-400 text-center">Loading your posts...</p>
        ) : sortedUserPosts.length === 0 ? (
          <p className="text-gray-400">You haven’t created any posts yet.</p>
        ) : (
          <div className="feed-list">
            {sortedUserPosts.map(post => ( // Use sortedUserPosts here
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <div className="section bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="section-title text-xl font-semibold mb-4 text-orange-400">My Clubs</h2>
        {isMyClubsLoading ? (
            <p className="text-blue-400 text-center">Loading your clubs...</p>
        ) : myClubs && myClubs.length === 0 ? (
          <p className="text-gray-400">You haven't joined any clubs yet.</p>
        ) : (
          <div className="club-grid mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClubs && myClubs.map(club => (
              <ClubCard
                key={club.id}
                club={club}
                isJoined={true}
                onLeave={() => handleLeaveClubFromDashboard(club.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="section bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="section-title text-xl font-semibold mb-4 text-orange-400">People I’m Following</h2>
        {isFollowingLoading ? (
            <p className="text-blue-400 text-center">Loading who you follow...</p>
        ) : followingError ? (
            <p className="text-red-500 text-center">Error loading following list: {followingError}</p>
        ) : following.length === 0 ? (
          <p className="text-gray-400">You're not following anyone yet.</p>
        ) : (
          <ul className="feed-list">
            {following.map(followedUser => (
              <li key={followedUser.id} className="post-card bg-gray-700 rounded-lg p-4 shadow-md flex justify-between items-center mb-4">
                <p className="text-white text-lg">@{followedUser.username}</p>
                <button
                  className="leave-btn"
                  onClick={() => handleUnfollowFromDashboard(followedUser.id)}
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
        {isFollowersLoading ? (
            <p className ="text-blue-400 text-center">Loading your followers...</p>
        ) : followersError ? (
            <p className="text-red-500 text-center">Error loading followers list: {followersError}</p>
        ) : followers.length === 0 ? (
          <p className="text-gray-400">You don't have any followers yet.</p>
        ) : (
          <ul className="feed-list">
            {followers.map(followerUser => (
              <li key={followerUser.id} className="post-card bg-gray-700 rounded-lg p-4 shadow-md mb-4">
                <p className="text-white text-lg">@{followerUser.username}</p>
                {/* You might add a "Follow Back" button here later */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
