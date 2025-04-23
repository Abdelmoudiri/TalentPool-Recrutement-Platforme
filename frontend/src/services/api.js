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
    
    // Add better error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
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
  apply: (jobOfferId, applicationData) => {
    // Use FormData if we have files to upload
    if (applicationData.cv) {
      const formData = new FormData();
      formData.append('cv', applicationData.cv);
      if (applicationData.cover_letter) {
        formData.append('cover_letter', applicationData.cover_letter);
      }
      return api.post(`/applications/job/${jobOfferId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.post(`/applications/job/${jobOfferId}`, applicationData);
  },
  withdraw: (applicationId) => api.delete(`/applications/${applicationId}`),
  
  // Recruiter routes
  getJobOfferApplications: (jobOfferId) => api.get(`/applications/job/${jobOfferId}`),
  updateStatus: (applicationId, status, notes) => api.put(`/applications/${applicationId}/status`, { status, notes }),
  
  // Common routes
  getById: (applicationId) => api.get(`/applications/${applicationId}`),
  getStatistics: () => api.get('/applications/statistics'),
  getRecentApplications: (limit = 5) => api.get('/applications/recent', { params: { limit } }),
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