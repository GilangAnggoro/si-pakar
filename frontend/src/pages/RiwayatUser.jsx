import { useState, useEffect } from 'react';
import { Clock, FileText, Trash2, User, Loader, Eye, Download, X, ChevronDown, ChevronUp, Menu, RefreshCw } from 'lucide-react';
import { konsultasiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

const RiwayatUser = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [dataDiri, setDataDiri] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showAlternatif, setShowAlternatif] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadRiwayat();
    loadDataDiri();
  }, []);

  const loadDataDiri = () => {
    const dataDiriData = localStorage.getItem(`dataDiri_${user.id}`);
    if (dataDiriData) {
      try {
        setDataDiri(JSON.parse(dataDiriData));
      } catch (error) {
        console.error('Error parsing data diri:', error);
      }
    }
  };

  const loadRiwayat = async () => {
    if (!user?.email) return;

    try {
      const response = await konsultasiService.getAllRiwayatUser(user.email);
      if (response.success) {
        const deletedIds = JSON.parse(localStorage.getItem(`deletedRiwayat_${user.id}`) || '[]');
        let filteredData = response.data.filter(item => !deletedIds.includes(item.id));
        
        filteredData = filteredData.map(item => {
          if (item.alternatif_diagnosis && item.alternatif_diagnosis.length > 0) {
            return item;
          }
          
          const hasilKey = `hasilDiagnosa_${user.id}`;
          const hasilData = localStorage.getItem(hasilKey);
          
          if (hasilData) {
            try {
              const hasil = JSON.parse(hasilData);
              if (hasil.hasil_diagnosis?.nama_penyakit === item.penyakit?.nama_penyakit) {
                return {
                  ...item,
                  alternatif_diagnosis: hasil.alternatif_diagnosis || []
                };
              }
            } catch (e) {
              console.error('Error parsing localStorage hasil:', e);
            }
          }
          
          return item;
        });
        
        setRiwayat(filteredData);
      }
    } catch (err) {
      console.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus riwayat ini dari tampilan?')) return;

    setDeleting(id);
    
    try {
      const deletedIds = JSON.parse(localStorage.getItem(`deletedRiwayat_${user.id}`) || '[]');
      deletedIds.push(id);
      localStorage.setItem(`deletedRiwayat_${user.id}`, JSON.stringify(deletedIds));
      
      setRiwayat(riwayat.filter(item => item.id !== id));
      alert('Riwayat berhasil dihapus dari tampilan!');
    } catch (error) {
      alert('Terjadi kesalahan');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Yakin ingin menghapus SEMUA riwayat dari tampilan?\n\nData tetap tersimpan di database.')) return;

    setLoading(true);
    try {
      const allIds = riwayat.map(item => item.id);
      localStorage.setItem(`deletedRiwayat_${user.id}`, JSON.stringify(allIds));
      
      setRiwayat([]);
      alert('Semua riwayat berhasil dihapus dari tampilan!');
    } catch (error) {
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (item) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header with blue background
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('HASIL DIAGNOSIS', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistem Pakar Gangguan Kecemasan', pageWidth / 2, 25, { align: 'center' });
      doc.text('Metode Forward Chaining & Certainty Factor', pageWidth / 2, 32, { align: 'center' });
      
      // Data Pasien
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Data Diri Pasien', 14, 50);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nama: ${dataDiri?.nama || 'N/A'}`, 14, 60);
      doc.text(`Umur: ${dataDiri?.umur || 'N/A'} tahun`, 14, 67);
      doc.text(`Jenis Kelamin: ${dataDiri?.jenis_kelamin || 'N/A'}`, 14, 74);
      doc.text(`Tanggal: ${new Date(item.tanggal_konsultasi).toLocaleDateString('id-ID')}`, 14, 81);
      
      // Hasil Diagnosis
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Hasil Diagnosis', 14, 96);
      
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(14, 101, pageWidth - 28, 25, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Penyakit: ${item.penyakit?.nama_penyakit || 'N/A'}`, 18, 111);
      doc.text(`Tingkat Kepastian (CF): ${(item.nilai_cf * 100).toFixed(1)}%`, 18, 121);
      
      let currentY = 136;
      
      // Penyakit Lain yang Menyertai
      const alternatifDiagnosis = parseAlternatifDiagnosis(item.alternatif_diagnosis);
      
      if (alternatifDiagnosis.length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Penyakit Lain yang Menyertai', 14, currentY);
        currentY += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        alternatifDiagnosis.forEach((alt, index) => {
          if (currentY > pageHeight - 40) {
            doc.addPage();
            currentY = 20;
          }
          
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${alt.nama_penyakit}`, 18, currentY);
          currentY += 5;
          
          doc.setFont('helvetica', 'normal');
          let percentage = 0;
          if (alt.persentase !== undefined) {
            percentage = parseFloat(alt.persentase);
          } else if (alt.nilai_cf !== undefined) {
            percentage = parseFloat(alt.nilai_cf) * 100;
          }
          doc.text(`   Nilai CF: ${percentage.toFixed(1)}%`, 18, currentY);
          currentY += 7;
        });
        currentY += 5;
      }
      
      // Solusi Penanganan
      if (currentY > pageHeight - 80) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Solusi Penanganan', 14, currentY);
      currentY += 8;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const solusiText = doc.splitTextToSize(item.penyakit?.solusi || 'Tidak ada solusi yang tersedia', pageWidth - 28);
      doc.text(solusiText, 14, currentY);
      
      // Footer
      const finalY = doc.internal.pageSize.height - 30;
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text('Dokumen ini digenerate otomatis oleh Sistem Pakar TENANGIN', pageWidth / 2, finalY, { align: 'center' });
      doc.text('Konsultasikan hasil ini dengan profesional kesehatan mental', pageWidth / 2, finalY + 6, { align: 'center' });
      
      // Download PDF
      const fileName = `Hasil_Diagnosis_${dataDiri?.nama || 'User'}_${new Date(item.tanggal_konsultasi).toLocaleDateString('id-ID').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    }
  };

  const handleViewDetails = async (item) => {
    setSelectedDetail(item);
    setShowModal(true);
    setShowAlternatif(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedDetail(null);
      setIsClosing(false);
      setShowAlternatif(false);
    }, 300);
  };

  const handleKonsultasiUlang = () => {
    // Langsung ke konsultasi dengan state dari riwayat
    // User sudah punya data diri, jadi tidak perlu ke halaman data-diri lagi
    console.log('Konsultasi Ulang dari Riwayat - langsung ke konsultasi');
    navigate('/konsultasi', { state: { from: '/riwayat-user' } });
  };

  const parseAlternatifDiagnosis = (data) => {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        if (typeof parsed === 'object' && parsed !== null) {
          return [parsed];
        }
        return [];
      } catch (e) {
        console.error('Error parsing alternatif_diagnosis:', e);
        return [];
      }
    }
    
    if (typeof data === 'object' && data !== null) {
      return [data];
    }
    
    return [];
  };

  // Helper function untuk mendapatkan warna border berdasarkan CF
  const getBorderColor = (cfValue) => {
    const percentage = cfValue * 100;
    if (percentage >= 70) return 'border-red-500';
    if (percentage >= 40) return 'border-yellow-500';
    return 'border-green-500';
  };

  // Helper function untuk mendapatkan warna tema berdasarkan CF
  const getThemeColors = (cfValue) => {
    const percentage = cfValue * 100;
    if (percentage >= 70) {
      return {
        primary: 'bg-red-500',
        primaryHover: 'hover:bg-red-600',
        secondary: 'bg-red-100',
        border: 'border-red-500',
        text: 'text-red-700',
        gradient: 'from-red-500 to-red-600'
      };
    }
    if (percentage >= 40) {
      return {
        primary: 'bg-yellow-500',
        primaryHover: 'hover:bg-yellow-600',
        secondary: 'bg-yellow-100',
        border: 'border-yellow-500',
        text: 'text-yellow-700',
        gradient: 'from-yellow-500 to-yellow-600'
      };
    }
    return {
      primary: 'bg-green-500',
      primaryHover: 'hover:bg-green-600',
      secondary: 'bg-green-100',
      border: 'border-green-500',
      text: 'text-green-700',
      gradient: 'from-green-500 to-green-600'
    };
  };

  const filteredRiwayat = riwayat.filter(item => 
    item.penyakit?.nama_penyakit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDownOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(30px);
          }
        }
        
        @keyframes drawCircle {
          from {
            stroke-dashoffset: ${2 * Math.PI * 28};
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 1000px;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 1;
            max-height: 1000px;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
        }
        
        .animate-fadeOut {
          animation: fadeOut 0.3s ease-out forwards;
        }
        
        .animate-slideDownOut {
          animation: slideDownOut 0.3s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
      <div className="max-w-5xl mx-auto">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Riwayat Diagnosis</h1>
              <p className="text-xs sm:text-sm text-gray-600">{riwayat.length} diagnosis tercatat</p>
            </div>
          </div>

          {riwayat.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Semua
            </button>
          )}
        </div>

        {/* Search Bar - Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari riwayat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-900 px-4 py-2.5 sm:py-3 pl-10 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm text-sm sm:text-base"
            />
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
        </div>

        {/* Riwayat List - Responsive */}
        <div className="space-y-3">
          {filteredRiwayat.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-lg border-l-4 border-blue-600">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-base sm:text-lg text-gray-500 mb-3 px-4">
                {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada riwayat konsultasi'}
              </p>
              {!searchTerm && (
                <a href="/data-diri" className="text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base">
                  Mulai Konsultasi Sekarang →
                </a>
              )}
            </div>
          ) : (
            filteredRiwayat.map((item, index) => (
              <div
                key={item.id || index}
                className={`bg-white rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 border-l-4 ${getBorderColor(item.nilai_cf)} shadow-md`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  {/* Left: CF Circle & Info */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* CF Circle - Responsive size */}
                    <div className="flex-shrink-0">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                        <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-gray-200 sm:hidden"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-200 hidden sm:block"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke={
                              (item.nilai_cf * 100) >= 70 ? '#EF4444' :
                              (item.nilai_cf * 100) >= 40 ? '#F59E0B' : '#10B981'
                            }
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 24}`}
                            strokeDashoffset={`${2 * Math.PI * 24 * (1 - item.nilai_cf)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out sm:hidden"
                            style={{
                              animation: 'drawCircle 1s ease-out'
                            }}
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke={
                              (item.nilai_cf * 100) >= 70 ? '#EF4444' :
                              (item.nilai_cf * 100) >= 40 ? '#F59E0B' : '#10B981'
                            }
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - item.nilai_cf)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out hidden sm:block"
                            style={{
                              animation: 'drawCircle 1s ease-out'
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-900 font-bold text-xs sm:text-sm">
                            {(item.nilai_cf * 100).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Info - Responsive text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 truncate">
                        {item.penyakit?.nama_penyakit || 'Diagnosis'}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(item.tanggal_konsultasi).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span className="hidden sm:inline text-gray-400">•</span>
                        <div className="flex items-center gap-2 sm:gap-4">
                          <span>{item.gejala_dipilih ? JSON.parse(item.gejala_dipilih).length : 0} gejala</span>
                          <span className="text-gray-400">•</span>
                          <span className="truncate">{dataDiri?.nama || user?.email?.split('@')[0] || 'User'}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-block text-xs px-2.5 sm:px-3 py-1 rounded-full font-medium ${
                          (item.nilai_cf * 100) >= 70 ? 'bg-red-100 text-red-700' :
                          (item.nilai_cf * 100) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {(item.nilai_cf * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons - Responsive */}
                  <div className="flex items-center justify-end gap-2 flex-shrink-0">
                    <div className="relative">
                      <button
                        onMouseEnter={() => setHoveredButton(`konsultasi-${item.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                        onClick={() => {
                          setHoveredButton(null);
                          handleKonsultasiUlang();
                        }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-300 hover:scale-110 active:scale-95"
                      >
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      {hoveredButton === `konsultasi-${item.id}` && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap animate-fadeInUp shadow-lg pointer-events-none">
                          Konsultasi Ulang
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setHoveredButton(`view-${item.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                        onClick={() => {
                          setHoveredButton(null);
                          handleViewDetails(item);
                        }}
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-110 active:scale-95"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      {hoveredButton === `view-${item.id}` && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap animate-fadeInUp shadow-lg pointer-events-none">
                          Lihat Detail
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setHoveredButton(`download-${item.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                        onClick={() => {
                          setHoveredButton(null);
                          handleDownloadPDF(item);
                        }}
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-110 active:scale-95"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      {hoveredButton === `download-${item.id}` && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap animate-fadeInUp shadow-lg pointer-events-none">
                          Download PDF
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setHoveredButton(`delete-${item.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                        onClick={() => {
                          setHoveredButton(null);
                          handleDelete(item.id);
                        }}
                        disabled={deleting === item.id}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === item.id ? (
                          <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                      {hoveredButton === `delete-${item.id}` && deleting !== item.id && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap animate-fadeInUp shadow-lg pointer-events-none">
                          Hapus
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Detail - Sama seperti file asli, tidak ada perubahan */}
        {showModal && selectedDetail && (
          <div 
            className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
            onClick={closeModal}
            style={{
              animation: isClosing ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.3s ease-out'
            }}
          >
            <div 
              className={`bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ${isClosing ? 'animate-slideDownOut' : ''}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                animation: isClosing ? 'slideDownOut 0.3s ease-out' : 'slideInUp 0.4s ease-out'
              }}
            >
              {(() => {
                const theme = getThemeColors(selectedDetail.nilai_cf);
                return (
                  <>
                    <div className={`flex items-center justify-between p-4 sm:p-6 border-b-2 ${theme.border} sticky top-0 bg-white z-10`}>
                      <h2 className={`text-lg sm:text-2xl font-bold ${theme.text}`}>Detail Diagnosis</h2>
                      <button
                        onClick={closeModal}
                        className={`p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 ${theme.text}`}
                      >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-white">
                      {/* Diagnosis Utama */}
                      <div className={`bg-white rounded-xl p-4 sm:p-5 border-l-4 ${theme.border} hover:shadow-lg transition-all duration-300 shadow-md`}>
                        <h3 className={`text-xs sm:text-sm font-bold ${theme.text} mb-3 sm:mb-4`}>Diagnosis Utama</h3>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex-shrink-0">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                              <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 sm:hidden" />
                                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="5" fill="none" className="text-gray-200 hidden sm:block" />
                                <circle
                                  cx="32" cy="32" r="28"
                                  stroke={(selectedDetail.nilai_cf * 100) >= 70 ? '#EF4444' : (selectedDetail.nilai_cf * 100) >= 40 ? '#F59E0B' : '#10B981'}
                                  strokeWidth="4" fill="none"
                                  strokeDasharray={`${2 * Math.PI * 28}`}
                                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - selectedDetail.nilai_cf)}`}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000 ease-out sm:hidden"
                                />
                                <circle
                                  cx="40" cy="40" r="36"
                                  stroke={(selectedDetail.nilai_cf * 100) >= 70 ? '#EF4444' : (selectedDetail.nilai_cf * 100) >= 40 ? '#F59E0B' : '#10B981'}
                                  strokeWidth="5" fill="none"
                                  strokeDasharray={`${2 * Math.PI * 36}`}
                                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - selectedDetail.nilai_cf)}`}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000 ease-out hidden sm:block"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-900 font-bold text-base sm:text-lg">
                                  {(selectedDetail.nilai_cf * 100).toFixed(0)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2">
                              {selectedDetail.penyakit?.nama_penyakit}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs sm:text-sm text-gray-600">Tingkat Kepastian:</span>
                              <span className={`inline-block ${theme.primary} text-white text-xs px-2.5 sm:px-3 py-1 rounded-full font-bold`}>
                                {(selectedDetail.nilai_cf * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Data Pasien */}
                      <div className={`bg-white rounded-xl p-4 sm:p-5 border-l-4 ${theme.border} hover:shadow-lg transition-all duration-300 shadow-md`}>
                        <h3 className={`text-xs sm:text-sm font-bold ${theme.text} mb-3 sm:mb-4`}>Data Pasien</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Nama</p>
                            <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">{dataDiri?.nama || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Usia</p>
                            <p className="text-sm sm:text-base text-gray-900 font-semibold">{dataDiri?.umur || 'N/A'} tahun</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Jenis Kelamin</p>
                            <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">{dataDiri?.jenis_kelamin || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Tanggal</p>
                            <p className="text-sm sm:text-base text-gray-900 font-semibold">
                              {new Date(selectedDetail.tanggal_konsultasi).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Solusi Penanganan */}
                      <div className={`bg-white rounded-xl p-4 sm:p-5 border-l-4 ${theme.border} hover:shadow-lg transition-all duration-300 shadow-md`}>
                        <h3 className={`text-xs sm:text-sm font-bold ${theme.text} mb-2 sm:mb-3`}>Solusi Penanganan</h3>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                          {selectedDetail.penyakit?.solusi || 'Tidak ada solusi yang tersedia'}
                        </p>
                      </div>

                      {/* Penyakit Lain */}
                      {(() => {
                        const altDiagnosis = parseAlternatifDiagnosis(selectedDetail.alternatif_diagnosis);
                        if (altDiagnosis && altDiagnosis.length > 0) {
                          return (
                            <div className="bg-white rounded-xl overflow-hidden border-2 border-blue-200 hover:border-blue-300 transition-all duration-300">
                              <button
                                onClick={() => setShowAlternatif(!showAlternatif)}
                                className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-blue-50 transition-colors duration-200"
                              >
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <h3 className="text-xs sm:text-sm font-bold text-blue-900">Penyakit Lain yang Menyertai</h3>
                                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 sm:py-1 rounded-full font-bold">{altDiagnosis.length}</span>
                                </div>
                                <div className="transition-transform duration-300" style={{ transform: showAlternatif ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                                </div>
                              </button>
                              {showAlternatif && (
                                <div className="px-4 sm:px-5 pb-4 sm:pb-5 animate-slideDown">
                                  <div className="space-y-3 pt-2">
                                    {altDiagnosis.map((alt, idx) => {
                                      let altPercentage = 0;
                                      if (alt.persentase !== undefined) altPercentage = parseFloat(alt.persentase);
                                      else if (alt.nilai_cf !== undefined) altPercentage = parseFloat(alt.nilai_cf) * 100;
                                      else if (alt.cf !== undefined) altPercentage = parseFloat(alt.cf) * 100;
                                      
                                      let cfColor = altPercentage >= 70 ? '#EF4444' : altPercentage >= 40 ? '#F59E0B' : '#10B981';
                                      
                                      return (
                                        <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                                          <div className="flex items-start gap-3 sm:gap-4 mb-2 sm:mb-3">
                                            <div className="flex-shrink-0">
                                              <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                                                <svg className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90">
                                                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200 sm:hidden" />
                                                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 hidden sm:block" />
                                                  <circle
                                                    cx="24" cy="24" r="20" stroke={cfColor} strokeWidth="3" fill="none"
                                                    strokeDasharray={`${2 * Math.PI * 20}`}
                                                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - altPercentage / 100)}`}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out sm:hidden"
                                                  />
                                                  <circle
                                                    cx="32" cy="32" r="28" stroke={cfColor} strokeWidth="4" fill="none"
                                                    strokeDasharray={`${2 * Math.PI * 28}`}
                                                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - altPercentage / 100)}`}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out hidden sm:block"
                                                  />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                  <span className="text-gray-900 font-bold text-xs sm:text-sm">{altPercentage.toFixed(0)}</span>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{alt.nama_penyakit || alt.name || 'Tidak diketahui'}</h4>
                                              <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs text-gray-600">Tingkat Kepastian:</span>
                                                <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold ${
                                                  altPercentage >= 70 ? 'bg-red-500 text-white' :
                                                  altPercentage >= 40 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                                                }`}>{altPercentage.toFixed(1)}%</span>
                                              </div>
                                            </div>
                                          </div>
                                          {alt.solusi && (
                                            <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-blue-200 mt-2 sm:mt-3">
                                              <p className="text-xs font-bold text-blue-900 mb-1">Solusi & Saran:</p>
                                              <p className="text-xs text-gray-700 leading-relaxed">{alt.solusi}</p>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-5 border-2 border-emerald-200">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-xs sm:text-sm font-bold text-emerald-900 mb-1">Penyakit Lain yang Menyertai</h4>
                                  <p className="text-xs sm:text-sm text-emerald-700">
                                    Tidak ada penyakit lain yang teridentifikasi dari gejala yang dialami.
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>

                    <div className={`p-4 sm:p-6 border-t-2 ${getThemeColors(selectedDetail.nilai_cf).border} sticky bottom-0 bg-white`}>
                      <button
                        onClick={closeModal}
                        className={`w-full ${getThemeColors(selectedDetail.nilai_cf).primary} text-white px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base hover:scale-105 active:scale-95`}
                      >
                        Tutup
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatUser;