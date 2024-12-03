import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyArtist from './MyArtist';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('MyArtist Component', () => {
  const mockNavigate = require('react-router-dom').useNavigate;

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [
        { name: 'Artist 1', image: 'https://via.placeholder.com/150' },
        { name: 'Artist 2', image: 'https://via.placeholder.com/150' },
      ],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    act(() => {
      render(
        <MemoryRouter>
          <MyArtist />
        </MemoryRouter>
      );
    });
    expect(screen.getByText(/loading artists.../i)).toBeInTheDocument();
  });

  it('fetches and displays artists after loading', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MyArtist />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/artist 1/i)).toBeInTheDocument();
      expect(screen.getByText(/artist 2/i)).toBeInTheDocument();
    });
  });

  it('displays an error message on fetch failure', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Failed to fetch'));

    await act(async () => {
      render(
        <MemoryRouter>
          <MyArtist />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('filters artists based on the search term', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MyArtist />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/artist 1/i)).toBeInTheDocument();
      expect(screen.getByText(/artist 2/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search artist/i);
    fireEvent.change(searchInput, { target: { value: 'artist 1' } });

    expect(screen.queryByText(/artist 2/i)).not.toBeInTheDocument();
    expect(screen.getByText(/artist 1/i)).toBeInTheDocument();
  });

  it('clears the search term when the clear button is clicked', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MyArtist />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/artist 1/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search artist/i);
    fireEvent.change(searchInput, { target: { value: 'artist 1' } });

    const clearButton = screen.getByText(/✖/i);
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
    expect(screen.getByText(/artist 2/i)).toBeInTheDocument();
  });
});