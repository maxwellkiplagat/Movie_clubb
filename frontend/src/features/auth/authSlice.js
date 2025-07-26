import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://127.0.0.1:5000';

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

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log("loginUser Thunk: Attempting to log in.");
      console.log("loginUser Thunk: User data:", userData);
      console.log("loginUser Thunk: API URL:", `${API_URL}/auth/login`);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("loginUser Thunk: Response data:", data);
      console.log("loginUser Thunk: Response OK:", response.ok);

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

// Fetch users that the current user is following
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
      return data; // This should be a list of user objects
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching following list');
    }
  }
);

// NEW THUNK: Follow a user
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
      return { id: userIdToFollow, username: data.username || 'Unknown' };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error following user');
    }
  }
);

// NEW THUNK: Unfollow a user
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
        return rejectWithValue(data.message || 'Failed to unfollow user');
      }
      return userIdToUnfollow;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error unfollowing user');
    }
  }
);

// NEW THUNK: Fetch users that are following the current user (followers)
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
      return data; // This should be a list of user objects
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching followers list');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('jwt_token') || null,
    isAuthenticated: !!localStorage.getItem('jwt_token'),
    isLoading: false, // Global loading for auth operations like login, register, checkSession, profile update
    error: null,
    userPosts: [],
    isUserPostsLoading: false, // NEW: Dedicated loading state for user posts
    hasFetchedUserPosts: false,
    following: [],
    isFollowingLoading: false,
    followingError: null,
    followers: [],
    isFollowersLoading: false,
    followersError: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('jwt_token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false; // Reset global loading on logout
      state.error = null;
      state.userPosts = [];
      state.isUserPostsLoading = false; // Reset dedicated loading on logout
      state.hasFetchedUserPosts = false;
      state.following = [];
      state.isFollowingLoading = false;
      state.followingError = null;
      state.followers = [];
      state.isFollowersLoading = false;
      state.followersError = null;
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
        state.isLoading = true; // Use global loading
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false; // Use global loading
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false; // Use global loading
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true; // Use global loading
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false; // Use global loading
        state.user = { ...action.payload, id: action.payload.user_id };
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false; // Use global loading
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      .addCase(checkSession.pending, (state) => {
        state.isLoading = true; // Use global loading
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isLoading = false; // Use global loading
        state.user = { ...action.payload, id: action.payload.user_id };
        state.token = localStorage.getItem('jwt_token');
        state.isAuthenticated = true;
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.isLoading = false; // Use global loading
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true; // Use global loading
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false; // Use global loading
        state.user = { ...action.payload, id: action.payload.id || action.payload.user_id };
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false; // Use global loading
        state.error = action.payload;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true; // Use global loading
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false; // Use global loading
        state.user = { ...action.payload, id: action.payload.id || action.payload.user_id };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false; // Use global loading
        state.error = action.payload;
      })

      // MODIFIED: fetchUserPosts to use isUserPostsLoading
      .addCase(fetchUserPosts.pending, (state) => {
        state.isUserPostsLoading = true; // Use dedicated loading
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isUserPostsLoading = false; // Use dedicated loading
        state.userPosts = action.payload;
        state.hasFetchedUserPosts = true;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isUserPostsLoading = false; // Use dedicated loading
        state.error = action.payload;
        state.hasFetchedUserPosts = true;
      })

      // Cases for fetchFollowing
      .addCase(fetchFollowing.pending, (state) => {
        state.isFollowingLoading = true;
        state.followingError = null;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.isFollowingLoading = false;
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.isFollowingLoading = false;
        state.followingError = action.payload;
        state.following = [];
      })

      // Cases for followUser
      .addCase(followUser.pending, (state) => {
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const newFollowedUser = action.payload;
        if (!state.following.some(u => u.id === newFollowedUser.id)) {
          state.following.push(newFollowedUser);
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Cases for unfollowUser
      .addCase(unfollowUser.pending, (state) => {
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const unfollowedUserId = action.payload;
        state.following = state.following.filter(user => user.id !== unfollowedUserId);
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Cases for fetchFollowers
      .addCase(fetchFollowers.pending, (state) => {
        state.isFollowersLoading = true;
        state.followersError = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.isFollowersLoading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.isFollowersLoading = false;
        state.followersError = action.payload;
        state.followers = [];
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
