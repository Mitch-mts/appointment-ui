import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8079/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  console.log(`🔑 Token check for ${config.url}:`, token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
  
  if (token && token.trim() !== '') {
    // Validate token format (should have 2 periods)
    if (token.split('.').length !== 3) {
      console.error('❌ Invalid JWT format:', token);
      console.error('Expected 3 parts separated by 2 periods, found:', token.split('.').length);
      // Remove invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't add invalid token to headers
      return config;
    }
    
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Token added to request headers');
  } else {
    console.warn('⚠️ No token found in localStorage');
  }
  
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🚨 API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - clearing tokens and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.data?.message?.includes('Invalid compact JWT')) {
      console.error('❌ JWT Format Error detected - clearing invalid token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/me');
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
  console.log('🧹 Clearing invalid token and redirecting to login...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Only redirect if we're in a browser environment
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};
