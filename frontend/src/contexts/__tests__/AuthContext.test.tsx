import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../services/auth';
import api from '../../services/api';

// Mock services
vi.mock('../../services/auth');
vi.mock('../../services/api', () => ({
  default: {
    interceptors: {
      request: {
        use: vi.fn(() => 1),
        eject: vi.fn(),
      },
      response: {
        use: vi.fn(() => 2),
        eject: vi.fn(),
      },
    },
  },
}));

const mockUser = {
  id: '123',
  username: 'testuser',
  email: 'test@example.com',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide auth context', () => {
    const TestComponent = () => {
      const auth = useAuth();
      return <div>{auth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not authenticated')).toBeInTheDocument();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const TestComponent = () => {
      useAuth();
      return null;
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );

    consoleSpy.mockRestore();
  });

  it('should load user on mount if token exists', async () => {
    (authService.getToken as any).mockReturnValue('test-token');
    (authService.getCurrentUser as any).mockResolvedValue(mockUser);

    const TestComponent = () => {
      const { user, isAuthenticated } = useAuth();
      return (
        <div>
          {isAuthenticated ? `Welcome ${user?.username}` : 'Not authenticated'}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome testuser')).toBeInTheDocument();
    });
  });

  it('should handle login', async () => {
    (authService.login as any).mockResolvedValue({
      access_token: 'new-token',
      token_type: 'bearer',
    });
    (authService.getCurrentUser as any).mockResolvedValue(mockUser);
    (authService.setToken as any).mockImplementation(() => {});

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);

    await act(async () => {
      await result.current.login('testuser', 'password123');
    });

    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });
    expect(authService.setToken).toHaveBeenCalledWith('new-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle logout', () => {
    (authService.logout as any).mockImplementation(() => {});
    
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });

  it('should set up axios interceptors', () => {
    render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );

    expect(api.interceptors.request.use).toHaveBeenCalled();
    expect(api.interceptors.response.use).toHaveBeenCalled();
  });

  it('should handle expired token on mount', async () => {
    (authService.getToken as any).mockReturnValue('expired-token');
    (authService.getCurrentUser as any).mockRejectedValue(new Error('Unauthorized'));
    (authService.logout as any).mockImplementation(() => {});

    const TestComponent = () => {
      const { isLoading, isAuthenticated } = useAuth();
      if (isLoading) return <div>Loading...</div>;
      return <div>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
      expect(authService.logout).toHaveBeenCalled();
    });
  });
});