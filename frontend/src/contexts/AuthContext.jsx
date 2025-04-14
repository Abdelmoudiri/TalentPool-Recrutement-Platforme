import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setToken, removeToken, getUserFromToken } from '../services/api';

// Default context values
const defaultContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
};

// Create the Auth Context
const AuthContext = createContext(defaultContextValue);

/**
 * Hook for components to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Auth Provider Component
 * Wraps the application and provides authentication state and methods
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is already logged in on mount
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const userFromToken = getUserFromToken();
        
        if (userFromToken) {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        }
      } catch (err) {
        console.error('Authentication failed:', err);
        removeToken();
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthStatus();
  }, []);
  
  // Login function
  async function login(credentials) {
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  }
  
  // Register function
  async function register(userData) {
    setError(null);
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  }
  
  // Logout function
  async function logout() {
    try {
      if (user) {
        await authAPI.logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      removeToken();
      setUser(null);
    }
  }
  
  // Forgot password function
  async function forgotPassword(email) {
    setError(null);
    try {
      await authAPI.forgotPassword(email);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset request failed');
      throw err;
    }
  }
  
  // Reset password function
  async function resetPassword(data) {
    setError(null);
    try {
      await authAPI.resetPassword(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      throw err;
    }
  }
  
  // Calculate authenticated state
  const isAuthenticated = !!user;
  
  // Build context value
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };
  
  // Return the provider with context value
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;