import axios from 'axios';
import type { AxiosInstance } from 'axios';

// API base URL from environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// Type for API error responses
export interface ApiError {
  detail: string;
}

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.detail || error.message || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};
