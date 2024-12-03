import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Register from './Register';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.requireMock('react-router-dom').useNavigate;

describe('Register Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the form correctly', () => {
    render(
      <Router>
        <Register />
      </Router>
    );

    expect(screen.getByText(/Register for iMusic/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next Step/i })).toBeInTheDocument();
  });

  test('shows an error message when registration fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid email address' }),
    });

    render(
      <Router>
        <Register />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText(/Email Address/i);
    const submitButton = screen.getByRole('button', { name: /Next Step/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Error: Invalid email address')
    );
  });

  test('handles server error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to connect'));

    render(
      <Router>
        <Register />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText(/Email Address/i);
    const submitButton = screen.getByRole('button', { name: /Next Step/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('There was an error connecting to the server.')
    );
  });
});