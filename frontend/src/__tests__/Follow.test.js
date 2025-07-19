import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Follow from '../../components/Follow';

// Mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Test wrapper component
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Follow Component', () => {
  let mockNavigate;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    cleanup();
  });

  test('renders follow button when not following', () => {
    renderWithRouter(<Follow userId={2} isFollowing={false} />);
    const followButton = screen.getByTestId('follow-button');
    expect(followButton).toBeInTheDocument();
    expect(followButton).toHaveTextContent(/follow/i);
  });

  test('renders unfollow button when already following', () => {
    renderWithRouter(<Follow userId={2} isFollowing={true} />);
    const unfollowButton = screen.getByTestId('follow-button');
    expect(unfollowButton).toBeInTheDocument();
    expect(unfollowButton).toHaveTextContent(/unfollow/i);
  });

  test('allows user to follow another user', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Followed user' } });
    renderWithRouter(<Follow userId={2} isFollowing={false} />);
    
    const followButton = screen.getByTestId('follow-button');
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/follows',
        { followed_id: 2 },
        {
          headers: {
            Authorization: 'Bearer mock-token',
          },
        }
      );
      expect(screen.getByTestId('success-message')).toHaveTextContent(/followed user/i);
    });
  });

  test('allows user to unfollow another user', async () => {
    axios.delete.mockResolvedValueOnce({ data: { message: 'Unfollowed user' } });
    renderWithRouter(<Follow userId={2} isFollowing={true} />);
    
    const unfollowButton = screen.getByTestId('follow-button');
    fireEvent.click(unfollowButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        '/api/follows/2',
        {
          headers: {
            Authorization: 'Bearer mock-token',
          },
        }
      );
      expect(screen.getByTestId('success-message')).toHaveTextContent(/unfollowed user/i);
    });
  });

  test('displays loading state during follow request', async () => {
    axios.post.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    renderWithRouter(<Follow userId={2} isFollowing={false} />);
    
    const followButton = screen.getByTestId('follow-button');
    fireEvent.click(followButton);

    expect(followButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(followButton).not.toBeDisabled();
    });
  });

  test('handles unauthorized error when token is missing', async () => {
    localStorage.clear();
    renderWithRouter(<Follow userId={2} isFollowing={false} />);
    
    const followButton = screen.getByTestId('follow-button');
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(axios.post).not.toHaveBeenCalled();
      expect(screen.getByTestId('error-message')).toHaveTextContent(/please log in/i);
    });
  });

  test('handles server error during follow request', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Server error' }, status: 500 },
    });
    renderWithRouter(<Follow userId={2} isFollowing={false} />);
    
    const followButton = screen.getByTestId('follow-button');
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(/server error/i);
    });
  });

  test('disables follow button for invalid userId', () => {
    renderWithRouter(<Follow userId={null} isFollowing={false} />);
    const followButton = screen.getByTestId('follow-button');
    expect(followButton).toBeDisabled();
    expect(screen.getByTestId('error-message')).toHaveTextContent(/invalid user/i);
  });

  test('toggles button state after successful follow', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Followed user' } });
    renderWithRouter(<Follow userId={2} isFollowing={false} />);
    
    const followButton = screen.getByTestId('follow-button');
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(followButton).toHaveTextContent(/unfollow/i);
    });
  });
});