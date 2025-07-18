import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import MovieTracker from '../../components/MovieTracker';

jest.mock('axios');

describe('MovieTracker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
  });

  test('displays tracked movies', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, title: 'Inception', watched: true, experience: 'Loved it!' }] });
    render(<BrowserRouter><MovieTracker /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Inception/i)).toBeInTheDocument();
      expect(screen.getByText(/Loved it!/i)).toBeInTheDocument();
    });
  });

  test('allows user to track a movie', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 2, title: 'The Matrix', watched: true, experience: 'Awesome!' } });
    render(<BrowserRouter><MovieTracker /></BrowserRouter>);
    fireEvent.change(screen.getByPlaceholderText(/movie title/i), { target: { value: 'The Matrix' } });
    fireEvent.change(screen.getByPlaceholderText(/experience/i), { target: { value: 'Awesome!' } });
    fireEvent.click(screen.getByRole('button', { name: /track movie/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/tracked_movies', {
        title: 'The Matrix',
        watched: true,
        experience: 'Awesome!',
      }, expect.any(Object));
      expect(screen.getByText(/movie tracked/i)).toBeInTheDocument();
    });
  });
});