import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe(token);
        if (response.success) {
          setUser(response.data);
        } else {
          // Token invalid
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const response = await authApi.login(email, password);
    if (response.success) {
      const { user: userData, token: authToken } = response.data;
      localStorage.setItem('authToken', authToken);
      setToken(authToken);
      setUser(userData);
    }
    return response;
  }, []);

  const register = useCallback(async (formData) => {
    return await authApi.register(formData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const response = await authApi.updateProfile(data, token);
    if (response.success) {
      setUser(prev => ({ ...prev, ...response.data }));
    }
    return response;
  }, [token]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
