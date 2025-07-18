import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../../components/Login';

jest.mock('axios');

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login form without crashing', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('allows user to login with valid credentials', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'mock-token', user: { id: 1 } } });
    render(<BrowserRouter><Login /></BrowserRouter>);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/login', {
        email: 'test@example.com',
        password: 'password123',
      }, expect.any(Object));
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });

  test('displays error for invalid credentials', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid credentials' } } });
    render(<BrowserRouter><Login /></BrowserRouter>);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});