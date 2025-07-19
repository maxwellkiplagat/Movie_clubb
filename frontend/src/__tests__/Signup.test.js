import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../../components/Login'; // Assuming signup is in Login component

jest.mock('axios');

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('allows user to create an account', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'mock-token', user: { id: 1, email: 'new@example.com' } } });
    render(<BrowserRouter><Login /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'New User' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/users', {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      }, expect.any(Object));
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(screen.getByText(/account created/i)).toBeInTheDocument();
    });
  });

  test('displays error for invalid signup', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Email already exists' } } });
    render(<BrowserRouter><Login /></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'New User' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});