import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
if (baseUrl.toLowerCase().endsWith('/api')) {
  // If it ends with /api, keep it as is
} else if (!baseUrl.includes('/api')){
  baseUrl = baseUrl.replace(/\/+$/, '') + '/api';
}

export const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finman_access_token') || localStorage.getItem('finman_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isAuthRequest = url.includes('/v1/auth/login') || url.includes('/v1/auth/register') || url.includes('/v1/auth/google');
      
      if (!isAuthRequest) {
        localStorage.removeItem('finman_access_token');
        localStorage.removeItem('finman_token');
        localStorage.removeItem('finman_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface GoogleAuthPayload {
  idToken: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface AuthResponseData {
  accessToken: string;
  tokenType: string;
  token?: string; // Alias for compatibility
  type?: string;  // Alias for compatibility
  user: {
    id: number;
    email: string;
    fullName: string;
    avatarUrl?: string;
    createdAt?: string;
  };
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponseData> => {
    const response = await api.post<AuthResponseData>('/v1/auth/login', payload);
    return response.data;
  },
  register: async (payload: RegisterPayload): Promise<AuthResponseData> => {
    const response = await api.post<AuthResponseData>('/v1/auth/register', payload);
    return response.data;
  },
  googleAuth: async (payload: GoogleAuthPayload): Promise<AuthResponseData> => {
    const response = await api.post<AuthResponseData>('/v1/auth/google', payload);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/v1/auth/me');
    return response.data;
  }
};

export default api;
