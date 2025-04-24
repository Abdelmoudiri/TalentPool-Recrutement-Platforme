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

const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await api.post('/auth/refresh');
        const { token } = refreshResponse.data;
        
        setToken(token);
        
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        removeToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('API Error Request:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getCurrentUser: () => api.get('/user'),
};

const jobOffersAPI = {
  getAll: (params) => api.get('/job-offers', { params }),
  getById: (id) => api.get(`/job-offers/${id}`),
  create: (offerData) => api.post('/job-offers', offerData),
  update: (id, offerData) => api.put(`/job-offers/${id}`, offerData),
  delete: (id) => api.delete(`/job-offers/${id}`),
  getStatistics: () => api.get('/job-offers/statistics'),
};

const jobApplicationsAPI = {
  getMyApplications: () => api.get('/applications/my'),
  apply: (jobOfferId, applicationData) => {
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
  
  getJobOfferApplications: (jobOfferId) => {
    if (jobOfferId === null) {
      return api.get('/applications/recent', { params: { limit: 100 } });
    }
    return api.get(`/applications/job/${jobOfferId}`);
  },
  updateStatus: (applicationId, status, notes) => api.put(`/applications/${applicationId}/status`, { status, notes }),
  
  getById: (applicationId) => {
    return api.get(`/applications/${applicationId}`, {
      timeout: 20000,
      params: { direct: true }
    }).catch(error => {
      if (error.response) {
        console.error(`Server error ${error.response.status} for application #${applicationId}:`, error.response.data);
      } else if (error.request) {
        console.error(`No response for application #${applicationId}:`, error.request);
      } else {
        console.error(`Error setting up request for application #${applicationId}:`, error.message);
      }
      throw error;
    });
  },
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