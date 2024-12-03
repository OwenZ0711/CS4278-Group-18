import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ArtistDetails from './ArtistDetails';

describe('ArtistDetails Component', () => {
  const mockArtistData = {
    name: 'Test Artist',
    image: 'https://via.placeholder.com/150',
    events: [
      { "Event Name": "Test Event 1", Location: "Test Location 1", "Event Date": "2024-01-01" },
      { "Event Name": "Test Event 2", Location: "Test Location 2", "Event Date": "2024-02-02" },
    ],
  };

  beforeEach(() => {
    global.fetch = jest.fn((url) =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockArtistData),
      })
    );
  });

  afterEach(() => {
    global.fetch.mockClear();
  });

  test('renders loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/artist-details/Test%20Artist']}>
        <Routes>
          <Route path="/artist-details/:artistName" element={<ArtistDetails />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('renders artist details correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/artist-details/Test%20Artist']}>
        <Routes>
          <Route path="/artist-details/:artistName" element={<ArtistDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockArtistData.name)).toBeInTheDocument();
      expect(screen.getByAltText(mockArtistData.name)).toBeInTheDocument();
    });

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
  });

  test('renders error message when fetch fails', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    render(
      <MemoryRouter initialEntries={['/artist-details/InvalidArtist']}>
        <Routes>
          <Route path="/artist-details/:artistName" element={<ArtistDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  test('renders no events message if no events are available', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...mockArtistData, events: [] }),
      })
    );

    render(
      <MemoryRouter initialEntries={['/artist-details/Test%20Artist']}>
        <Routes>
          <Route path="/artist-details/:artistName" element={<ArtistDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No upcoming events for this artist/i)).toBeInTheDocument();
    });
  });
});