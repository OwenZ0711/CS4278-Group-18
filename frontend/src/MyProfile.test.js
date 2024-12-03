import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyProfile from './MyProfile';

afterEach(() => {
  cleanup();
});

describe('MyProfile Component', () => {
  test('renders profile data', async () => {
    // Mock the fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            username: 'testuser',
            email: 'testuser@example.com',
          }),
        ok: true,
      })
    );

    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/testuser/i)).toBeInTheDocument());
    expect(screen.getByText(/testuser@example.com/i)).toBeInTheDocument();

    global.fetch.mockClear();
  });

  test('handles logout button click', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
      })
    );

    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );

    const logoutButton = screen.getByRole('button', { name: /log out/i });
    fireEvent.click(logoutButton);

    await waitFor(() => expect(consoleLogSpy).toHaveBeenCalledWith('User logged out'));

    consoleLogSpy.mockRestore();
    global.fetch.mockClear();
  });

  test('handles change password button click', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );

    const changePasswordButton = screen.getByRole('button', {
      name: /change password/i,
    });
    fireEvent.click(changePasswordButton);

    await waitFor(() =>
      expect(consoleLogSpy).toHaveBeenCalledWith('Redirecting to change password page')
    );

    consoleLogSpy.mockRestore();
  });
});