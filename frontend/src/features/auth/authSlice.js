import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // adjust backend URL if needed

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, { email, password });
      localStorage.setItem('token', res.data.access_token);
      return res.data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/register`, { username, email, password });
      return res.data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(login.fulfilled, (s, action) => {
        s.status = 'succeeded';
        s.user = action.payload;
        s.isAuthenticated = true;
      })
      .addCase(login.rejected, (s, action) => { s.status = 'failed'; s.error = action.payload; })
      // register
      .addCase(register.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(register.fulfilled, (s, action) => {
        s.status = 'succeeded';
        s.user = action.payload;
        s.isAuthenticated = true;
      })
      .addCase(register.rejected, (s, action) => { s.status = 'failed'; s.error = action.payload; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
