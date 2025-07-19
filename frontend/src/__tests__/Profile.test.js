import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../../components/Login';

jest.mock('axios');

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const setup = () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    return {
      emailInput: screen.getByPlaceholderText(/email/i),
      passwordInput: screen.getByPlaceholderText(/password/i),
      nameInput: screen.getByPlaceholderText(/name/i),
      signupTab: screen.getByRole('button', { name: /sign up/i }),
      submitButton: screen.getByRole('button', { name: /create account/i }),
    };
  };

  test('allows user to create an account successfully', async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: 'mock-token', user: { id: 1, email: 'new@example.com', name: 'New User' } },
    });

    const { emailInput, passwordInput, nameInput, signupTab, submitButton } = setup();

    fireEvent.click(signupTab);
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/users',
        {
          email: 'new@example.com',
          password: 'Password123!',
          name: 'New User',
        },
        expect.any(Object)
      );
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(screen.getByText(/account created/i)).toBeInTheDocument();
    });
  });

  test('displays error for invalid email format', async () => {
    const { emailInput, passwordInput, nameInput, signupTab, submitButton } = setup();

    fireEvent.click(signupTab);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  test('displays error for weak password', async () => {
    const { emailInput, passwordInput, nameInput, signupTab, submitButton } = setup();

    fireEvent.click(signupTab);
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  test('displays error for empty name field', async () => {
    const { emailInput, passwordInput, nameInput, signupTab, submitButton } = setup();

    fireEvent.click(signupTab);
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  test('displays error for email already exists', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Email already exists' } },
    });

    const { emailInput, passwordInput, nameInput, signupTab, submitButton } = setup();

    fireEvent.click(signupTab);
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  test('handles server error gracefully', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Internal server error' } },
    });

    const { emailInput, passwordInput, nameInput, signupTab, submitButton } = setup();

    fireEvent.click(signupTab);
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
    });
  });

  test('handles network error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    const { emailInput, passwordInput, nameInput, signupTab, submitButton } = setup();

    fireEvent.click(signupTab);
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});