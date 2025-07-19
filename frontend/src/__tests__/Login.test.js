import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from '../../components/Login';

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

describe('Login Component', () => {
  let mockNavigate;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    cleanup();
  });

  test('renders login form without crashing', () => {
    renderWithRouter(<Login />);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  test('allows user to login with valid credentials', async () => {
    axios.post.mockResolvedValueOnce({ 
      data: { 
        token: 'mock-token', 
        user: { id: 1, email: 'test@example.com' } 
      } 
    });

    renderWithRouter(<Login />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/login',
        {
          email: 'test@example.com',
          password: 'password123',
        },
        expect.any(Object)
      );
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('displays error for invalid credentials', async () => {
    axios.post.mockRejectedValueOnce({ 
      response: { 
        data: { error: 'Invalid credentials' },
        status: 401 
      } 
    });

    renderWithRouter(<Login />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
    });
  });

  test('displays validation error for empty fields', async () => {
    renderWithRouter(<Login />);
    
    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent(/email is required/i);
      expect(screen.getByTestId('password-error')).toHaveTextContent(/password is required/i);
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  test('displays loading state during login attempt', async () => {
    axios.post.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    expect(loginButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });
  });

  test('handles network error gracefully', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(/network error/i);
    });
  });

  test('persists token in localStorage after successful login', async () => {
    axios.post.mockResolvedValueOnce({ 
      data: { 
        token: 'mock-token', 
        user: { id: 1, email: 'test@example.com' } 
      } 
    });

    renderWithRouter(<Login />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify({ id: 1, email: 'test@example.com' }));
    });
  });
});