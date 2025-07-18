import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Login from '../components/Login';
import Profile from '../components/Profile';
import MoviePost from '../components/MoviePost';
import Club from '../components/Club';
import Comment from '../components/Comment';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// Mock axios for API calls
jest.mock('axios');

describe('TV Series & Movies Club App', () => {
  // Test Login Component
  describe('Login Component', () => {
    test('renders login form without crashing', () => {
      render(<Login />);
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('allows user to login with valid credentials', async () => {
      axios.post.mockResolvedValueOnce({ data: { token: 'mock-token' } });
      render(<Login />);
      fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/login', {
          email: 'test@example.com',
          password: 'password123',
        });
        expect(localStorage.getItem('token')).toBe('mock-token');
      });
    });
  });

  // Test Profile Component
  describe('Profile Component', () => {
    test('renders user profile and allows updates', async () => {
      axios.get.mockResolvedValueOnce({ data: { name: 'Brian', bio: 'Movie enthusiast' } });
      axios.put.mockResolvedValueOnce({ data: { name: 'Brian Ochieng', bio: 'Updated bio' } });

      render(<Profile />);
      await waitFor(() => {
        expect(screen.getByText(/Brian/i)).toBeInTheDocument();
        expect(screen.getByText(/Movie enthusiast/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'Brian Ochieng' } });
      fireEvent.change(screen.getByPlaceholderText(/bio/i), { target: { value: 'Updated bio' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith('/api/profile', {
          name: 'Brian Ochieng',
          bio: 'Updated bio',
        });
      });
    });

    test('matches profile snapshot', () => {
      const { container } = render(<Profile />);
      expect(container).toMatchSnapshot();
    });
  });

  // Test MoviePost Component
  describe('MoviePost Component', () => {
    test('allows user to create and share a movie post', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 1, title: 'Inception', review: 'Great movie!' } });
      render(<BrowserRouter><MoviePost /></BrowserRouter>);
      fireEvent.change(screen.getByPlaceholderText(/movie title/i), { target: { value: 'Inception' } });
      fireEvent.change(screen.getByPlaceholderText(/review/i), { target: { value: 'Great movie!' } });
      fireEvent.click(screen.getByRole('button', { name: /post/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/posts', {
          title: 'Inception',
          review: 'Great movie!',
        });
        expect(screen.getByText(/post created/i)).toBeInTheDocument();
      });
    });
  });

  // Test Club Component
  describe('Club Component', () => {
    test('allows user to join a genre-based club', async () => {
      axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Sci-Fi Club', genre: 'Sci-Fi' }] });
      axios.post.mockResolvedValueOnce({ data: { message: 'Joined Sci-Fi Club' } });

      render(<BrowserRouter><Club /></BrowserRouter>);
      await waitFor(() => {
        expect(screen.getByText(/Sci-Fi Club/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /join sci-fi club/i }));
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/clubs/join/1', {});
        expect(screen.getByText(/joined sci-fi club/i)).toBeInTheDocument();
      });
    });

    test('allows user to create a new club', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 2, name: 'Drama Club', genre: 'Drama' } });
      render(<BrowserRouter><Club /></BrowserRouter>);
      fireEvent.change(screen.getByPlaceholderText(/club name/i), { target: { value: 'Drama Club' } });
      fireEvent.change(screen.getByPlaceholderText(/genre/i), { target: { value: 'Drama' } });
      fireEvent.click(screen.getByRole('button', { name: /create club/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/clubs', {
          name: 'Drama Club',
          genre: 'Drama',
        });
        expect(screen.getByText(/club created/i)).toBeInTheDocument();
      });
    });
  });

  // Test Comment Component
  describe('Comment Component', () => {
    test('allows user to comment on a post', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 1, content: 'Amazing movie!', postId: 1 } });
      render(<BrowserRouter><Comment postId={1} /></BrowserRouter>);
      fireEvent.change(screen.getByPlaceholderText(/write a comment/i), { target: { value: 'Amazing movie!' } });
      fireEvent.click(screen.getByRole('button', { name: /submit comment/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/comments', {
          content: 'Amazing movie!',
          postId: 1,
        });
        expect(screen.getByText(/comment added/i)).toBeInTheDocument();
      });
    });
  });
});