import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Trash2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const AccountSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State untuk ganti password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  // State untuk hapus akun
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Handler ganti password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validasi
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter!');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Password baru dan konfirmasi tidak cocok!');
      return;
    }

    setLoadingPassword(true);

    try {
      // Ambil data users dari localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);

      if (userIndex === -1) {
        setPasswordError('User tidak ditemukan!');
        return;
      }

      // Verifikasi password lama
      if (users[userIndex].password !== passwordData.currentPassword) {
        setPasswordError('Password lama tidak sesuai!');
        return;
      }

      // Update password
      users[userIndex].password = passwordData.newPassword;
      localStorage.setItem('users', JSON.stringify(users));

      // Update currentUser di localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.id === user.id) {
        currentUser.password = passwordData.newPassword;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      setPasswordSuccess('Password berhasil diubah!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setPasswordSuccess('');
      }, 3000);
    } catch (error) {
      setPasswordError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoadingPassword(false);
    }
  };

  // Handler hapus akun
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.username) {
      alert('Username tidak cocok!');
      return;
    }

    if (!window.confirm('PERINGATAN: Semua data Anda akan dihapus permanen. Apakah Anda yakin?')) {
      return;
    }

    setLoadingDelete(true);

    try {
      // Hapus user dari localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const filteredUsers = users.filter(u => u.id !== user.id);
      localStorage.setItem('users', JSON.stringify(filteredUsers));

      // Hapus data diri user
      localStorage.removeItem(`dataDiri_${user.id}`);

      // Hapus riwayat konsultasi user
      const riwayat = JSON.parse(localStorage.getItem('riwayatKonsultasi') || '[]');
      const filteredRiwayat = riwayat.filter(r => r.userId !== user.id);
      localStorage.setItem('riwayatKonsultasi', JSON.stringify(filteredRiwayat));

      // Logout
      logout();
      navigate('/');
      alert('Akun Anda telah dihapus.');
    } catch (error) {
      alert('Terjadi kesalahan saat menghapus akun.');
    } finally {
      setLoadingDelete(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 px-3 sm:px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 animate-fadeInUp">
          <div className="inline-block p-3 sm:p-4 bg-blue-50 rounded-xl mb-3 sm:mb-4">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
            Pengaturan Akun
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola akun Anda</p>
        </div>

        {/* Info Akun */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 mb-5 sm:mb-6 border-l-4 border-blue-600 animate-fadeInUp">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Informasi Akun</span>
          </h2>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-blue-50 rounded-lg gap-1 sm:gap-0">
              <span className="text-gray-600 font-semibold text-sm">Username:</span>
              <span className="text-gray-800 font-bold text-sm break-all">{user.username}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-blue-50 rounded-lg gap-1 sm:gap-0">
              <span className="text-gray-600 font-semibold text-sm">Email:</span>
              <span className="text-gray-800 font-bold text-sm break-all">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Ganti Password */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 mb-5 sm:mb-6 border-l-4 border-blue-600 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>Ganti Password</span>
          </h2>

          {passwordError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-3 sm:mb-4 flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="break-words">{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-3 sm:mb-4 flex items-start gap-2 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="break-words">{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 sm:space-y-4">
            {/* Password Lama */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Password Lama
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-all"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Password Baru */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-all"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-all"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingPassword}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 transform shadow-md hover:shadow-lg text-sm"
            >
              {loadingPassword ? 'Memproses...' : 'Ubah Password'}
            </button>
          </form>
        </div>

        {/* Hapus Akun */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 border-l-4 border-red-500 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg sm:text-xl font-bold text-red-700 mb-3 sm:mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            <span>Zona Bahaya</span>
          </h2>
          <p className="text-gray-700 mb-3 sm:mb-4 text-sm leading-relaxed">
            Setelah Anda menghapus akun, semua data Anda termasuk riwayat konsultasi akan dihapus secara permanen.
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 sm:px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transform shadow-md hover:shadow-lg text-sm w-full sm:w-auto justify-center"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Hapus Akun</span>
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Akun */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-8 max-w-md w-full animate-fadeInScale mx-4">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-block p-3 sm:p-4 bg-red-50 rounded-xl mb-3 sm:mb-4">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Hapus Akun?</h3>
              <p className="text-gray-600 text-sm">
                Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus permanen.
              </p>
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Ketik username Anda <span className="text-red-600 break-all">({user.username})</span> untuk konfirmasi:
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none text-sm"
                placeholder="Ketik username Anda"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
                disabled={loadingDelete}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 text-sm order-2 sm:order-1"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loadingDelete || deleteConfirm !== user.username}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm order-1 sm:order-2 hover:-translate-y-0.5 active:translate-y-0 transform shadow-md hover:shadow-lg"
              >
                {loadingDelete ? 'Menghapus...' : 'Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;