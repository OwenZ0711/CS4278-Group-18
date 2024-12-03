import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EventList from './EventList';

describe('EventList Component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  test('renders loading state initially', async () => {
    render(
      <MemoryRouter>
        <EventList />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading events.../i)).toBeInTheDocument();
  });

  test('renders events after fetch', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          "Event Name": "Concert A",
          "Artist Name": "Artist A",
          Location: "Venue A",
          "Event Date": "2024-11-10T00:00:00.000Z",
          Image: "https://via.placeholder.com/150"
        },
      ],
    });

    render(
      <MemoryRouter>
        <EventList />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Concert A/i)).toBeInTheDocument());
    expect(screen.getByText(/Artist: Artist A/i)).toBeInTheDocument();
    expect(screen.getByText(/Location: Venue A/i)).toBeInTheDocument();
  });

  test('handles error state', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));

    render(
      <MemoryRouter>
        <EventList />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument());
  });

  test('filters events based on search input', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          "Event Name": "Concert A",
          "Artist Name": "Artist A",
          Location: "Venue A",
          "Event Date": "2024-11-10T00:00:00.000Z",
          Image: "https://via.placeholder.com/150"
        },
        {
          "Event Name": "Concert B",
          "Artist Name": "Artist B",
          Location: "Venue B",
          "Event Date": "2024-12-10T00:00:00.000Z",
          Image: "https://via.placeholder.com/150"
        },
      ],
    });

    render(
      <MemoryRouter>
        <EventList />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Concert A/i)).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Search Artist/i);
    fireEvent.change(searchInput, { target: { value: 'Artist B' } });

    expect(screen.queryByText(/Concert A/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Concert B/i)).toBeInTheDocument();
  });
});