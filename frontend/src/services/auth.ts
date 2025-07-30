import api from './api';

// Types for authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

// Authentication service functions
export const authService = {
  // Register a new user
  async register(data: RegisterRequest): Promise<UserResponse> {
    const response = await api.post<UserResponse>('/users/register', data);
    return response.data;
  },

  // Login user and get JWT token
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/users/login', data);
    return response.data;
  },

  // Get current user information
  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/users/me');
    return response.data;
  },

  // Logout user (clear token)
  logout(): void {
    localStorage.removeItem('access_token');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  // Store token after successful login
  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
};