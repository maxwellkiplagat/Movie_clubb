import { createSlice } from '@reduxjs/toolkit';

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: {
    movies: [
      { id: 1, title: "Inception", genre: "Sci-Fi", watched: true },
      { id: 2, title: "The Godfather", genre: "Crime", watched: false },
    ],
  },
  reducers: {
    addToWatchlist: (state, action) => {
      state.movies.push(action.payload);
    },
    removeFromWatchlist: (state, action) => {
      state.movies = state.movies.filter(movie => movie.id !== action.payload);
    },
    toggleWatchedStatus: (state, action) => {
      const movie = state.movies.find(m => m.id === action.payload);
      if (movie) {
        movie.watched = !movie.watched;
      }
    },
  },
});

export const { addToWatchlist, removeFromWatchlist, toggleWatchedStatus } = watchlistSlice.actions;
export default watchlistSlice.reducer;
