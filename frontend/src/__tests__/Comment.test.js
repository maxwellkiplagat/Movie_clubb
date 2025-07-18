import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Comment from '../../components/Comment';

jest.mock('axios');

describe('Comment Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
  });

  test('allows user to comment on a post', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 1, content: 'Amazing movie!', postId: 1 } });
    render(<BrowserRouter><Comment postId={1} /></BrowserRouter>);
    fireEvent.change(screen.getByPlaceholderText(/write a comment/i), { target: { value: 'Amazing movie!' } });
    fireEvent.click(screen.getByRole('button', { name: /submit comment/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/comments', {
        content: 'Amazing movie!',
        postId: 1,
      }, expect.any(Object));
      expect(screen.getByText(/comment added/i)).toBeInTheDocument();
    });
  });

  test('allows user to rate a post', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 1, rating: 5, postId: 1 } });
    render(<BrowserRouter><Comment postId={1} /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /5 stars/i }));
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/ratings', {
        rating: 5,
        postId: 1,
      }, expect.any(Object));
      expect(screen.getByText(/rating submitted/i)).toBeInTheDocument();
    });
  });
});