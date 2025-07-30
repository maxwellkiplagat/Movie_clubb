import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Import actions from clubSlice to update userPosts on like/comment changes
import { toggleLike, addComment, deleteComment } from '../clubs/clubSlice';

const API_URL = 'http://127.0.0.1:5000'; // Base URL for your backend API

// --- Async Thunks ---
// These thunks handle API calls related to authentication and user profiles.

/**
 * Registers a new user.
 * @param {Object} userData - Contains username, email, and password.
 * @returns {Object} User data from the backend upon successful registration.
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error during registration');
    }
  }
);

/**
 * Logs in an existing user.
 * @param {Object} userData - Contains username and password.
 * @returns {Object} User data and access token upon successful login.
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      if (data.access_token) {
        localStorage.setItem('jwt_token', data.access_token);
      }

      return { ...data, id: data.user_id };
    } catch (error) {
      console.error("loginUser Thunk: Catch block error:", error);
      return rejectWithValue(error.message || 'Network error during login');
    }
  }
);

/**
 * Checks if the current user session is valid using the stored JWT token.
 * @returns {Object} User data if session is valid.
 */
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return rejectWithValue('No token found');

      const response = await fetch(`${API_URL}/auth/check_session`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem('jwt_token');
        return rejectWithValue(data.message || 'Session invalid');
      }

      return { ...data, id: data.user_id };
    } catch (error) {
      localStorage.removeItem('jwt_token');
      return rejectWithValue(error.message || 'Network error during session check');
    }
  }
);

/**
 * Fetches the detailed profile of a specific user.
 * @param {number} userId - The ID of the user to fetch.
 * @returns {Object} The user profile data.
 */
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication required to fetch profile.');
      }

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch user profile');
      }
      return { ...data, id: data.id || data.user_id };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching user profile');
    }
  }
);

/**
 * Updates the profile of the current authenticated user.
 * @param {Object} payload - Contains userId and userData (e.g., username, email, password).
 * @returns {Object} The updated user profile data.
 */
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, userData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication required to update profile.');
      }

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update user profile');
      }
      return { ...data, id: data.id || data.user_id };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error updating user profile');
    }
  }
);

/**
 * Fetches posts created by a specific user.
 * @param {number} userId - The ID of the user whose posts to fetch.
 * @returns {Array} An array of post objects.
 */
export const fetchUserPosts = createAsyncThunk(
  'auth/fetchUserPosts',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      const response = await fetch(`${API_URL}/users/${userId}/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch user posts');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching user posts');
    }
  }
);

/**
 * Fetches the list of users that the current user is following.
 * @param {number} userId - The ID of the current user.
 * @returns {Array} An array of user objects that the current user is following.
 */
export const fetchFollowing = createAsyncThunk(
  'auth/fetchFollowing',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      const response = await fetch(`${API_URL}/users/${userId}/following`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch following list');
      }
      // Ensure each followed user object has an 'id' and 'username'
      return data.map(user => ({ id: user.id, username: user.username }));
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching following list');
    }
  }
);

/**
 * Allows the current user to follow another user.
 * @param {number} userIdToFollow - The ID of the user to follow.
 * @returns {Object} A partial user object (id, username) of the followed user.
 */
export const followUser = createAsyncThunk(
  'auth/followUser',
  async (userIdToFollow, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      const response = await fetch(`${API_URL}/users/${userIdToFollow}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to follow user');
      }
      // Return the ID and username of the user who was just followed
      return { id: userIdToFollow, username: data.username || 'Unknown' };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error following user');
    }
  }
);

/**
 * Allows the current user to unfollow another user.
 * @param {number} userIdToUnfollow - The ID of the user to unfollow.
 * @returns {number} The ID of the user who was unfollowed.
 */
export const unfollowUser = createAsyncThunk(
  'auth/unfollowUser',
  async (userIdToUnfollow, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      const response = await fetch(`${API_URL}/users/${userIdToUnfollow}/unfollow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        // If the backend says "Not currently following this user", it means our frontend state is stale.
        // We can still return the userIdToUnfollow to remove it from the frontend list,
        // but log the error.
        console.warn(`Unfollow API returned error for user ${userIdToUnfollow}: ${data.message}`);
        // Instead of rejecting, we can fulfill but note the error, or just return the ID
        // to allow the frontend to update. For now, let's still reject to show the error
        // but the UI update will be more robust.
        return rejectWithValue(data.message || 'Failed to unfollow user');
      }
      return userIdToUnfollow; // Return the ID of the user who was unfollowed
    } catch (error) {
      return rejectWithValue(error.message || 'Network error unfollowing user');
    }
  }
);

/**
 * Fetches the list of users who are following the current user (followers).
 * @param {number} userId - The ID of the current user.
 * @returns {Array} An array of user objects who are following the current user.
 */
export const fetchFollowers = createAsyncThunk(
  'auth/fetchFollowers',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      const response = await fetch(`${API_URL}/users/${userId}/followers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch followers list');
      }
      // Ensure each follower user object has an 'id' and 'username'
      return data.map(user => ({ id: user.id, username: user.username }));
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching followers list');
    }
  }
);

/**
 * Sends a password reset email to the provided email address.
 * @param {string} email - The email address to send the reset link to.
 * @returns {Object} A success message from the backend.
 */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to send password reset email.');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error during password reset request.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('jwt_token') || null,
    isAuthenticated: !!localStorage.getItem('jwt_token'),
    isLoading: false,
    error: null,
    userPosts: [],
    isUserPostsLoading: false,
    hasFetchedUserPosts: false, // Indicates if fetchUserPosts has completed at least once
    following: [],
    isFollowingLoading: false,
    followingError: null,
    hasFetchedFollowing: false, // Flag for following list
    followers: [],
    isFollowersLoading: false,
    followersError: null,
    hasFetchedFollowers: false, // Flag for followers list
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('jwt_token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.userPosts = [];
      state.isUserPostsLoading = false;
      state.hasFetchedUserPosts = false;
      state.following = [];
      state.isFollowingLoading = false;
      state.followingError = null;
      state.hasFetchedFollowing = false; // Reset flag on logout
      state.followers = [];
      state.isFollowersLoading = false;
      state.followersError = null;
      state.hasFetchedFollowers = false; // Reset flag on logout
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = { ...action.payload, id: action.payload.user_id || action.payload.id };
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // After successful registration, a new user will have no posts, following, or followers
        // Ensure these flags are set to true so Dashboard doesn't keep fetching
        state.hasFetchedUserPosts = true;
        state.hasFetchedFollowing = true;
        state.hasFetchedFollowers = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload, id: action.payload.user_id };
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        // Reset hasFetched flags on login to ensure fresh data is loaded for the logged-in user
        state.hasFetchedUserPosts = false;
        state.hasFetchedFollowing = false;
        state.hasFetchedFollowers = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      .addCase(checkSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload, id: action.payload.user_id };
        state.token = localStorage.getItem('jwt_token');
        state.isAuthenticated = true;
        // On session check, we assume data might be stale, so reset flags to trigger fetches
        state.hasFetchedUserPosts = false;
        state.hasFetchedFollowing = false;
        state.hasFetchedFollowers = false;
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload, id: action.payload.id || action.payload.user_id };
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload, id: action.payload.id || action.payload.user_id };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchUserPosts.pending, (state) => {
        state.isUserPostsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isUserPostsLoading = false;
        state.userPosts = action.payload;
        state.hasFetchedUserPosts = true; // Set flag to true on success
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isUserPostsLoading = false;
        state.error = action.payload;
        state.hasFetchedUserPosts = true; // Set flag to true even on error to prevent re-loop
      })

      .addCase(fetchFollowing.pending, (state) => {
        state.isFollowingLoading = true;
        state.followingError = null;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.isFollowingLoading = false;
        state.following = action.payload; // Action.payload already mapped to {id, username}
        state.hasFetchedFollowing = true; // Set flag to true on success
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.isFollowingLoading = false;
        state.followingError = action.payload;
        state.following = []; // Ensure it's an empty array on error
        state.hasFetchedFollowing = true; // Set flag to true even on error
      })

      .addCase(followUser.pending, (state) => {
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const newFollowedUser = action.payload; // This payload already contains {id, username}
        // Ensure new array reference for following to trigger re-render
        if (!state.following.some(u => u.id === newFollowedUser.id)) {
          state.following = [...state.following, newFollowedUser];
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(unfollowUser.pending, (state) => {
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const unfollowedUserId = action.payload;
        // Ensure new array reference for following to trigger re-render
        state.following = state.following.filter(user => user.id !== unfollowedUserId);
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchFollowers.pending, (state) => {
        state.isFollowersLoading = true;
        state.followersError = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.isFollowersLoading = false;
        state.followers = action.payload; // Action.payload already mapped to {id, username}
        state.hasFetchedFollowers = true; // Set flag to true on success
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.isFollowersLoading = false;
        state.followersError = action.payload;
        state.followers = []; // Ensure it's an empty array on error
        state.hasFetchedFollowers = true; // Set flag to true even on error
      })

      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- Handle updates to userPosts from clubSlice actions (for instant like update) ---
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likes_count, liked, currentUserId, currentUserUsername } = action.payload; // Destructure currentUserUsername
        state.userPosts = state.userPosts.map(post => {
          if (post.id === postId) {
            let updatedLikes = post.likes ? [...post.likes] : []; // Create new array for likes
            if (liked) {
              if (!updatedLikes.some(like => like.user_id === currentUserId)) {
                updatedLikes.push({ user_id: currentUserId, username: currentUserUsername || 'Unknown' }); // Use payload username
              }
            } else {
              updatedLikes = updatedLikes.filter(like => like.user_id !== currentUserId);
            }
            return {
              ...post, // Create new post object
              likes_count: likes_count,
              likes: updatedLikes
            };
          }
          return post;
        });
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        state.userPosts = state.userPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), comment], // Ensure new array reference for comments
            };
          }
          return post;
        });
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedCommentId = action.payload;
        state.userPosts = state.userPosts.map(post => {
          if (post.comments && post.comments.some(comment => comment.id === deletedCommentId)) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment.id !== deletedCommentId) // Ensure new array reference for comments
            };
          }
          return post;
        });
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
