import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUserProfile,
  updateUserProfile,
  clearError,
  fetchFollowing,
  unfollowUser,
  fetchFollowers,
  followUser,
  fetchUserPosts
} from '../../features/auth/authSlice';
import { fetchMyClubs, leaveClub } from '../../features/clubs/clubSlice';
import PostCard from '../../components/PostCard';
import ClubCard from '../../components/ClubCard';

// Simple Modal Component for Edit Profile - STYLED FOR RESPONSIVENESS (Bio input removed)
const EditProfileModal = ({ user, onClose, onSave, isLoading, error }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
  });

  useEffect(() => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      password: '',
    });
  }, [user]);

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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-[#1a2a44] p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-[#ff5733] mb-6 text-center">Edit Profile</h2>
        {error && <p className="text-red-500 mb-4 text-center text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 text-sm font-semibold mb-2">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c3e50] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ff5733]"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 text-sm font-semibold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c3e50] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ff5733]"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 text-sm font-semibold mb-2">New Password (optional):</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c3e50] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ff5733]"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="submit"
              className="
                w-full sm:w-auto px-6 py-3 rounded-full bg-blue-600 text-white font-bold
                hover:bg-blue-700 transition duration-300 ease-in-out
                transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
              "
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="
                w-full sm:w-auto px-6 py-3 rounded-full bg-gray-600 text-white font-bold
                hover:bg-gray-700 transition duration-300 ease-in-out
                transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75
              "
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

// Dashboard Component
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading, // Global auth loading
    error: authError,
    following,
    isFollowingLoading,
    followingError,
    followers,
    isFollowersLoading,
    followersError,
    userPosts,
    isUserPostsLoading,
    hasFetchedUserPosts, // Indicates if fetchUserPosts has completed at least once
    hasFetchedFollowing, // From authSlice
    hasFetchedFollowers, // From authSlice
  } = useSelector((state) => state.auth);

  const {
    myClubs,
    isMyClubsLoading,
    error: clubsError,
    hasFetchedMyClubs, // From clubSlice
  } = useSelector((state) => state.clubs);

  const [showEditModal, setShowEditModal] = useState(false);

  // Effect to handle redirection if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      console.log("Dashboard useEffect: Not authenticated and not loading. Redirecting to login.");
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Effect for fetching user-specific data
  useEffect(() => {
    console.log("--- Dashboard User Data Fetch Effect Triggered ---");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user?.id:", user?.id);
    console.log("authLoading (global):", authLoading);
    console.log("isFollowingLoading:", isFollowingLoading);
    console.log("isFollowersLoading:", isFollowersLoading);
    console.log("isUserPostsLoading:", isUserPostsLoading);
    console.log("isMyClubsLoading:", isMyClubsLoading);
    console.log("hasFetchedUserPosts (from slice):", hasFetchedUserPosts);
    console.log("hasFetchedFollowing (from slice):", hasFetchedFollowing);
    console.log("hasFetchedFollowers (from slice):", hasFetchedFollowers);
    console.log("hasFetchedMyClubs (from slice):", hasFetchedMyClubs);
    console.log("--------------------------------------------");

    if (isAuthenticated && user?.id) {
      const currentUserId = user.id;

      // Fetch User Profile (if user object is not fully populated or explicitly needed)
      if (!user.username || !user.email) {
        console.log("Dashboard useEffect: Dispatching fetchUserProfile (missing basic data).");
        dispatch(fetchUserProfile(currentUserId));
      }

      // Fetch My Clubs - only if not loading AND not yet fetched
      if (!isMyClubsLoading && !hasFetchedMyClubs) {
        console.log("Dashboard useEffect: Dispatching fetchMyClubs.");
        dispatch(fetchMyClubs());
      }
      
      // Fetch Following - only if not loading AND not yet fetched
      if (!isFollowingLoading && !hasFetchedFollowing) {
        console.log("Dashboard useEffect: Dispatching fetchFollowing.");
        dispatch(fetchFollowing(currentUserId));
      }
      
      // Fetch Followers - only if not loading AND not yet fetched
      if (!isFollowersLoading && !hasFetchedFollowers) {
        console.log("Dashboard useEffect: Dispatching fetchFollowers.");
        dispatch(fetchFollowers(currentUserId));
      }
      
      // Fetch User Posts - only if not loading AND not yet fetched
      if (!isUserPostsLoading && !hasFetchedUserPosts) {
        console.log(`Dashboard useEffect: Dispatching fetchUserPosts for user ${currentUserId}`);
        dispatch(fetchUserPosts(currentUserId));
      }
    }
  }, [
    isAuthenticated,
    user?.id,
    user?.username,
    user?.email,
    dispatch,
    myClubs, isMyClubsLoading, hasFetchedMyClubs,
    following, isFollowingLoading, hasFetchedFollowing,
    followers, isFollowersLoading, hasFetchedFollowers,
    userPosts, isUserPostsLoading, hasFetchedUserPosts,
    authLoading
  ]);


  const handleSaveProfile = async (updatedData) => {
    if (!user || !user.id) {
      console.error("User ID missing for profile update.");
      return;
    }
    console.log("handleSaveProfile: Data being sent to updateUserProfile:", updatedData);
    try {
      await dispatch(updateUserProfile({ userId: user.id, userData: updatedData })).unwrap();
      console.log("Profile update successful.");
      setShowEditModal(false);
      dispatch(fetchUserProfile(user.id)); // Re-fetch to ensure UI is updated
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    dispatch(clearError());
  };

  const handleUnfollowFromDashboard = async (userIdToUnfollow) => {
    console.log(`Dashboard: Attempting to unfollow user with ID: ${userIdToUnfollow}`);
    try {
      await dispatch(unfollowUser(userIdToUnfollow)).unwrap();
      console.log(`Successfully unfollowed user ${userIdToUnfollow}`);
      // Re-fetch to update lists immediately and ensure consistency
      if (user?.id) {
        dispatch(fetchFollowing(user.id));
        dispatch(fetchFollowers(user.id));
      }
    } catch (error) {
      console.error(`Failed to unfollow: ${error.message || 'An error occurred.'}`);
      // If the error is "Not currently following", it means our local state was stale.
      // We can force a re-fetch to synchronize.
      if (error.message && error.message.includes("Not currently following")) {
        console.log("Dashboard: Unfollow error due to stale state, re-fetching lists.");
        if (user?.id) {
          dispatch(fetchFollowing(user.id));
          dispatch(fetchFollowers(user.id));
        }
      }
    }
  };

  const handleFollowBack = async (followerId) => {
    if (!isAuthenticated) {
      console.error("Please log in to follow users.");
      return;
    }
    if (user?.id === followerId) {
      console.error("You cannot follow yourself.");
      return;
    }
    console.log(`Dashboard: Attempting to follow back user with ID: ${followerId}`);
    try {
      await dispatch(followUser(followerId)).unwrap();
      console.log(`Successfully followed back user ${followerId}`);
      // Re-fetch to update lists immediately and ensure consistency
      if (user?.id) {
        dispatch(fetchFollowing(user.id));
        dispatch(fetchFollowers(user.id));
      }
    } catch (error) {
      console.error(`Failed to follow back: ${error.message || 'An error occurred.'}`);
    }
  };

  const handleLeaveClubFromDashboard = async (clubId) => {
    console.log(`Dashboard: Attempting to leave club with ID: ${clubId}`);
    try {
      await dispatch(leaveClub(clubId)).unwrap();
      console.log(`Successfully left club ${clubId}`);
      dispatch(fetchMyClubs()); // Re-fetch to update list immediately
    } catch (error) {
      console.error(`Failed to leave club: ${error.message || 'An error occurred.'}`);
    }
  };

  const sortedUserPosts = [...userPosts].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
  });

  // Moved declaration of isAnyDataLoading before its usage in showLoadingState
  const isAnyDataLoading = authLoading || isMyClubsLoading || isFollowingLoading || isFollowersLoading || isUserPostsLoading;

  // Centralized loading check for the entire dashboard
  const showLoadingState = isAuthenticated && user?.id && (
    isAnyDataLoading ||
    (!hasFetchedMyClubs && myClubs.length === 0 && !isMyClubsLoading) ||
    (!hasFetchedFollowing && following.length === 0 && !isFollowingLoading) ||
    (!hasFetchedFollowers && followers.length === 0 && !isFollowersLoading) ||
    (!hasFetchedUserPosts && userPosts.length === 0 && !isUserPostsLoading)
  );


  if (showLoadingState) {
    return (
      <div className="dashboard-loading p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <p className="text-blue-400 text-xl">Loading dashboard data...</p>
      </div>
    );
  }

  // Centralized error display
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

  // If not authenticated, redirect (handled by useEffect)
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

      {showEditModal && user && (
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
        {isUserPostsLoading ? ( // Only show loading if it's actually loading
            <p className="text-blue-400 text-center">Loading your posts...</p>
        ) : sortedUserPosts.length === 0 && hasFetchedUserPosts ? ( // Show "no posts" only if fetched and empty
          <p className="text-gray-400">You haven’t created any posts yet.</p>
        ) : (
          <div className="feed-list">
            {sortedUserPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <div className="section bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <h2 className="section-title text-xl font-semibold mb-4 text-orange-400">My Clubs</h2>
        {isMyClubsLoading ? ( // Only show loading if it's actually loading
            <p className="text-blue-400 text-center">Loading your clubs...</p>
        ) : myClubs && myClubs.length === 0 && hasFetchedMyClubs ? ( // Show "no clubs" only if fetched and empty
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
        {isFollowingLoading ? ( // Only show loading if it's actually loading
            <p className="text-blue-400 text-center">Loading who you follow...</p>
        ) : followingError ? (
            <p className="text-red-500 text-center">Error loading following list: {followingError}</p>
        ) : following && following.length === 0 && hasFetchedFollowing ? ( // Show "not following" only if fetched and empty
          <p className="text-gray-400">You're not following anyone yet.</p>
        ) : (
          <ul className="feed-list">
            {following && following.map(followedUser => (
              <li key={followedUser.id} className="post-card bg-gray-700 rounded-lg p-4 shadow-md flex justify-between items-center mb-4">
                <p className="text-white text-lg">@{followedUser.username || 'Unknown'}</p> {/* Ensure username display */}
                <button
                  className={`
                    px-4 py-2 rounded-full font-bold text-sm transition duration-300 ease-in-out
                    ${'bg-red-600 text-white hover:bg-red-700'}
                  `}
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
        {isFollowersLoading ? ( // Only show loading if it's actually loading
            <p className="text-blue-400 text-center">Loading your followers...</p>
        ) : followersError ? (
            <p className="text-red-500 text-center">Error loading followers list: {followersError}</p>
        ) : followers && followers.length === 0 && hasFetchedFollowers ? ( // Show "no followers" only if fetched and empty
          <p className="text-gray-400">You don't have any followers yet.</p>
        ) : (
          <ul className="feed-list">
            {followers && followers.map(followerUser => {
              const isAlreadyFollowingBack = following && following.some(f => f.id === followerUser.id);
              return (
                <li key={followerUser.id} className="post-card bg-gray-700 rounded-lg p-4 shadow-md flex justify-between items-center mb-4">
                  <p className="text-white text-lg">@{followerUser.username || 'Unknown'}</p> {/* Ensure username display */}
                  {isAuthenticated && user?.id !== followerUser.id && (
                    <button
                      className={`
                        px-4 py-2 rounded-full font-bold text-sm transition duration-300 ease-in-out
                        ${isAlreadyFollowingBack ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}
                      `}
                      onClick={() =>
                        isAlreadyFollowingBack
                          ? handleUnfollowFromDashboard(followerUser.id)
                          : handleFollowBack(followerUser.id)
                      }
                    >
                      {isAlreadyFollowingBack ? 'Unfollow' : 'Follow Back'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
