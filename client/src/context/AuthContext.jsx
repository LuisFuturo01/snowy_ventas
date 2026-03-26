import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('snowy_user');
    const storedToken = localStorage.getItem('snowy_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      // Configurar token en headers de API
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { user, token } = res.data;

      // Guardar info local
      localStorage.setItem('snowy_user', JSON.stringify(user));
      localStorage.setItem('snowy_token', token);

      // Configurar token en headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al conectar',
      };
    }
  };

  const logout = async () => {
    try {
      if (api.defaults.headers.common['Authorization']) {
        await api.post('/api/auth/logout');
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('snowy_user');
      localStorage.removeItem('snowy_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
