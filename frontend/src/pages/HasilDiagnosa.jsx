import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, CheckCircle, AlertTriangle, Home, ArrowLeft, Activity, AlertCircle, Info, TrendingDown, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import { useAuth } from '../context/AuthContext';

const HasilDiagnosa = () => {
  const { user } = useAuth();
  const [hasil, setHasil] = useState(null);
  const [dataDiri, setDataDiri] = useState(null);
  const [noDiagnosis, setNoDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredButton, setHoveredButton] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const hasilData = localStorage.getItem(`hasilDiagnosa_${user.id}`);
    const noDiagnosisData = localStorage.getItem(`noDiagnosis_${user.id}`);
    const dataDiriData = localStorage.getItem(`dataDiri_hasil_${user.id}`);
    
    if (!hasilData && !noDiagnosisData) {
      navigate('/data-diri');
      return;
    }

    if (noDiagnosisData) {
      setNoDiagnosis(JSON.parse(noDiagnosisData));
    }
    
    if (hasilData) {
      const parsedHasil = JSON.parse(hasilData);
      setHasil(parsedHasil);
    }
    
    if (dataDiriData) {
      setDataDiri(JSON.parse(dataDiriData));
    }
    
    setLoading(false);
  }, [navigate, user.id]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
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
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Data Diri Pasien', 14, 50);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nama: ${dataDiri?.nama}`, 14, 60);
    doc.text(`Umur: ${dataDiri?.umur} tahun`, 14, 67);
    doc.text(`Jenis Kelamin: ${dataDiri?.jenis_kelamin}`, 14, 74);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 81);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Hasil Diagnosis', 14, 96);
    
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(14, 101, pageWidth - 28, 25, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Penyakit: ${hasil?.hasil_diagnosis?.nama_penyakit}`, 18, 111);
    doc.text(`Tingkat Kepastian (CF): ${hasil?.hasil_diagnosis?.persentase}%`, 18, 121);
    
    let currentY = 136;
    
    const alternatifDiagnosis = hasil?.alternatif_diagnosis || [];
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
        doc.text(`   Nilai CF: ${alt.persentase}%`, 18, currentY);
        currentY += 7;
      });
      currentY += 5;
    }
    
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
    const solusiText = doc.splitTextToSize(hasil?.hasil_diagnosis?.solusi || '', pageWidth - 28);
    doc.text(solusiText, 14, currentY);
    
    const finalY = doc.internal.pageSize.height - 30;
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('Dokumen ini digenerate otomatis oleh Sistem Pakar TENANGIN', pageWidth / 2, finalY, { align: 'center' });
    doc.text('Konsultasikan hasil ini dengan profesional kesehatan mental', pageWidth / 2, finalY + 6, { align: 'center' });
    
    doc.save(`Hasil_Diagnosis_${dataDiri?.nama}_${new Date().toLocaleDateString('id-ID')}.pdf`);
  };

  const getSeverityLevel = (percentage) => {
    if (percentage >= 70) return 'Tinggi';
    if (percentage >= 40) return 'Sedang';
    return 'Rendah';
  };

  // Helper function untuk mendapatkan warna border berdasarkan CF
  const getBorderColor = (percentage) => {
    if (percentage >= 70) return 'border-red-500';
    if (percentage >= 40) return 'border-yellow-500';
    return 'border-green-500';
  };

  // Helper function untuk mendapatkan warna badge berdasarkan CF
  const getBadgeColor = (percentage) => {
    if (percentage >= 70) return 'bg-red-100 text-red-700';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat hasil...</p>
        </div>
      </div>
    );
  }

  if (noDiagnosis) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-blue-600 p-8 mb-6 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tidak Ada Diagnosis</h1>
            <p className="text-gray-600">{dataDiri?.nama} • {new Date().toLocaleDateString('id-ID')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border-l-4 border-blue-600 p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{noDiagnosis.message}</h3>
                <p className="text-gray-600">{noDiagnosis.detail}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border-l-4 border-blue-600 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Rekomendasi</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Anda tidak menunjukkan tanda-tanda signifikan gangguan kecemasan</p>
              </div>
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Jika merasa perlu, konsultasikan dengan psikolog atau psikiater</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                localStorage.removeItem(`noDiagnosis_${user.id}`);
                navigate('/konsultasi');
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
              Konsultasi Ulang
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>

          <div className="mt-6 bg-amber-50 rounded-xl border-l-4 border-amber-500 p-4 shadow-sm">
            <p className="text-sm text-center text-gray-700">
              Hasil ini tidak menggantikan konsultasi medis profesional
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasil || !dataDiri) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat hasil...</p>
        </div>
      </div>
    );
  }

  const percentage = parseFloat(hasil.hasil_diagnosis.persentase);
  const severityLevel = getSeverityLevel(percentage);
  const alternatifDiagnosis = hasil.alternatif_diagnosis || [];

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <style>{`
        @keyframes drawCircle {
          from {
            stroke-dashoffset: ${2 * Math.PI * 28};
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
        
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        {/* Header Simple tanpa Card */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hasil Diagnosis</h1>
              <p className="text-sm text-gray-600">{dataDiri.nama} • {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* DIAGNOSIS UTAMA - Dengan outline dinamis */}
        <div className={`bg-white rounded-2xl shadow-lg border-l-4 ${getBorderColor(percentage)} p-6 mb-6 hover:shadow-xl transition-all duration-300`}>
          <div className="mb-6 text-center px-4">
            <p className="text-gray-700 leading-relaxed text-lg">
              Kemungkinan Anda memiliki kecenderungan{' '}
              <span className="font-bold text-gray-900">{hasil.hasil_diagnosis.nama_penyakit}</span>
            </p>
          </div>

          {/* CF Circle - Format SVG seperti di Riwayat */}
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={
                    percentage >= 70 ? '#EF4444' :
                    percentage >= 40 ? '#F59E0B' : '#10B981'
                  }
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-2000 ease-out"
                  style={{
                    animation: 'drawCircle 2s ease-out'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {percentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Nilai CF</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className={`inline-block px-6 py-2 rounded-full text-sm font-semibold ${getBadgeColor(percentage)}`}>
              Tingkat Kecemasan: {severityLevel}
            </span>
          </div>
        </div>

        {/* SOLUSI - Dengan outline dinamis */}
        <div className={`bg-white rounded-2xl shadow-lg border-l-4 ${getBorderColor(percentage)} p-6 mb-6 hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">Solusi Penanganan</h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {hasil.hasil_diagnosis.solusi}
            </p>
          </div>
        </div>

        {/* PENYAKIT LAIN YANG MENYERTAI */}
        {alternatifDiagnosis.length > 0 && (
          <div className={`bg-white rounded-2xl shadow-lg border-l-4 ${getBorderColor(percentage)} p-6 mb-6 hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Penyakit Lain yang Menyertai</h3>
            </div>
            <div className="space-y-3">
              {alternatifDiagnosis.map((alt, index) => {
                const altPercentage = parseFloat(alt.persentase);
                let circleColor = '#10B981';
                if (altPercentage >= 70) {
                  circleColor = '#EF4444';
                } else if (altPercentage >= 40) {
                  circleColor = '#F59E0B';
                }
                
                return (
                  <div key={index} className={`bg-white border-l-4 ${getBorderColor(altPercentage)} rounded-xl p-4 hover:shadow-md transition-all duration-300 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      {/* Left: CF Circle & Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* CF Circle */}
                        <div className="flex-shrink-0">
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-gray-200"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke={circleColor}
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - altPercentage / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-1500 ease-out"
                                style={{
                                  animation: `drawCircle 1.5s ease-out ${index * 0.2}s`
                                }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-gray-900 font-bold text-sm">
                                {altPercentage.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-gray-900 mb-1 truncate">
                            {alt.nama_penyakit}
                          </h4>
                          <div className="mt-2">
                            <span className={`inline-block ${getBadgeColor(altPercentage)} text-xs px-3 py-1 rounded-full font-medium`}>
                              {altPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PERINGATAN - Dengan outline dinamis */}
        <div className={`bg-white rounded-2xl shadow-lg border-l-4 ${getBorderColor(percentage)} p-6 mb-6 hover:shadow-xl transition-all duration-300`}>
          {percentage >= 70 && (
            <div className="border-l-4 border-rose-500 pl-5 py-4 bg-rose-50 rounded-r-xl">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-gray-700 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Peringatan Penting</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    Hasil diagnosis menunjukkan tingkat keparahan yang tinggi. 
                    Kondisi ini memerlukan perhatian serius dan penanganan profesional.
                  </p>
                  <p className="text-gray-700 text-sm font-semibold">
                    Sangat disarankan untuk segera berkonsultasi dengan psikiater atau profesional kesehatan mental untuk mendapatkan penanganan yang tepat.
                  </p>
                </div>
              </div>
            </div>
          )}

          {percentage >= 40 && percentage < 70 && (
            <div className="border-l-4 border-amber-500 pl-5 py-4 bg-amber-50 rounded-r-xl">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-gray-700 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Perhatian</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    Hasil diagnosis menunjukkan tingkat keparahan sedang. 
                    Kondisi ini perlu diperhatikan dan ditangani dengan baik.
                  </p>
                  <p className="text-gray-700 text-sm">
                    Disarankan untuk berkonsultasi dengan psikolog atau konselor untuk mendapatkan bimbingan dan dukungan yang tepat.
                  </p>
                </div>
              </div>
            </div>
          )}

          {percentage < 40 && (
            <div className="border-l-4 border-emerald-500 pl-5 py-4 bg-emerald-50 rounded-r-xl">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-gray-700 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Informasi</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    Hasil diagnosis menunjukkan tingkat keparahan rendah. 
                    Kondisi Anda relatif ringan.
                  </p>
                  <p className="text-gray-700 text-sm">
                    Tetap jaga kesehatan mental Anda dengan pola hidup sehat. Jika diperlukan, Anda dapat berkonsultasi dengan konselor untuk dukungan tambahan.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DISCLAIMER */}
        <div className="border-l-4 border-amber-500 bg-amber-50 rounded-xl p-5 shadow-sm mb-6">
          <p className="text-sm text-center text-gray-700">
            Hasil diagnosis bersifat indikatif dan tidak menggantikan diagnosis medis profesional. 
            Konsultasikan dengan psikolog atau psikiater untuk penanganan lebih lanjut.
          </p>
        </div>

        {/* Tombol Navigasi dengan Icon + Tooltip */}
        <div className="mt-6 flex justify-center gap-3">
          {/* Button Download PDF */}
          <div className="relative">
            <button
              onMouseEnter={() => setHoveredButton('download')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => {
                setHoveredButton(null);
                downloadPDF();
              }}
              className="p-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <Download className="w-6 h-6" />
            </button>
            {hoveredButton === 'download' && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap animate-fadeInUp shadow-lg pointer-events-none">
                Cetak PDF
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>

          {/* Button Konsultasi Ulang */}
          <div className="relative">
            <button
              onMouseEnter={() => setHoveredButton('konsultasi')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => {
                setHoveredButton(null);
                localStorage.removeItem(`hasilDiagnosa_${user.id}`);
                localStorage.removeItem(`dataDiri_hasil_${user.id}`);
                navigate('/konsultasi');
              }}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
            {hoveredButton === 'konsultasi' && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap animate-fadeInUp shadow-lg pointer-events-none">
                Konsultasi Ulang
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>

          {/* Button Lihat Riwayat */}
          <div className="relative">
            <button
              onMouseEnter={() => setHoveredButton('riwayat')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => {
                setHoveredButton(null);
                navigate('/riwayat');
              }}
              className="p-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <Activity className="w-6 h-6" />
            </button>
            {hoveredButton === 'riwayat' && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap animate-fadeInUp shadow-lg pointer-events-none">
                Lihat Riwayat
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HasilDiagnosa;