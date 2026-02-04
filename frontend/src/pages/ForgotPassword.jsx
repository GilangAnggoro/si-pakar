import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/api';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    username: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Password tidak cocok!');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password minimal 6 karakter!');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(
        formData.username, 
        formData.newPassword, 
        formData.confirmPassword
      );
      
      if (response.success) {
        alert('Password berhasil diubah! Silakan login.');
        navigate('/login');
      } else {
        setError(response.message || 'Reset password gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 animate-fadeInScale border-l-4 border-blue-600">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-blue-50 rounded-xl mb-4">
            <Lock className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Lupa Password</h2>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Reset password akun Anda</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fadeInUp">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="animate-fadeInUp">
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm"
                placeholder="username"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-all"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 transform shadow-md hover:shadow-lg animate-fadeInUp text-sm"
            style={{ animationDelay: '300ms' }}
          >
            {loading ? 'Memproses...' : 'Reset Password'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline text-sm">
            ← Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;