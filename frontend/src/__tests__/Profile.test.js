import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Profile from '../../components/Profile';

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

describe('Profile Component', () => {
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

  test('renders Profile component without crashing', () => {
    renderWithRouter(<Profile />);
    expect(screen.getByTestId('profile-container')).toBeInTheDocument();
  });

  test('renders user profile and allows updates', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { id: 1, name: 'Brian', bio: 'Movie enthusiast' } 
    });
    axios.put.mockResolvedValueOnce({ 
      data: { name: 'Brian Ochieng', bio: 'Updated bio' } 
    });

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/profile', {
        headers: { Authorization: 'Bearer mock-token' },
      });
      expect(screen.getByTestId('profile-name')).toHaveTextContent(/Brian/i);
      expect(screen.getByTestId('profile-bio')).toHaveTextContent(/Movie enthusiast/i);
    });

    const nameInput = screen.getByTestId('name-input');
    const bioInput = screen.getByTestId('bio-input');
    const saveButton = screen.getByTestId('save-button');

    fireEvent.change(nameInput, { target: { value: 'Brian Ochieng' } });
    fireEvent.change(bioInput, { target: { value: 'Updated bio' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/profile',
        { name: 'Brian Ochieng', bio: 'Updated bio' },
        { headers: { Authorization: 'Bearer mock-token' } }
      );
      expect(screen.getByTestId('success-message')).toHaveTextContent(/profile updated/i);
    });
  });

  test('displays loading state during profile fetch', async () => {
    axios.get.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    renderWithRouter(<Profile />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  test('handles unauthorized access when token is missing', async () => {
    localStorage.clear();
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(axios.get).not.toHaveBeenCalled();
      expect(screen.getByTestId('error-message')).toHaveTextContent(/please log in/i);
    });
  });

  test('handles server error when fetching profile', async () => {
    axios.get.mockRejectedValueOnce({
      response: { data: { error: 'Server error' }, status: 500 },
    });

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(/server error/i);
    });
  });

  test('handles validation error for empty name field', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { id: 1, name: 'Brian', bio: 'Movie enthusiast' } 
    });

    renderWithRouter(<Profile />);

    await waitFor(() => screen.getByTestId('profile-name'));

    const nameInput = screen.getByTestId('name-input');
    const saveButton = screen.getByTestId('save-button');

    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.put).not.toHaveBeenCalled();
      expect(screen.getByTestId('error-message')).toHaveTextContent(/name is required/i);
    });
  });

  test('renders profile with missing bio', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { id: 1, name: 'Brian', bio: '' } 
    });

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-name')).toHaveTextContent(/Brian/i);
      expect(screen.getByTestId('profile-bio')).toHaveTextContent(/no bio provided/i);
    });
  });

  test('matches profile snapshot with loaded data', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { id: 1, name: 'Brian', bio: 'Movie enthusiast' } 
    });

    const { container } = renderWithRouter(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByTestId('profile-name')).toBeInTheDocument();
    });
    
    expect(container).toMatchSnapshot();
  });

  test('disables save button during profile update', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { id: 1, name: 'Brian', bio: 'Movie enthusiast' } 
    });
    axios.put.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    renderWithRouter(<Profile />);

    await waitFor(() => screen.getByTestId('profile-name'));

    const nameInput = screen.getByTestId('name-input');
    const saveButton = screen.getByTestId('save-button');

    fireEvent.change(nameInput, { target: { value: 'Brian Ochieng' } });
    fireEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });
});