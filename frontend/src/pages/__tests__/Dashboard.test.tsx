import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';

// Mock auth context
const mockUser = {
  id: '123',
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
  }),
}));

describe('Dashboard', () => {
  it('should render dashboard with user information', () => {
    render(<Dashboard />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(`Welcome to your dashboard, ${mockUser.username}!`)).toBeInTheDocument();
    expect(screen.getByText('Your Information')).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(`${mockUser.first_name} ${mockUser.last_name}`)).toBeInTheDocument();
  });

  it('should display formatted member since date', () => {
    render(<Dashboard />);

    // Check that member since label is displayed
    expect(screen.getByText('Member since:')).toBeInTheDocument();
    
    // Check that a formatted date is displayed (01/01/2023)
    expect(screen.getByText('01/01/2023')).toBeInTheDocument();
  });

  it('should handle missing user data gracefully', () => {
    vi.mocked(vi.fn()).mockImplementation(() => ({
      useAuth: () => ({
        user: null,
        isAuthenticated: true,
        isLoading: false,
      }),
    }));

    render(<Dashboard />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    // Should not crash when user is null
  });
});