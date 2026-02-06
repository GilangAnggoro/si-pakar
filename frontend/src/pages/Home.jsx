import { Link, useNavigate } from 'react-router-dom';
import { Brain, Activity, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import FloatingChatAI from '../components/FloatingChatAi';
import anxietyImg from '../assets/anxiety.jpg';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasDataDiri, setHasDataDiri] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    const checkDataDiri = () => {
      if (user && user.id) {
        console.log('Checking data diri untuk user.id:', user.id);
        const dataDiri = localStorage.getItem(`dataDiri_${user.id}`);
        
        if (dataDiri) {
          try {
            const parsedData = JSON.parse(dataDiri);
            console.log('Data diri dari localStorage:', parsedData);
            
            // === FIX LOGIKA VALIDASI DATA DIRI ===
            // Sekarang tidak mengecek parsedData.userId lagi.
            if (
              parsedData.nama &&
              parsedData.nama.trim() !== '' &&
              parsedData.umur &&
              parseInt(parsedData.umur) > 0 &&
              parsedData.jenis_kelamin &&
              parsedData.jenis_kelamin.trim() !== ''
            ) {
              console.log('✅ Data diri lengkap');
              setHasDataDiri(true);
            } else {
              console.log('❌ Data diri tidak lengkap');
              setHasDataDiri(false);
            }

          } catch (error) {
            console.error('Error parsing data diri:', error);
            setHasDataDiri(false);
          }
        } else {
          console.log('❌ User belum punya data diri di localStorage');
          setHasDataDiri(false);
        }
      } else {
        console.log('⚠️ User belum login atau user.id tidak tersedia');
        setHasDataDiri(false);
      }
      setLoading(false);
    };

    const timer = setTimeout(() => {
      checkDataDiri();
    }, 100);

    return () => clearTimeout(timer);
  }, [user]);

  const handleConsultationClick = () => {
    console.log('=== TOMBOL MULAI KONSULTASI DIKLIK ===');
    console.log('user:', user);
    console.log('user.id:', user?.id);
    console.log('hasDataDiri:', hasDataDiri);
    console.log('loading:', loading);
    
    if (user && user.id) {
      const dataDiriKey = `dataDiri_${user.id}`;
      const dataDiriValue = localStorage.getItem(dataDiriKey);
      console.log(`localStorage.getItem('${dataDiriKey}'):`, dataDiriValue);
      
      if (dataDiriValue) {
        try {
          const parsed = JSON.parse(dataDiriValue);
          console.log('Data diri yang tersimpan:', parsed);
        } catch (e) {
          console.log('Error parsing data diri:', e);
        }
      }
    }
    
    if (hasDataDiri) {
      console.log('✅ Data diri lengkap → redirect ke /konsultasi');
      navigate('/konsultasi', { state: { from: '/' } });
    } else {
      console.log('❌ Data diri belum lengkap → redirect ke /data-diri');
      navigate('/data-diri', { state: { from: '/' } });
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'Diagnosis Akurat',
      description: 'Menggunakan metode Forward Chaining dan Certainty Factor untuk hasil yang akurat'
    },
    {
      icon: Activity,
      title: 'Hasil Diagnosa',
      description: 'Lihat gangguan kecemasan yang anda alami'
    },
    {
      icon: FileText,
      title: 'Laporan PDF',
      description: 'Download hasil diagnosis dalam format PDF untuk referensi'
    },
    {
      icon: TrendingUp,
      title: 'Riwayat Konsultasi',
      description: 'Lihat riwayat konsultasi dan perkembangan kondisi Anda'
    }
  ];

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: 0, marginTop: 0 }}>
      <section 
        className="relative bg-white text-gray-800 pb-16 px-4"
        style={{ 
          marginTop: '0',
          paddingTop: '5rem',
          borderTop: '0',
          borderBottom: '0'
        }}
      >
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5 animate-fadeInUp bg-white p-6 md:p-8 rounded-xl border-l-4 border-blue-600 shadow-lg">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-gray-800">
                Sistem Pakar Diagnosa Gangguan Kecemasan Untuk 
                <span className="text-blue-600"> Generasi Z</span>
              </h1>
              
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Platform untuk memahami kondisi gangguan kecemasan yang diderita para Gen Z dengan teknologi diagnosis modern.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                {user ? (
                  <button
                    onClick={handleConsultationClick}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:-translate-y-1 active:translate-y-0"
                  >
                    <span className="flex items-center gap-2">
                      {loading ? 'Loading...' : 'Mulai Konsultasi'}
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-center flex items-center justify-center gap-2 hover:-translate-y-1 active:translate-y-0"
                    >
                      <span className="flex items-center gap-2">
                        Login untuk Konsultasi
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </Link>
                    <Link
                      to="/register"
                      className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 text-center hover:-translate-y-1 active:translate-y-0"
                    >
                      Daftar Gratis
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="relative animate-fadeInScale">
              <div className="relative w-full h-[280px] sm:h-[320px] md:h-[350px] lg:h-[380px] rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={anxietyImg} 
                  alt="Mental Health Consultation" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4 animate-fadeInUp">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Fitur Sistem
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Teknologi modern untuk diagnosis gangguan kecemasan yang akurat dan terpercaya
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-blue-600"
                  style={{
                    transform: hoveredFeature === index ? 'translateY(-8px)' : 'translateY(0)',
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 shadow-md">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4 animate-fadeInUp">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Cara Kerja Sistem
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Proses diagnosis yang mudah dalam 4 langkah sederhana
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 animate-fadeInScale border-l-4 border-blue-600">
                <div className="flex items-start gap-6 relative z-10">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">
                      Login dan Isi Data Diri
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Daftar atau login, kemudian lengkapi data diri Anda untuk memulai konsultasi
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 animate-fadeInScale border-l-4 border-blue-600" style={{ animationDelay: '100ms' }}>
                <div className="flex items-start gap-6 relative z-10">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">
                      Jawab Pertanyaan Gejala
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Pilih gejala yang Anda alami beserta tingkat kepastiannya dengan jujur
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 animate-fadeInScale border-l-4 border-blue-600" style={{ animationDelay: '200ms' }}>
                <div className="flex items-start gap-6 relative z-10">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">
                      Sistem Memproses
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Sistem menganalisis gejala dengan metode Forward Chaining dan Certainty Factor
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 animate-fadeInScale border-l-4 border-blue-600" style={{ animationDelay: '300ms' }}>
                <div className="flex items-start gap-6 relative z-10">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">
                      Dapatkan Hasil Diagnosis
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Lihat hasil diagnosis lengkap dan download laporan PDF untuk referensi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FloatingChatAI />
    </div>
  );
};

export default Home;
