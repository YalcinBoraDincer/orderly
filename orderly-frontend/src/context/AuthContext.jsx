import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ← YENİ

  useEffect(() => {
    const token    = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    const role     = localStorage.getItem('role');

    if (token && username) {
      setUser({ username, role, token });
    }

    setLoading(false); // ← localStorage okundu, artık karar verilebilir
  }, []);

  const login = (data) => {
    localStorage.setItem('accessToken',  data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('username',     data.username);
    localStorage.setItem('role',         data.role);
    setUser({ username: data.username, role: data.role });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
