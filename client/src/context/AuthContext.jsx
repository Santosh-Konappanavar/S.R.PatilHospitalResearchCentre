import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('srp_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('srp_token');
    if (token) {
      api.get('/auth/me').then(res => { setUser(res.data.user); setLoading(false); })
        .catch(() => { localStorage.clear(); setUser(null); setLoading(false); });
    } else { setLoading(false); }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('srp_token', res.data.token);
    localStorage.setItem('srp_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('srp_token');
    localStorage.removeItem('srp_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'chairman';
  const isChairman = user?.role === 'chairman';
  const isDept = user?.role === 'department';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isChairman, isDept }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);