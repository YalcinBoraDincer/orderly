import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Sayfa yenilenince localStorage'dan kullanıcıyı geri yükle
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (token && username) {
      setUser({ username, role, token });
    }
  }, []);

  const login = (data) => {
    // Login başarılı → bilgileri kaydet
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    setUser({ username: data.username, role: data.role });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Kolayca kullanmak için hook
export function useAuth() {
  return useContext(AuthContext);
}
