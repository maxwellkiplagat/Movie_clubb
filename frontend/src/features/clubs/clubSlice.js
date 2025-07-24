import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logout } from '../auth/authSlice'; 

const API_URL = 'http://127.0.0.1:5000';

// Async Thunks
export const fetchAllClubs = createAsyncThunk(
  'clubs/fetchAllClubs',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/clubs/`, { headers });
      const data = await response.json();

      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch clubs');
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching clubs');
    }
  }
);

export const fetchMyClubs = createAsyncThunk(
  'clubs/fetchMyClubs',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id; 
      if (!token || !userId) {
        // Keeping Ian's more descriptive message
        return rejectWithValue('User not authenticated or ID missing. Cannot fetch user clubs.');
      }
      const response = await fetch(`${API_URL}/users/${userId}/clubs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch my clubs');
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching my clubs');
    }
  }
);

export const joinClub = createAsyncThunk(
  'clubs/joinClub',
  async (clubId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to join a club.');

      const response = await fetch(`${API_URL}/clubs/${clubId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to join club');
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error joining club');
    }
  }
);

// Max's new feature: leaveClub thunk - INTEGRATED
export const leaveClub = createAsyncThunk(
  'clubs/leaveClub',
  async (clubId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to leave a club.');

      const response = await fetch(`${API_URL}/clubs/${clubId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to leave club');
      return clubId; // Return clubId to filter it out from myClubs state
    } catch (error) {
      return rejectWithValue(error.message || 'Network error leaving club');
    }
  }
);

export const fetchClubPosts = createAsyncThunk(
  'clubs/fetchClubPosts',
  async (clubId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/posts/clubs/${clubId}/posts`, { headers });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch club posts');
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching club posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'clubs/createPost',
  async ({ clubId, movie_title, content }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to create a post.');

      const response = await fetch(`${API_URL}/posts/clubs/${clubId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ movie_title, content }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to create post');
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error creating post');
    }
  }
);

// Slice
const clubSlice = createSlice({
  name: 'clubs',
  initialState: {
    allClubs: [],
    myClubs: [],
    currentClubPosts: [],
    isAllClubsLoading: false, 
    isMyClubsLoading: false,  
    isLoading: false,         
    error: null,
    postCreationStatus: 'idle',
    postCreationError: null,
  },
  reducers: {
    clearClubError: (state) => {
      state.error = null;
    },
    clearCurrentClubPosts: (state) => {
      state.currentClubPosts = [];
    },
    setPostCreationStatus: (state, action) => {
      state.postCreationStatus = action.payload;
    },
    clearPostCreationError: (state) => {
      state.postCreationError = null;
    },
    resetClubState: (state) => { // Keep resetClubState
      state.allClubs = [];
      state.myClubs = [];
      state.currentClubPosts = [];
      state.isAllClubsLoading = false;
      state.isMyClubsLoading = false;
      state.isLoading = false;
      state.error = null;
      state.postCreationStatus = 'idle';
      state.postCreationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllClubs.pending, (state) => {
        state.isAllClubsLoading = true; 
        state.error = null;
      })
      .addCase(fetchAllClubs.fulfilled, (state, action) => {
        state.isAllClubsLoading = false; 
        state.allClubs = action.payload;
      })
      .addCase(fetchAllClubs.rejected, (state, action) => {
        state.isAllClubsLoading = false; 
        state.error = action.payload;
      })
      .addCase(fetchMyClubs.pending, (state) => {
        state.isMyClubsLoading = true; 
        state.error = null;
      })
      .addCase(fetchMyClubs.fulfilled, (state, action) => {
        state.isMyClubsLoading = false; 
        state.myClubs = action.payload;
      })
      .addCase(fetchMyClubs.rejected, (state, action) => {
        state.isMyClubsLoading = false; 
        state.error = action.payload;
      })
      .addCase(joinClub.pending, (state) => {
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(joinClub.fulfilled, (state, action) => { // Keep action parameter for consistency
        state.isLoading = false; 
      })
      .addCase(joinClub.rejected, (state, action) => {
        state.isLoading = false; 
        state.error = action.payload;
      })
      // Max's new feature: leaveClub extraReducer - INTEGRATED
      .addCase(leaveClub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(leaveClub.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myClubs = state.myClubs.filter(club => club.id !== action.payload); // Remove left club
      })
      .addCase(leaveClub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchClubPosts.pending, (state) => {
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(fetchClubPosts.fulfilled, (state, action) => {
        state.isLoading = false; 
        state.currentClubPosts = action.payload;
      })
      .addCase(fetchClubPosts.rejected, (state, action) => {
        state.isLoading = false; 
        state.error = action.payload;
      })
      .addCase(createPost.pending, (state) => {
        state.postCreationStatus = 'pending';
        state.postCreationError = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.postCreationStatus = 'succeeded';
      })
      .addCase(createPost.rejected, (state, action) => {
        state.postCreationStatus = 'failed';
        state.postCreationError = action.payload;
      })
      .addCase(logout, (state) => { 
        console.log("clubSlice: Handling logout, resetting club state.");
        state.allClubs = [];
        state.myClubs = [];
        state.currentClubPosts = [];
        state.isAllClubsLoading = false;
        state.isMyClubsLoading = false;
        state.isLoading = false;
        state.error = null;
        state.postCreationStatus = 'idle';
        state.postCreationError = null;
      });
  },
});

// Combine exports, ensuring resetClubState is included
export const { 
  clearClubError, 
  clearCurrentClubPosts, 
  setPostCreationStatus, 
  clearPostCreationError, 
  resetClubState // Ensure this is exported
} = clubSlice.actions;

export default clubSlice.reducer;
