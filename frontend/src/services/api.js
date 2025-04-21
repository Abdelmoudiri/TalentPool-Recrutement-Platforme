import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' 
  },
  withCredentials: true 
});

// Token management functions
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

// Get user info from token
const getUserFromToken = () => {
  try {
    const token = getToken();
    if (!token) return null;
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Request interceptor - add auth header if token exists
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh and common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshResponse = await api.post('/auth/refresh');
        const { token } = refreshResponse.data;
        
        // Update stored token
        setToken(token);
        
        // Retry the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        removeToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API Methods for Auth
const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getCurrentUser: () => api.get('/user'),
};

// API Methods for Job Offers
const jobOffersAPI = {
  getAll: (params) => api.get('/job-offers', { params }),
  getById: (id) => api.get(`/job-offers/${id}`),
  create: (offerData) => api.post('/job-offers', offerData),
  update: (id, offerData) => api.put(`/job-offers/${id}`, offerData),
  delete: (id) => api.delete(`/job-offers/${id}`),
  getStatistics: () => api.get('/job-offers/statistics'),
};

// API Methods for Job Applications
const jobApplicationsAPI = {
  // Candidate routes
  getMyApplications: () => api.get('/applications/my'),
  apply: (jobOfferId, applicationData) => api.post(`/applications/job/${jobOfferId}`, applicationData),
  withdraw: (applicationId) => api.delete(`/applications/${applicationId}`),
  
  // Recruiter routes
  getJobOfferApplications: (jobOfferId) => api.get(`/applications/job/${jobOfferId}`),
  updateStatus: (applicationId, status) => api.put(`/applications/${applicationId}/status`, { status }),
  
  // Common routes
  getById: (applicationId) => api.get(`/applications/${applicationId}`),
  getStatistics: () => api.get('/applications/statistics'),
};

export {
  api,
  getToken,
  setToken,
  removeToken,
  isTokenExpired,
  getUserFromToken,
  authAPI,
  jobOffersAPI,
  jobApplicationsAPI
};