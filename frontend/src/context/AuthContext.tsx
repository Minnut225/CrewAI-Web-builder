import React, { createContext, useContext, useState } from 'react';
import { authApi, LoginPayload, RegisterPayload, GoogleAuthPayload, AuthResponseData } from '../services/api';

interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  googleLogin: (payload: GoogleAuthPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('finman_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('finman_access_token') || localStorage.getItem('finman_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthSuccess = (data: AuthResponseData | any) => {
    const jwt = data.accessToken || data.token;
    if (jwt) {
      setToken(jwt);
      localStorage.setItem('finman_access_token', jwt);
      localStorage.setItem('finman_token', jwt);
    }
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('finman_user', JSON.stringify(data.user));
    }
    setError(null);
  };

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login(payload);
      handleAuthSuccess(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.register(payload);
      handleAuthSuccess(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Đăng ký tài khoản thất bại.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (payload: GoogleAuthPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.googleAuth(payload);
      handleAuthSuccess(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Xác thực Google thất bại.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('finman_access_token');
    localStorage.removeItem('finman_token');
    localStorage.removeItem('finman_user');
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        error,
        login,
        register,
        googleLogin,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
