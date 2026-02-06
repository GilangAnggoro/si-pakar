import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Services
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login gagal'
      };
    }
  },

  register: async (email, username, password) => {
    try {
      const response = await api.post('/auth/register', { email, username, password });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registrasi gagal'
      };
    }
  },

  forgotPassword: async (username, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/forgot-password', {
        username,
        password: newPassword,
        confirm_password: confirmPassword
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Reset password gagal'
      };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Konsultasi Services
export const konsultasiService = {
  getGejala: async () => {
    try {
      const response = await api.get('/konsultasi/gejala');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: 'Gagal memuat gejala'
      };
    }
  },

  diagnosa: async (data) => {
    try {
      const response = await api.post('/konsultasi/diagnosa', data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Diagnosa gagal'
      };
    }
  },

  getRiwayat: async (id) => {
    try {
      const response = await api.get(`/konsultasi/riwayat/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: null
      };
    }
  },

  getAllRiwayatUser: async (email) => {
    try {
      const response = await api.get(`/konsultasi/riwayat-user/${email}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: []
      };
    }
  },

  // FUNGSI HAPUS RIWAYAT PER ID
  deleteRiwayat: async (id) => {
    try {
      const response = await api.delete(`/konsultasi/riwayat/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal menghapus riwayat'
      };
    }
  },

  // FUNGSI HAPUS SEMUA RIWAYAT USER
  deleteAllRiwayat: async (email) => {
    try {
      const response = await api.delete(`/konsultasi/riwayat-user/${email}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal menghapus semua riwayat'
      };
    }
  }
};

// Mood Tracker Services
export const moodService = {
  saveMood: async (data) => {
    try {
      const response = await api.post('/mood/save', data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: 'Gagal menyimpan mood'
      };
    }
  },

  getMoodHistory: async (email) => {
    try {
      const response = await api.get(`/mood/history/${email}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: []
      };
    }
  }
};

export default api;