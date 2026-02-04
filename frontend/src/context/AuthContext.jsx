import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success) {
      setUser(response.user);
    }
    return response;
  };

  const register = async (email, username, password) => {
    const response = await authService.register(email, username, password);
    return response;
  };

  const logout = () => {
    // PERBAIKAN: Data user TIDAK dihapus saat logout
    // Hanya menghapus token authentication
    // Data tetap tersimpan untuk login berikutnya
    
    authService.logout(); // Hapus token auth
    setUser(null);
    
    // NOTE: Data berikut TIDAK dihapus agar user lama bisa langsung ke konsultasi:
    // - dataDiri_${userId}
    // - hasilDiagnosa_${userId}
    // - dataDiri_hasil_${userId}
    // - noDiagnosis_${userId}
    
    // Setelah logout, user akan diarahkan ke Home oleh komponen yang memanggil logout
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};