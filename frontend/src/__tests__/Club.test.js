import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Club from '../../components/Club';

jest.mock('axios');

describe('Club Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
  });

  test('allows user to join a genre-based club', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Sci-Fi Club', genre: 'Sci-Fi' }] });
    axios.post.mockResolvedValueOnce({ data: { message: 'Joined Sci-Fi Club' } });

    render(<BrowserRouter><Club /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Sci-Fi Club/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /join sci-fi club/i }));
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/clubs/join/1', {}, expect.any(Object));
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
      }, expect.any(Object));
      expect(screen.getByText(/club created/i)).toBeInTheDocument();
    });
  });
});