import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://127.0.0.1:5000';

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      // Fixed template literal syntax
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
      // Fixed template literal syntax
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

      // Keep 'jwt_token' consistently
      if (data.access_token) {
        localStorage.setItem('jwt_token', data.access_token);
        // Removed localStorage.setItem('user', ...) as Redux state manages user
      }

      // Ensure 'id' is always present in the user object
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
      // Use 'jwt_token' consistently for localStorage
      const token = localStorage.getItem('jwt_token');
      if (!token) return rejectWithValue('No token found');

      // Fixed template literal syntax
      const response = await fetch(`${API_URL}/auth/check_session`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem('jwt_token'); // Use 'jwt_token'
        // Removed localStorage.removeItem('user'); as Redux state manages user
        return rejectWithValue(data.message || 'Session invalid');
      }

      // Ensure 'id' is always present in the user object
      return { ...data, id: data.user_id }; 
    } catch (error) {
      localStorage.removeItem('jwt_token'); // Use 'jwt_token'
      // Removed localStorage.removeItem('user'); as Redux state manages user
      return rejectWithValue(error.message || 'Network error during session check');
    }
  }
);

// Fetch User Profile
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (userId, { rejectWithValue, getState }) => {
    try {
      // Ensure token is retrieved consistently
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
      // Ensure 'id' is always present in the user object
      return { ...data, id: data.id || data.user_id }; 
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching user profile');
    }
  }
);

// Update User Profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, userData }, { rejectWithValue, getState }) => {
    try {
      // Ensure token is retrieved consistently
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
      // Ensure 'id' is always present in the user object
      return { ...data, id: data.id || data.user_id }; 
    } catch (error) {
      return rejectWithValue(error.message || 'Network error updating user profile');
    }
  }
);

// NEW THUNK: Fetch posts created by the user (from previous work)
export const fetchUserPosts = createAsyncThunk(
  'auth/fetchUserPosts',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      // Fixed template literal syntax
      const response = await fetch(`${API_URL}/users/${userId}/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Fixed template literal syntax
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

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    // Use 'jwt_token' consistently
    token: localStorage.getItem('jwt_token') || null, 
    isAuthenticated: !!localStorage.getItem('jwt_token'),
    isLoading: false,
    error: null,
    userPosts: [], // Added from previous work
    hasFetchedUserPosts: false, // Added from previous work
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('jwt_token'); // Use 'jwt_token' consistently
      // Removed localStorage.removeItem('user'); as Redux state manages user
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.userPosts = []; // Clear user posts on logout
      state.hasFetchedUserPosts = false; // Reset flag on logout
    },
    clearError: (state) => {
      state.error = null;
    },
    // Keep setUser reducer for direct user state updates, ensuring ID consistency
    setUser: (state, action) => {
      state.user = { ...action.payload, id: action.payload.user_id || action.payload.id };
      state.isAuthenticated = true;
    }
    // Removed syncAuth as setUser covers its functionality and we don't need redundant sync
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
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
        // Ensure 'id' is present in the user object
        state.user = { ...action.payload, id: action.payload.user_id }; 
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
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
        // Ensure 'id' is present in the user object
        state.user = { ...action.payload, id: action.payload.user_id }; 
        state.token = localStorage.getItem('jwt_token'); // Use 'jwt_token' consistently
        state.isAuthenticated = true;
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
        // Ensure 'id' is present in the user object
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
        // Ensure 'id' is present in the user object
        state.user = { ...action.payload, id: action.payload.id || action.payload.user_id }; 
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Cases for fetchUserPosts (from previous work)
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = action.payload; 
        state.hasFetchedUserPosts = true; 
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.hasFetchedUserPosts = true; 
      });
  },
});

// Export actions, keeping setUser and removing syncAuth
export const { logout, clearError, setUser } = authSlice.actions; 
export default authSlice.reducer;
