import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/env';

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore persistent session if valid admin user
    try {
      const savedToken = localStorage.getItem('accessToken');
      const savedUserStr = localStorage.getItem('user');

      if (savedToken && savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);
        if (parsedUser && (parsedUser.role === 'admin' || parsedUser.role === 'super_admin')) {
          setToken(savedToken);
          setUser(parsedUser);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }
    } catch (e) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      
      // If must change password is required (temporary password login)
      if (response.data.mustChangePassword) {
        return {
          mustChangePassword: true,
          redirect: response.data.redirect,
          token: response.data.token,
          message: response.data.message
        };
      }

      // If photo verification is required for daily login
      if (response.data.success && response.data.requiresPhotoVerification) {
        return {
          requiresPhotoVerification: true,
          pendingToken: response.data.pendingToken,
          user: response.data.user
        };
      }

      if (response.data.success && response.data.token) {
        const loggedUser = response.data.user;

        // Role-Based Access Control: allow admin and super_admin
        if (!loggedUser || (loggedUser.role !== 'admin' && loggedUser.role !== 'super_admin')) {
          throw new Error('Access Denied: Only authorized administrators can access this system.');
        }

        setToken(response.data.token);
        setUser(loggedUser);
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        return { success: true, user: loggedUser };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      // Network / connection errors — give user a clear message
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED' || !error.response) {
        const host = window.location.hostname;
        throw new Error(
          `Cannot connect to server at ${host}:5000. ` +
          `Please make sure the backend is running (npm run dev inside /backend).`
        );
      }
      // HTTP errors from the server (401, 403, 500…)
      if (error.response) {
        throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeLoginWithPhoto = async ({ pendingToken, photo }) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-login-photo', { pendingToken, photo });
      if (response.data.success && response.data.token) {
        const loggedUser = response.data.user;
        setToken(response.data.token);
        setUser(loggedUser);
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        return { success: true, user: loggedUser, auditId: response.data.auditId };
      } else {
        throw new Error(response.data.message || 'Login photo verification failed');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Verification failed');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    completeLoginWithPhoto,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};