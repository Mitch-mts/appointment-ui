'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI, userAPI } from '../lib/api';
import {
  clearAuthSession,
  isJwtExpired,
  isAuthOptionalPath,
  setRedirectToLoginHandler,
} from '../lib/authSession';
import {
  hasCachedSession,
  normalizeUserFromApi,
  readCachedSessionUser,
} from '../lib/sessionUser';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session from localStorage before paint (SSR leaves user null on first render).
  useLayoutEffect(() => {
    const cached = readCachedSessionUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }
  }, []);

  const enforceFreshTokenOrLogout = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || !isJwtExpired(token)) return;
    const path = typeof window !== 'undefined' ? window.location.pathname : pathname || '/';
    const hardRedirect = !isAuthOptionalPath(path);
    clearAuthSession({ redirectToLogin: hardRedirect });
    if (!hardRedirect) {
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    setRedirectToLoginHandler(() => {
      router.push('/login');
    });
    return () => setRedirectToLoginHandler(null);
  }, [router]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const path = typeof window !== 'undefined' ? window.location.pathname : '/';

      if (token && isJwtExpired(token)) {
        clearAuthSession({ redirectToLogin: !isAuthOptionalPath(path) });
        setUser(null);
        setLoading(false);
        return;
      }

      const cached = readCachedSessionUser();
      if (cached) {
        setUser(cached);
      } else if (token && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed?.email) setUser(parsed);
        } catch {
          clearAuthSession({ redirectToLogin: false });
          setUser(null);
        }
      }

      setLoading(false);

      if (!token || !savedUser) return;

      try {
        const freshUser = await userAPI.getProfileUser();
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      } catch (error) {
        if (error.response?.status === 401) {
          clearAuthSession({ redirectToLogin: !isAuthOptionalPath(path) });
          setUser(null);
        }
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    const id = setInterval(enforceFreshTokenOrLogout, 60_000);
    return () => clearInterval(id);
  }, [user, enforceFreshTokenOrLogout]);

  useEffect(() => {
    if (!user) return undefined;
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        enforceFreshTokenOrLogout();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user, enforceFreshTokenOrLogout]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
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
      const status = error.response?.status;
      if (status === 404) {
        return {
          success: false,
          error:
            error.response?.data?.message ||
            'Login service not found (404). Set NEXT_PUBLIC_API_AUTH_LOGIN to your backend path (e.g. auth/login) and ensure NEXT_PUBLIC_API_URL/BACKEND_URL matches the API.',
        };
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'An error occurred during login',
      };
    }
  };

  const register = async (fullName, email, password, confirmPassword) => {
    try {
      const response = await authAPI.register({
        fullName,
        email,
        password,
        confirmPassword: confirmPassword ?? password,
      });
      if (response.success && response.data) {
        // Register returns the same envelope as login: { token, expiresIn, userData }
        const payload = response.data;
        const token = payload.token;
        const userData = payload.userData ?? payload;

        if (token && token.trim() !== '') {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }

        if (userData && typeof userData === 'object' && userData.email) {
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          return { success: true };
        }

        const limitedUserData = { email, fullName, name: fullName };
        localStorage.setItem('user', JSON.stringify(limitedUserData));
        setUser(limitedUserData);
        return { success: true };
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
