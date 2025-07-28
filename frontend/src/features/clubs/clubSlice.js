import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logout, fetchUserPosts } from '../auth/authSlice';

const API_URL = 'http://127.0.0.1:5000';

// Async Thunks

// Existing Thunks (omitted for brevity, assume they are still here)
// ... fetchAllClubs, fetchMyClubs, joinClub, leaveClub, fetchClubDetails, fetchClubPosts, createPost, deletePost, fetchFeedPosts ...

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
      return clubId;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error leaving club');
    }
  }
);

export const fetchClubDetails = createAsyncThunk(
  'clubs/fetchClubDetails',
  async (clubId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/clubs/${clubId}`, { headers });
      const data = await response.json();

      if (!response.ok) return rejectWithValue(data.message || `Failed to fetch club with ID ${clubId}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || `Network error fetching club with ID ${clubId}`);
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

export const deletePost = createAsyncThunk(
  'clubs/deletePost',
  async (postId, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to delete a post.');

      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete post');
      }

      const userId = getState().auth.user?.id;
      if (userId) {
        dispatch(fetchUserPosts(userId)); // Refresh user's own posts on dashboard
      }

      return postId; // Return the ID of the deleted post
    } catch (error) {
      return rejectWithValue(error.message || 'Network error deleting post');
    }
  }
);

export const fetchFeedPosts = createAsyncThunk(
  'clubs/fetchFeedPosts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/posts/feed`, { headers });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch feed posts');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching feed posts');
    }
  }
);


// NEW THUNK: Toggle Like on a Post
export const toggleLike = createAsyncThunk(
  'clubs/toggleLike',
  async (postId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to like/unlike a post.');

      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}), // Empty body as endpoint doesn't require data
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to toggle like');
      }
      // The backend now returns { message, likes_count, liked }
      return { postId, ...data };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error toggling like');
    }
  }
);

// NEW THUNK: Add a Comment to a Post
export const addComment = createAsyncThunk(
  'clubs/addComment',
  async ({ postId, content }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to add a comment.');

      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to add comment');
      }
      return { postId, comment: data }; // Return postId and the new comment data
    } catch (error) {
      return rejectWithValue(error.message || 'Network error adding comment');
    }
  }
);

// NEW THUNK: Delete a Comment
export const deleteComment = createAsyncThunk(
  'clubs/deleteComment',
  async (commentId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to delete a comment.');

      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete comment');
      }
      return commentId; // Return the ID of the deleted comment
    } catch (error) {
      return rejectWithValue(error.message || 'Network error deleting comment');
    }
  }
);

//NEW THUNK: CREATE CLUB
export const createClub = createAsyncThunk(
  "clubs/createClub",
  async ({ name, description }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token)
        return rejectWithValue("Authentication required to create a club.");

      const response = await fetch(`${API_URL}/clubs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok)
        return rejectWithValue(data.message || "Failed to create club");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error creating club");
    }
  }
);


// Helper function to update a post within an array (used for feedPosts and currentClubPosts)
const updatePostInArray = (postsArray, postId, updateFn) => {
  return postsArray.map(post =>
    post.id === postId ? { ...post, ...updateFn(post) } : post
  );
};

// Slice
const clubSlice = createSlice({
  name: 'clubs',
  initialState: {
    allClubs: [],
    myClubs: [],
    currentClub: null,
    currentClubPosts: [],
    feedPosts: [],
    isAllClubsLoading: false,
    isMyClubsLoading: false,
    isCurrentClubLoading: false,
    isLoading: false, // General loading for various operations
    error: null,
    postCreationStatus: 'idle',
    postCreationError: null,
    postDeletionStatus: 'idle',
    postDeletionError: null,
    isFeedPostsLoading: false,
    feedPostsError: null,
    // No specific loading/error states for likes/comments for now, as they are quick operations
  },
  reducers: {
    clearClubError: (state) => {
      state.error = null;
    },
    clearCurrentClubPosts: (state) => {
      state.currentClubPosts = [];
    },
    clearCurrentClub: (state) => {
      state.currentClub = null;
      state.currentClubPosts = [];
    },
    setPostCreationStatus: (state, action) => {
      state.postCreationStatus = action.payload;
    },
    clearPostCreationError: (state) => {
      state.postCreationError = null;
    },
    setPostDeletionStatus: (state, action) => {
      state.postDeletionStatus = action.payload;
    },
    clearPostDeletionError: (state) => {
      state.postDeletionError = null;
    },
    resetClubState: (state) => {
      state.allClubs = [];
      state.myClubs = [];
      state.currentClub = null;
      state.currentClubPosts = [];
      state.feedPosts = [];
      state.isAllClubsLoading = false;
      state.isMyClubsLoading = false;
      state.isCurrentClubLoading = false;
      state.isLoading = false;
      state.error = null;
      state.postCreationStatus = 'idle';
      state.postCreationError = null;
      state.postDeletionStatus = 'idle';
      state.postDeletionError = null;
      state.isFeedPostsLoading = false;
      state.feedPostsError = null;
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
      .addCase(joinClub.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(joinClub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(leaveClub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(leaveClub.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myClubs = state.myClubs.filter(club => club.id !== action.payload);
        if (state.currentClub && state.currentClub.id === action.payload) {
          state.currentClub = null;
          state.currentClubPosts = [];
        }
      })
      .addCase(leaveClub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchClubDetails.pending, (state) => {
        state.isCurrentClubLoading = true;
        state.error = null;
        state.currentClub = null;
      })
      .addCase(fetchClubDetails.fulfilled, (state, action) => {
        state.isCurrentClubLoading = false;
        state.currentClub = action.payload;
      })
      .addCase(fetchClubDetails.rejected, (state, action) => {
        state.isCurrentClubLoading = false;
        state.error = action.payload;
        state.currentClub = null;
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
      .addCase(deletePost.pending, (state) => {
        state.postDeletionStatus = 'pending';
        state.postDeletionError = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.postDeletionStatus = 'succeeded';
        const deletedPostId = action.payload;
        state.currentClubPosts = state.currentClubPosts.filter(post => post.id !== deletedPostId);
        state.feedPosts = state.feedPosts.filter(post => post.id !== deletedPostId);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.postDeletionStatus = 'failed';
        state.postDeletionError = action.payload;
      })
      .addCase(fetchFeedPosts.pending, (state) => {
        state.isFeedPostsLoading = true;
        state.feedPostsError = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.isFeedPostsLoading = false;
        state.feedPosts = action.payload;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.isFeedPostsLoading = false;
        state.feedPostsError = action.payload;
      })
      // NEW: Reducers for toggleLike
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likes_count } = action.payload; // Removed 'liked'
        // Update feedPosts
        state.feedPosts = updatePostInArray(state.feedPosts, postId, (post) => ({
          likes_count: likes_count,
          // The backend response for toggleLike doesn't return the full 'likes' array,
          // only likes_count and 'liked' status. For a full update of the 'likes' array
          // on the frontend, you would need to fetch the post again or have the backend
          // return the updated 'likes' array. For now, we only update the count.
          // If the backend sends the full `likes` array, you would do:
          // likes: action.payload.likes // assuming action.payload.likes is the updated array
        }));
        // Update currentClubPosts (if applicable)
        state.currentClubPosts = updatePostInArray(state.currentClubPosts, postId, (post) => ({
          likes_count: likes_count,
          // If the backend sends the full `likes` array, you would do:
          // likes: action.payload.likes
        }));
      })
      // NEW: Reducers for addComment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        // Update feedPosts
        state.feedPosts = updatePostInArray(state.feedPosts, postId, (post) => ({
          comments: [...(post.comments || []), comment], // Add new comment to array
        }));
        // Update currentClubPosts (if applicable)
        state.currentClubPosts = updatePostInArray(state.currentClubPosts, postId, (post) => ({
          comments: [...(post.comments || []), comment],
        }));
      })
      // NEW: Reducers for deleteComment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedCommentId = action.payload;
        // Find the post that contained this comment and remove it
        state.feedPosts = state.feedPosts.map(post => {
          if (post.comments && post.comments.some(comment => comment.id === deletedCommentId)) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment.id !== deletedCommentId)
            };
          }
          return post;
        });
        state.currentClubPosts = state.currentClubPosts.map(post => {
          if (post.comments && post.comments.some(comment => comment.id === deletedCommentId)) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment.id !== deletedCommentId)
            };
          }
          return post;
        });
      })
      .addCase(logout, (state) => {
        console.log("clubSlice: Handling logout, resetting club state.");
        state.allClubs = [];
        state.myClubs = [];
        state.currentClub = null;
        state.currentClubPosts = [];
        state.feedPosts = [];
        state.isAllClubsLoading = false;
        state.isMyClubsLoading = false;
        state.isCurrentClubLoading = false;
        state.isLoading = false;
        state.error = null;
        state.postCreationStatus = 'idle';
        state.postCreationError = null;
        state.postDeletionStatus = 'idle';
        state.postDeletionError = null;
        state.isFeedPostsLoading = false;
        state.feedPostsError = null;
      });
  },
});

export const {
  clearClubError,
  clearCurrentClubPosts,
  clearCurrentClub,
  setPostCreationStatus,
  clearPostCreationError,
  setPostDeletionStatus,
  clearPostDeletionError,
  resetClubState
} = clubSlice.actions;


export default clubSlice.reducer;
