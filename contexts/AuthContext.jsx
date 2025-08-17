'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, userAPI } from '../lib/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Verify token is still valid
          const response = await userAPI.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      console.log(response);
      if (response.success && response.data) {
        const { token, userData } = response.data;
        localStorage.setItem('token', token);
        
        if (userData) {
          // Use the userData from the login response
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          return { success: true };
        } else {
          // Fallback: create limited user data if userData is not in response
          const limitedUserData = { email, name: email.split('@')[0] };
          localStorage.setItem('user', JSON.stringify(limitedUserData));
          setUser(limitedUserData);
          return { success: true };
        }
      }
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'An error occurred during login'
      };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await authAPI.register({ fullName, email, password, confirmPassword: password });
      if (response.success && response.data) {
        const { token, userData } = response.data;
        localStorage.setItem('token', token);
        
        if (userData) {
          // Use the userData from the registration response
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          return { success: true };
        } else {
          // Fallback: create limited user data if userData is not in response
          const limitedUserData = { email, name: fullName };
          localStorage.setItem('user', JSON.stringify(limitedUserData));
          setUser(limitedUserData);
          return { success: true };
        }
      }
      return { success: false, error: response.message || 'Registration failed' };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'An error occurred during registration'
      };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const isAdmin = user?.role === 'ADMIN';

  // Debug function to check user data structure
  const debugUserData = () => {
    console.log('🔍 AuthContext Debug Info:');
    console.log('Current user state:', user);
    console.log('User from localStorage:', localStorage.getItem('user'));
    if (user) {
      console.log('User fields:', Object.keys(user));
      console.log('User.name:', user.name);
      console.log('User.fullName:', user.fullName);
      console.log('User.email:', user.email);
      console.log('User.role:', user.role);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    debugUserData, // Add debug function to context
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
