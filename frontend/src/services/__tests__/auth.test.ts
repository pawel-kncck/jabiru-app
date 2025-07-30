import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth';
import api from '../api';

// Mock the api module
vi.mock('../api');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      (api.post as any).mockResolvedValue({ data: mockUser });

      const result = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/users/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const mockResponse = {
        access_token: 'mock-token',
        token_type: 'bearer',
      };

      (api.post as any).mockResolvedValue({ data: mockResponse });

      const result = await authService.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/users/login', {
        username: 'testuser',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user information', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      (api.get as any).mockResolvedValue({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('token management', () => {
    it('should set and get token', () => {
      authService.setToken('test-token');
      expect(authService.getToken()).toBe('test-token');
      expect(localStorage.getItem('access_token')).toBe('test-token');
    });

    it('should check if user is authenticated', () => {
      expect(authService.isAuthenticated()).toBe(false);
      
      authService.setToken('test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should logout user and clear token', () => {
      authService.setToken('test-token');
      authService.logout();
      
      expect(authService.getToken()).toBeNull();
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});