import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { konsultasiService } from '../services/api';
import { CheckCircle, AlertCircle, Loader, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Konsultasi = () => {
  const { user } = useAuth();
  const [gejalaList, setGejalaList] = useState([]);
  const [selectedGejala, setSelectedGejala] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const location = useLocation();

  const skalaKepastian = [
    { value: 'tidak_pernah', label: 'Tidak Pernah' },
    { value: 'jarang', label: 'Jarang' },
    { value: 'sering', label: 'Sering' },
    { value: 'sangat_sering', label: 'Sangat Sering' }
  ];

  useEffect(() => {
    loadGejala();
  }, []);

  const loadGejala = async () => {
    try {
      const response = await konsultasiService.getGejala();
      if (response.success) {
        setGejalaList(response.data);
      }
    } catch (err) {
      setError('Gagal memuat data gejala');
    } finally {
      setLoading(false);
    }
  };

  const handleGejalaChange = (kodeGejala, kepastian) => {
    if (kepastian) {
      setSelectedGejala({
        ...selectedGejala,
        [kodeGejala]: kepastian
      });
    } else {
      const newSelected = { ...selectedGejala };
      delete newSelected[kodeGejala];
      setSelectedGejala(newSelected);
    }
  };

  const handleSubmit = async () => {
    setError('');

    const gejalaArray = Object.entries(selectedGejala).map(([kode, kepastian]) => ({
      kode,
      kepastian
    }));

    if (gejalaArray.length === 0) {
      setError('Pilih minimal 1 gejala!');
      return;
    }

    const dataDiri = JSON.parse(localStorage.getItem(`dataDiri_${user.id}`) || '{}');

    if (!dataDiri.nama) {
      alert('Data diri belum lengkap!');
      navigate('/data-diri', { state: { from: location.pathname } });
      return;
    }

    setSubmitting(true);
    setLoadingProgress(0);

    // Simulasi progress loading untuk UX yang lebih baik
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const payload = {
        nama_user: dataDiri.nama,
        usia: parseInt(dataDiri.umur),
        jenis_kelamin: dataDiri.jenis_kelamin,
        email: user.email,
        gejala: gejalaArray
      };

      console.log('Payload yang dikirim:', payload);

      const response = await konsultasiService.diagnosa(payload);
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // Delay sebelum navigasi untuk efek transisi yang smooth
      setTimeout(() => {
        if (response.success) {
          localStorage.setItem(`hasilDiagnosa_${user.id}`, JSON.stringify(response.data));
          localStorage.setItem(`dataDiri_hasil_${user.id}`, JSON.stringify(dataDiri));
          navigate('/hasil-diagnosa');
        } else if (response.no_diagnosis) {
          localStorage.setItem(`noDiagnosis_${user.id}`, JSON.stringify({
            message: response.message,
            detail: response.detail
          }));
          navigate('/hasil-diagnosa');
        } else {
          setError(response.message || 'Diagnosa gagal');
          setSubmitting(false);
        }
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error:', err);
      setSubmitting(false);
    }
  };

  // Handler untuk tombol kembali yang dinamis
  const handleBack = () => {
    // Cek dari mana user datang berdasarkan state yang dikirim
    const fromPage = location.state?.from;
    
    if (fromPage === '/riwayat-user') {
      // Jika dari riwayat, kembali ke riwayat
      navigate('/riwayat-user');
    } else if (fromPage === '/') {
      // Jika dari home, kembali ke home
      navigate('/');
    } else {
      // Default fallback: kembali ke home
      navigate('/');
    }
  };

  // Filter gejala berdasarkan search term
  const filteredGejala = gejalaList.filter(gejala =>
    gejala.pertanyaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gejala.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredGejala.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGejala = filteredGejala.slice(startIndex, endIndex);

  // Reset ke halaman 1 saat search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const selectedCount = Object.keys(selectedGejala).length;

  return (
    <div className="min-h-screen bg-white py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6">
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progressBar {
          from {
            width: 0%;
          }
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>

      {/* Loading Overlay dengan Progress Bar */}
      {submitting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" style={{ animation: 'fadeInScale 0.3s ease-out' }}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Memproses Diagnosis</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">Mohon tunggu, sistem sedang menganalisis gejala Anda...</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 mb-2 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ 
                    width: `${loadingProgress}%`,
                    animation: 'progressBar 2s ease-out'
                  }}
                ></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">{loadingProgress}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border-l-4 border-blue-600 animate-fadeInScale">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Konsultasi Gejala</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Pilih gejala yang Anda alami beserta tingkat kepastiannya
            </p>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {selectedCount} gejala dipilih
                </span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages} ({filteredGejala.length} gejala)
              </div>
            </div>
          </div>

          {/* Search Bar - Responsive */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari gejala..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-gray-900 px-4 py-2.5 sm:py-3 pl-10 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 flex items-start animate-fadeInUp shadow-md">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm sm:text-base">{error}</span>
            </div>
          )}

          {/* List Gejala - Responsive */}
          {currentGejala.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-base sm:text-lg text-gray-500 mb-2">Tidak ada gejala yang ditemukan</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-sm sm:text-base text-blue-600 hover:text-blue-700 font-semibold"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {currentGejala.map((gejala, index) => (
                <div 
                  key={gejala.kode} 
                  className="border-l-4 border-blue-600 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 bg-white shadow-md animate-fadeInUp" 
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold border border-blue-300">
                          {gejala.kode}
                        </span>
                        <span className="text-xs text-gray-500">
                          No. {startIndex + index + 1}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">
                        {gejala.pertanyaan}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                    {skalaKepastian.map(skala => (
                      <label
                        key={skala.value}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGejala[gejala.kode] === skala.value}
                          onChange={() => handleGejalaChange(gejala.kode, skala.value)}
                          className="w-4 h-4 text-blue-600 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                          {skala.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls - Fully Responsive */}
          {filteredGejala.length > 0 && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white text-sm sm:text-base shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Sebelumnya</span>
              </button>

              {/* Page Numbers - Hidden on mobile, visible on tablet+ */}
              <div className="hidden md:flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                  const showPage = 
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                  
                  const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 3;
                  const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 2;

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageClick(pageNum)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-md hover:shadow-lg'
                          : 'bg-white border border-gray-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Page indicator on mobile */}
              <div className="md:hidden text-sm text-gray-600 font-medium">
                {currentPage} / {totalPages}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm sm:text-base"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          {/* Submit Button - Responsive dengan tombol kembali dinamis */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={submitting}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-sm"
            >
              ← Kembali
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedCount === 0}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 hover:shadow-lg hover:-translate-y-0.5 shadow-md disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Proses Diagnosa →</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Konsultasi;