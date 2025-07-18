import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Profile from '../../components/Profile';

jest.mock('axios');

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
  });

  test('renders user profile and allows updates', async () => {
    axios.get.mockResolvedValueOnce({ data: { id: 1, name: 'Brian', bio: 'Movie enthusiast' } });
    axios.put.mockResolvedValueOnce({ data: { name: 'Brian Ochieng', bio: 'Updated bio' } });

    render(<BrowserRouter><Profile /></BrowserRouter>);
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
      }, expect.any(Object));
      expect(screen.getByText(/profile updated/i)).toBeInTheDocument();
    });
  });

  test('matches profile snapshot', () => {
    const { container } = render(<BrowserRouter><Profile /></BrowserRouter>);
    expect(container).toMatchSnapshot();
  });
});