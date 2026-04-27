import axios from 'axios';
import { clearAuthSession, isJwtExpired } from './authSession';

// Frontend talks to `/api`, Next.js rewrites `/api/*` to the Java backend.
// The backend base URL is still controlled by NEXT_PUBLIC_API_URL (same as before),
// so functionality stays consistent while gaining a proxy layer.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Paths relative to axios base `/api` (proxied to `${BACKEND_URL}/...`).
// Override if your backend uses different routes (see .env.example).
const AUTH_LOGIN_PATH = (
  process.env.NEXT_PUBLIC_API_AUTH_LOGIN || 'auth/login'
).replace(/^\//, '');
const AUTH_REGISTER_PATH = (
  process.env.NEXT_PUBLIC_API_AUTH_REGISTER || 'auth/register'
).replace(/^\//, '');

function isAuthLoginOrRegisterRequest(url) {
  if (!url) return false;
  return (
    url.includes(AUTH_LOGIN_PATH) ||
    url.includes('/auth/login') ||
    url.includes(AUTH_REGISTER_PATH) ||
    url.includes('/auth/register')
  );
}

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const url = config.url || '';

  if (isAuthLoginOrRegisterRequest(url)) {
    return config;
  }

  const token = localStorage.getItem('token');

  if (token && token.trim() !== '') {
    if (token.split('.').length !== 3) {
      clearAuthSession({ redirectToLogin: true });
      return Promise.reject(new Error('Invalid token format'));
    }

    if (isJwtExpired(token)) {
      clearAuthSession({ redirectToLogin: true });
      return Promise.reject(new Error('Session expired'));
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const skipSessionRedirect = isAuthLoginOrRegisterRequest(url);

    if (error.response?.status === 401) {
      if (skipSessionRedirect) {
        clearAuthSession({ redirectToLogin: false });
      } else {
        clearAuthSession({ redirectToLogin: true });
      }
    } else if (
      error.response?.data?.message?.includes('Invalid compact JWT') &&
      !skipSessionRedirect
    ) {
      clearAuthSession({ redirectToLogin: true });
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data) => {
    const response = await api.post(AUTH_LOGIN_PATH, data);
    return response.data;
  },

  register: async (data) => {
    const response = await api.post(AUTH_REGISTER_PATH, data);
    return response.data;
  },

  logout: () => {
    clearAuthSession({ redirectToLogin: false });
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // List all users (admin only)
  listUsers: async () => {
    const response = await api.get('/users/list');
    return response.data;
  },

  updateProfile: async (userId, data) => {
    const response = await api.put(`/users/update/${userId}`, data);
    return response.data;
  },

  changePassword: async (userId, data) => {
    const response = await api.put(`/users/changePassword/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/delete/${userId}`);
    return response.data;
  },
};

// Appointment API
export const appointmentAPI = {
  // Get all appointments (for admin)
  getAllAppointments: async () => {
    const response = await api.get('/appointments/list');
    return response.data;
  },

  // Get user's own appointments
  getUserAppointments: async (userEmail) => {
    const response = await api.get(`/appointments/list-for-user?email=${encodeURIComponent(userEmail)}`);
    return response.data;
  },

  // Get all appointments (for admin) or user's appointments
  getAppointments: async () => {
    const response = await api.get('/appointments/list');
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Get appointment by ID
  getAppointmentByReferenceNumber: async (referenceNumber) => {
    const response = await api.get(`/appointments/get-by-referenceNumber/${referenceNumber}`);
    return response.data;
  },

  // Create new appointment
  createAppointment: async (data) => {
    const response = await api.post('/appointments/create', data);
    return response.data;
  },

  // Update appointment
  updateAppointment: async (id, data) => {
    const response = await api.put(`/appointments/update/${id}`, data);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id, data) => {
    const response = await api.put(`/appointments/update/${id}`, data);
    return response.data;
  },

  // Update appointment status (complete, cancel, etc.)
  updateAppointmentStatus: async (id, status) => {
    const response = await api.put(`/appointments/update/${id}`, { bookingStatus: status });
    return response.data;
  },

  // Delete appointment
  deleteAppointment: async (id) => {
    const response = await api.delete(`/appointments/delete/${id}`);
    return response.data;
  },

  // Get available dates and time slots
  getAvailableDates: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/appointments/available?${params.toString()}`);
    return response.data;
  },
};

// Providers API (backend: /v1/providers)
export const providerAPI = {
  listProviders: async () => {
    const response = await api.get('/providers');
    return response.data;
  },

  getProviderById: async (id) => {
    const response = await api.get(`/providers/${id}`);
    return response.data;
  },

  createProvider: async (data) => {
    const response = await api.post('/providers', data);
    return response.data;
  },

  updateProvider: async (id, data) => {
    try {
      const response = await api.put(`/providers/${id}`, data);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const response = await api.put(`/providers/update/${id}`, data);
        return response.data;
      }
      throw err;
    }
  },

  deleteProvider: async (id) => {
    const response = await api.delete(`/providers/${id}`);
    return response.data;
  },
};

export default api;

// Utility function to check token status
export const checkTokenStatus = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Token Status Check:');
  console.log('Token exists:', !!token);
  console.log('User exists:', !!user);
  
  if (token) {
    console.log('Token length:', token.length);
    console.log('Token format:', token.split('.').length === 3 ? 'Valid JWT' : 'Invalid format');
    console.log('Token preview:', token.substring(0, 50) + '...');
  }
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
  }
  
  return { hasToken: !!token, hasUser: !!user, tokenValid: token ? token.split('.').length === 3 : false };
};

// Utility function to clear invalid tokens and redirect
export const clearInvalidToken = () => {
  clearAuthSession({ redirectToLogin: true });
};
