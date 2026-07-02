import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useState } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const mockUser = {
  id: 1,
  username: 'emilys',
  firstName: 'Emily',
  lastName: 'Johnson',
  email: 'emily@example.com',
  image: 'https://example.com/avatar.jpg',
};

const mockUsersResponse = {
  users: [
    {
      id: 1,
      username: 'emilys',
      firstName: 'Emily',
      lastName: 'Johnson',
      email: 'emily@example.com',
      image: 'https://example.com/avatar.jpg',
    },
    {
      id: 2,
      username: 'johnd',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      image: 'https://example.com/john.jpg',
    },
  ],
};

function getTestComponentWithUsername(testUsername) {
  return function TestComponent() {
    const { user, login, logout } = useAuth();
    const [error, setError] = useState(null);

    async function handleLogin() {
      try {
        setError(null);
        await login(testUsername);
      } catch (e) {
        setError(e.message);
      }
    }

    return (
      <div>
        <span data-testid="user-state">{user ? 'logged-in' : 'logged-out'}</span>
        {user && <span data-testid="user-name">{user.firstName}</span>}
        {error && <span data-testid="error-msg">{error}</span>}
        <button data-testid="login-btn" onClick={handleLogin}>
          Login
        </button>
        <button data-testid="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    );
  };
}

function renderWithAuth(username = 'emilys') {
  const TestComponent = getTestComponentWithUsername(username);
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts logged out', () => {
    renderWithAuth();
    expect(screen.getByTestId('user-state').textContent).toBe('logged-out');
  });

  it('handles login success and stores user in state and localStorage', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsersResponse),
    });

    renderWithAuth();

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toBe('logged-in');
      expect(screen.getByTestId('user-name').textContent).toBe('Emily');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'dotaburgers-user',
      expect.any(String)
    );

    const stored = JSON.parse(localStorage.setItem.mock.calls[0][1]);
    expect(stored.username).toBe('emilys');
    expect(stored.accessToken).toBeUndefined();
    expect(stored.id).toBe(1);
  });

  it('handles login failure when username is not found', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsersResponse),
    });

    // Use a non-existent username
    const TestComponent = getTestComponentWithUsername('nonexistent');
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toBe('logged-out');
      expect(screen.getByTestId('error-msg').textContent).toBe('Usuario no encontrado');
    });
  });

  it('handles login failure with network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithAuth();

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toBe('logged-out');
      expect(screen.getByTestId('error-msg').textContent).toBe('Error de conexión');
    });
  });

  it('handles login failure with server error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    renderWithAuth();

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toBe('logged-out');
      expect(screen.getByTestId('error-msg').textContent).toBe('Error de conexión');
    });
  });

  it('handles logout and clears localStorage', async () => {
    // Set up logged-in state via localStorage
    localStorage.setItem('dotaburgers-user', JSON.stringify(mockUser));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toBe('logged-in');
    });

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(screen.getByTestId('user-state').textContent).toBe('logged-out');
    expect(localStorage.removeItem).toHaveBeenCalledWith('dotaburgers-user');
  });

  it('restores session from localStorage on mount', async () => {
    localStorage.setItem('dotaburgers-user', JSON.stringify(mockUser));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('user-state').textContent).toBe('logged-in');
      expect(screen.getByTestId('user-name').textContent).toBe('Emily');
    });
  });

  it('throws useAuth when used outside provider', () => {
    function BadComponent() {
      useAuth();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow(
      'useAuth must be used within AuthProvider'
    );
  });
});
