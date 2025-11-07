import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface User {
  id: number;
  userName: string;
  name: string;
  lastName: string;
  userTypeId: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userName: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Validating token...');
          const isValid = await authService.validateToken();
          console.log('Token valid:', isValid);
          if (isValid) {
            const profile = await authService.getProfile();
            console.log('Profile loaded:', profile);
            setUser(profile);
          } else {
            console.log('Token invalid, removing...');
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
        }
      } else {
        console.log('No token found');
      }
      setIsLoading(false);
      console.log('Auth initialization complete');
    };

    initAuth();
  }, []);

  const login = async (userName: string, password: string, rememberMe: boolean) => {
    const response = await authService.login({ userName, password, rememberMe });
    setUser(response.user);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
