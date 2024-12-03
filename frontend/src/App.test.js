import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock global fetch for all tests
beforeAll(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('App Component', () => {
  test('renders without crashing', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
    });
    expect(screen.getByText(/iMusic/i)).toBeInTheDocument();
  });

  test('navigates to MyArtist page', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/my-artist']}>
          <App />
        </MemoryRouter>
      );
    });
    expect(screen.getByRole('heading', { name: /My Artist/i })).toBeInTheDocument();
  });
});