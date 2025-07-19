import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MovieTracker from '../../components/MovieTracker';

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

describe('MovieTracker Component', () => {
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

  test('renders MovieTracker component without crashing', () => {
    renderWithRouter(<MovieTracker />);
    expect(screen.getByTestId('movie-tracker-container')).toBeInTheDocument();
  });

  test('displays tracked movies on load', async () => {
    const mockMovies = [
      { id: 1, title: 'Inception', watched: true, experience: 'Loved it!' },
      { id: 2, title: 'The Matrix', watched: false, experience: '' },
    ];
    axios.get.mockResolvedValueOnce({ data: mockMovies });

    renderWithRouter(<MovieTracker />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/movies', {
        headers: { Authorization: 'Bearer mock-token' },
      });
      expect(screen.getByTestId('movie-item-1')).toHaveTextContent(/Inception/i);
      expect(screen.getByTestId('movie-item-1')).toHaveTextContent(/Loved it!/i);
      expect(screen.getByTestId('movie-item-2')).toHaveTextContent(/The Matrix/i);
    });
  });

  test('displays empty state when no movies are tracked', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    renderWithRouter(<MovieTracker />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toHaveTextContent(/no movies tracked/i);
    });
  });

  test('allows user to add a new movie', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({
      data: { id: 3, title: 'Dune', watched: false, experience: '' },
    });

    renderWithRouter(<MovieTracker />);

    const titleInput = screen.getByTestId('movie-title-input');
    const addButton = screen.getByTestId('add-movie-button');

    fireEvent.change(titleInput, { target: { value: 'Dune' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/movies',
        { title: 'Dune', watched: false, experience: '' },
        { headers: { Authorization: 'Bearer mock-token' } }
      );
      expect(screen.getByTestId('movie-item-3')).toHaveTextContent(/Dune/i);
      expect(screen.getByTestId('success-message')).toHaveTextContent(/movie added/i);
    });
  });

  test('allows user to mark movie as watched with experience', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, title: 'Inception', watched: false, experience: '' }],
    });
    axios.put.mockResolvedValueOnce({
      data: { id: 1, title: 'Inception', watched: true, experience: 'Amazing!' },
    });

    renderWithRouter(<MovieTracker />);

    await waitFor(() => screen.getByTestId('movie-item-1'));

    const watchedCheckbox = screen.getByTestId('watched-checkbox-1');
    const experienceInput = screen.getByTestId('experience-input-1');
    const updateButton = screen.getByTestId('update-movie-button-1');

    fireEvent.click(watchedCheckbox);
    fireEvent.change(experienceInput, { target: { value: 'Amazing!' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/movies/1',
        { watched: true, experience: 'Amazing!' },
        { headers: { Authorization: 'Bearer mock-token' } }
      );
      expect(screen.getByTestId('success-message')).toHaveTextContent(/movie updated/i);
    });
  });

  test('allows user to delete a movie', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, title: 'Inception', watched: true, experience: 'Loved it!' }],
    });
    axios.delete.mockResolvedValueOnce({ data: { message: 'Movie deleted' } });

    renderWithRouter(<MovieTracker />);

    await waitFor(() => screen.getByTestId('movie-item-1'));

    const deleteButton = screen.getByTestId('delete-movie-button-1');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/movies/1', {
        headers: { Authorization: 'Bearer mock-token' },
      });
      expect(screen.queryByTestId('movie-item-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('success-message')).toHaveTextContent(/movie deleted/i);
    });
  });

  test('displays loading state during API calls', async () => {
    axios.get.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    renderWithRouter(<MovieTracker />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  test('handles unauthorized access when token is missing', async () => {
    localStorage.clear();
    renderWithRouter(<MovieTracker />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(axios.get).not.toHaveBeenCalled();
      expect(screen.getByTestId('error-message')).toHaveTextContent(/please log in/i);
    });
  });

  test('handles server error when fetching movies', async () => {
    axios.get.mockRejectedValueOnce({
      response: { data: { error: 'Server error' }, status: 500 },
    });

    renderWithRouter(<MovieTracker />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(/server error/i);
    });
  });

  test('disables add button when title is empty', () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<MovieTracker />);

    const addButton = screen.getByTestId('add-movie-button');
    expect(addButton).toBeDisabled();

    const titleInput = screen.getByTestId('movie-title-input');
    fireEvent.change(titleInput, { target: { value: 'Dune' } });
    expect(addButton).not.toBeDisabled();
  });
});