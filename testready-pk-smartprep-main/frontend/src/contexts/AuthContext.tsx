import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User, RegisterData } from '@/lib/api';

// Update the interface to return Promise<User>
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await apiClient.getMe();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Clear invalid token
            await apiClient.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiClient.login(email, password);
      if (response.success) {
        setUser(response.data.user);
        // Return the user data for the component to use
        return response.data.user;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    try {
      const response = await apiClient.register(data);
      if (response.success) {
        setUser(response.data.user);
        // Return the user data
        return response.data.user;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Always clear local storage first
      localStorage.removeItem('token');
      setUser(null);

      // Then try API logout (fire and forget)
      apiClient.logout().catch(error => {
        console.log('API logout failed, but local logout succeeded:', error.message);
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure user is logged out locally even if there's an error
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};