import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DataDiri = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    umur: '',
    jenis_kelamin: ''
  });
  const [error, setError] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`dataDiri_${user.id}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.userId === user.id) {
            setFormData(parsedData);
            setIsUpdate(true);
          }
        } catch (error) {
          console.error('Error parsing saved data:', error);
        }
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nama || !formData.umur || !formData.jenis_kelamin) {
      setError('Semua field harus diisi!');
      return;
    }

    if (formData.umur < 10 || formData.umur > 100) {
      setError('Umur tidak valid!');
      return;
    }

    const dataToSave = {
      ...formData,
      userId: user.id,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem(`dataDiri_${user.id}`, JSON.stringify(dataToSave));
    
    // Teruskan state 'from' yang diterima dari halaman sebelumnya ke konsultasi
    const fromPage = location.state?.from;
    navigate('/konsultasi', { state: { from: fromPage || '/' } });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-blue-600">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-50 rounded-xl mb-4">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {isUpdate ? 'Data Diri' : 'Data Diri'}
            </h2>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              {isUpdate ? 'Perbarui informasi data diri Anda' : 'Lengkapi data diri Anda sebelum konsultasi'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fadeInUp">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama */}
            <div className="animate-fadeInUp">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Umur */}
              <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Umur
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
                  <input
                    type="number"
                    name="umur"
                    value={formData.umur}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Umur"
                    min="10"
                    max="100"
                    required
                  />
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Jenis Kelamin
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none z-10" />
                  <select
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all outline-none bg-white cursor-pointer"
                    required
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 transform shadow-md hover:shadow-lg animate-fadeInUp"
              style={{ animationDelay: '300ms' }}
            >
              {isUpdate ? 'Update & Lanjut Konsultasi →' : 'Konsultasi Sekarang →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DataDiri;