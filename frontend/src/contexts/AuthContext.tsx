import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authService } from '../services/auth';
import type { UserResponse } from '../services/auth';
import api from '../services/api';

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        // Set the token in axios defaults immediately
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Only clear token if we get a 401 (handled by interceptor)
          // Don't clear on network errors or other issues
          console.error('Failed to get user data:', error);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Set up axios interceptor to include token in requests
  // frontend/src/contexts/AuthContext.tsx
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const refreshToken = authService.getRefreshToken();
            if (refreshToken) {
              const response = await api.post('/users/refresh', {
                refresh_token: refreshToken,
              });

              const { access_token } = response.data;
              authService.setToken(access_token);

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            setUser(null);
            authService.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // frontend/src/contexts/AuthContext.tsx
  useEffect(() => {
    if (!user) return;

    let activityTimer: NodeJS.Timeout;

    const extendSession = async () => {
      try {
        // Call an endpoint to get a new token
        const response = await api.post('/users/extend-session');
        if (response.data.access_token) {
          authService.setToken(response.data.access_token);
        }
      } catch (error) {
        console.error('Failed to extend session:', error);
      }
    };

    const resetActivityTimer = () => {
      clearTimeout(activityTimer);
      // Extend session after 15 minutes of activity
      activityTimer = setTimeout(extendSession, 15 * 60 * 1000);
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      document.addEventListener(event, resetActivityTimer);
    });

    resetActivityTimer();

    return () => {
      clearTimeout(activityTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetActivityTimer);
      });
    };
  }, [user]);

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password });
    authService.setToken(response.access_token);

    // Fetch user data after successful login
    const userData = await authService.getCurrentUser();
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
      authService.logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
