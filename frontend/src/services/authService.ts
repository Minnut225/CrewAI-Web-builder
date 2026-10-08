import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finman_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.data.accessToken) {
      localStorage.setItem('finman_access_token', response.data.accessToken);
      localStorage.setItem('finman_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.data.accessToken) {
      localStorage.setItem('finman_access_token', response.data.accessToken);
      localStorage.setItem('finman_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('finman_access_token');
    localStorage.removeItem('finman_user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('finman_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('finman_access_token');
  },
};
