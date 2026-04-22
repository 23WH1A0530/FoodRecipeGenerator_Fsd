import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rvp_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => { localStorage.removeItem('rvp_token'); delete axios.defaults.headers.common['Authorization']; })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('rvp_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  const register = async (form) => {
    const { data } = await axios.post('/api/auth/register', form);
    localStorage.setItem('rvp_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('rvp_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await axios.get('/api/auth/me');
    setUser(data.user);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </Ctx.Provider>
  );
}
