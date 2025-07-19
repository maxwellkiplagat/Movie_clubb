import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Follow from '../../components/Follow';

jest.mock('axios');

describe('Follow Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
  });

  test('allows user to follow another user', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Followed user' } });
    render(<BrowserRouter><Follow userId={2} /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /follow/i }));
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/follows', { followed_id: 2 }, expect.any(Object));
      expect(screen.getByText(/followed user/i)).toBeInTheDocument();
    });
  });

  test('allows user to unfollow another user', async () => {
    axios.delete.mockResolvedValueOnce({ data: { message: 'Unfollowed user' } });
    render(<BrowserRouter><Follow userId={2} isFollowing={true} /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /unfollow/i }));
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/follows/2', expect.any(Object));
      expect(screen.getByText(/unfollowed user/i)).toBeInTheDocument();
    });
  });
});