import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((response) => {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const tokenResponse = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', tokenResponse.data.access_token);
    const userResponse = await api.get('/auth/me');
    setUser(userResponse.data);
    localStorage.setItem('user', JSON.stringify(userResponse.data));
    return userResponse.data;
  }

  async function signup(payload) {
    const tokenResponse = await api.post('/auth/signup', payload);
    localStorage.setItem('token', tokenResponse.data.access_token);
    const userResponse = await api.get('/auth/me');
    setUser(userResponse.data);
    localStorage.setItem('user', JSON.stringify(userResponse.data));
    return userResponse.data;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      signup
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
