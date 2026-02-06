import { Brain, Target, Zap, Shield, ArrowRight, Search, Calculator, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import FloatingChatAI from '../components/FloatingChatAi';

import perpisahanImg from '../assets/perpisahan_3.jpg';
import mutismeImg from '../assets/mutisme_selektif.jpg';
import sosialImg from '../assets/kecemasan_sosial.jpg';
import panikImg from '../assets/gangguan_panik.jpg';
import agoraphobiaImg from '../assets/agoraphobia.jpg';
import umumImg from '../assets/kecemasan_umum.jpg';

const About = () => {
  const [selectedPenyakit, setSelectedPenyakit] = useState(null);

  const penyakitList = [
    {
      kode: 'P01',
      nama: 'Gangguan Kecemasan Perpisahan',
      desc: 'Kecemasan berlebihan saat berpisah dari orang atau tempat yang dekat',
      detail: 'Gangguan ini ditandai dengan ketakutan atau kecemasan yang berlebihan dan tidak sesuai dengan tingkat perkembangan terkait perpisahan dari figur lekat. Individu dengan gangguan ini sering kali khawatir berlebihan tentang kehilangan atau kemungkinan bahaya yang menimpa figur lekat mereka.',
      gejala: [
        'Distress berlebihan saat berpisah',
        'Kekhawatiran terus-menerus tentang kehilangan figur lekat',
        'Mimpi buruk tentang perpisahan',
        'Keluhan fisik seperti sakit kepala atau perut',
        'Menolak tidur sendirian'
      ],
      placeholder: perpisahanImg
    },
    {
      kode: 'P02',
      nama: 'Mutisme Selektif',
      desc: 'Kesulitan berbicara di situasi sosial tertentu meskipun bisa berbicara normal di lingkungan lain',
      detail: 'Mutisme selektif adalah gangguan kecemasan di mana seseorang yang mampu berbicara normal menjadi tidak mampu berbicara dalam situasi sosial tertentu. Biasanya dimulai pada masa kanak-kanak dan dapat berlanjut hingga dewasa jika tidak ditangani.',
      gejala: [
        'Tidak berbicara di situasi sosial tertentu',
        'Berbicara normal di rumah atau lingkungan nyaman',
        'Menghindari kontak mata',
        'Postur tubuh kaku atau tidak ekspresif',
        'Menggunakan bahasa tubuh atau isyarat untuk berkomunikasi'
      ],
      placeholder: mutismeImg
    },
    {
      kode: 'P03',
      nama: 'Gangguan Kecemasan Sosial',
      desc: 'Ketakutan intens terhadap situasi sosial dan diamati oleh orang lain',
      detail: 'Gangguan kecemasan sosial atau fobia sosial adalah ketakutan intens dan persisten terhadap situasi sosial di mana individu merasa akan dinilai, dievaluasi negatif, atau dipermalukan. Gangguan ini dapat sangat mengganggu kehidupan sehari-hari dan hubungan interpersonal.',
      gejala: [
        'Ketakutan intens dalam situasi sosial',
        'Kekhawatiran berlebihan tentang penilaian orang lain',
        'Menghindari situasi sosial',
        'Gejala fisik: berkeringat, gemetar, jantung berdebar',
        'Kesulitan berbicara atau pikiran kosong saat berinteraksi'
      ],
      placeholder: sosialImg
    },
    {
      kode: 'P04',
      nama: 'Gangguan Panik',
      desc: 'Serangan panik berulang dengan gejala fisik seperti jantung berdebar dan sulit bernapas',
      detail: 'Gangguan panik ditandai dengan serangan panik yang berulang dan tidak terduga, disertai kekhawatiran terus-menerus tentang kemungkinan serangan berikutnya. Serangan panik adalah periode ketakutan atau ketidaknyamanan intens yang mencapai puncaknya dalam beberapa menit.',
      gejala: [
        'Jantung berdebar atau detak jantung cepat',
        'Berkeringat berlebihan',
        'Gemetar atau bergetar',
        'Sesak napas atau perasaan tercekik',
        'Nyeri dada atau ketidaknyamanan',
        'Mual atau gangguan perut',
        'Pusing atau pingsan',
        'Takut kehilangan kendali atau mati'
      ],
      placeholder: panikImg
    },
    {
      kode: 'P05',
      nama: 'Agoraphobia',
      desc: 'Ketakutan berada di tempat umum atau situasi dimana sulit untuk melarikan diri',
      detail: 'Agoraphobia adalah ketakutan dan penghindaran terhadap tempat atau situasi yang mungkin menyebabkan kepanikan dan membuat seseorang merasa terjebak, tak berdaya, atau malu. Orang dengan agoraphobia sering menghindari tempat ramai atau situasi di mana sulit untuk mendapatkan bantuan.',
      gejala: [
        'Takut menggunakan transportasi umum',
        'Takut berada di ruang terbuka (parkir, jembatan)',
        'Takut berada di ruang tertutup (toko, teater)',
        'Takut berdiri dalam antrian atau di kerumunan',
        'Takut berada di luar rumah sendirian',
        'Serangan panik di situasi tertentu'
      ],
      placeholder: agoraphobiaImg
    },
    {
      kode: 'P06',
      nama: 'Gangguan Kecemasan Umum',
      desc: 'Kecemasan dan kekhawatiran berlebihan hampir setiap hari selama minimal 6 bulan',
      detail: 'Gangguan Kecemasan Umum (GAD) adalah kondisi kesehatan mental yang ditandai dengan kekhawatiran yang berlebihan dan persisten tentang berbagai hal. Kekhawatiran ini sulit dikendalikan dan dapat mengganggu aktivitas sehari-hari.',
      gejala: [
        'Kekhawatiran berlebihan tentang banyak hal',
        'Sulit mengendalikan kekhawatiran',
        'Gelisah atau merasa tegang',
        'Mudah lelah',
        'Sulit konsentrasi',
        'Mudah tersinggung',
        'Ketegangan otot',
        'Gangguan tidur'
      ],
      placeholder: umumImg
    }
  ];

  const handleCardClick = (penyakit) => {
    if (selectedPenyakit?.kode === penyakit.kode) {
      // Smooth fade out
      const detailSection = document.getElementById('detail-section');
      if (detailSection) {
        detailSection.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        detailSection.style.opacity = '0';
        detailSection.style.transform = 'translateY(30px)';
        setTimeout(() => {
          setSelectedPenyakit(null);
        }, 600);
      } else {
        setSelectedPenyakit(null);
      }
    } else {
      setSelectedPenyakit(penyakit);
      setTimeout(() => {
        const detailSection = document.getElementById('detail-section');
        if (detailSection) {
          // Reset styles for animation
          detailSection.style.opacity = '0';
          detailSection.style.transform = 'translateY(30px)';
          
          // Scroll first with smooth behavior
          detailSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
          
          // Then animate in with smoother timing
          setTimeout(() => {
            detailSection.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            detailSection.style.opacity = '1';
            detailSection.style.transform = 'translateY(0)';
          }, 300);
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-white text-gray-800 pt-20 pb-20 px-4">
        <div className="container mx-auto relative z-10 text-center animate-fadeInUp">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">Tentang Si-Pakar</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Sistem Pakar Deteksi Dini Gangguan Kecemasan
          </p>
        </div>
      </section>

      {/* Deskripsi */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Apa itu Si-Pakar?</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-600 animate-fadeInScale">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Si-Pakar adalah sistem yang memanfaatkan pengetahuan manusia ke komputer yang dapat menyelesaikan masalah seperti yang dilakukan oleh para ahli. 
              Seorang pakar memiliki pengetahuan dan pengalaman yang diperlukan untuk menyelesaikan masalah sama pentingnya dengan sistem pakar 
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Sistem ini dikembangkan untuk memberikan diagnosis awal yang akurat berdasarkan 
              gejala-gejala yang dialami pengguna, serta memberikan rekomendasi solusi penanganan 
              yang sesuai.
            </p>
          </div>
        </div>
      </section>

      {/* Cara Kerja Sistem */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cara Kerja Sistem</h2>
            <p className="text-xl text-gray-600">Proses diagnosis dalam 4 langkah sederhana</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 border-l-4 border-blue-600 animate-fadeInUp">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Input Gejala</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Sistem menerima input gejala dari user beserta tingkat kepastiannya
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 border-l-4 border-blue-600 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Calculator className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Proses Forward Chaining</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Sistem mencocokkan gejala dengan basis pengetahuan menggunakan Forward Chaining
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 border-l-4 border-blue-600 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Hitung Certainty Factor</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Menghitung nilai CF untuk setiap kemungkinan diagnosis
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 border-l-4 border-blue-600 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Hasil Diagnosis</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Menampilkan diagnosis dengan CF tertinggi beserta solusinya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jenis Gangguan Kecemasan */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Jenis Gangguan Kecemasan</h2>
            <p className="text-xl text-gray-600">Klik pada setiap kartu untuk melihat detail lengkap</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {penyakitList.map((penyakit, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(penyakit)}
                className={`cursor-pointer bg-white rounded-xl shadow-md transition-all duration-300 overflow-hidden animate-fadeInScale ${
                  selectedPenyakit?.kode === penyakit.kode 
                    ? 'shadow-xl ring-2 ring-blue-500' 
                    : 'hover:shadow-lg'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-36 sm:h-40 bg-gray-100 overflow-hidden">
                  <img 
                    src={penyakit.placeholder} 
                    alt={penyakit.nama}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {penyakit.nama}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {penyakit.desc}
                  </p>
                  <div className="mt-3 sm:mt-4 flex items-center text-blue-600 font-semibold text-xs sm:text-sm">
                    <span>{selectedPenyakit?.kode === penyakit.kode ? 'Tutup detail' : 'Klik Detail'}</span>
                    <ArrowRight className={`w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform duration-300 ${
                      selectedPenyakit?.kode === penyakit.kode ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Section */}
      {selectedPenyakit && (
        <section id="detail-section" className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl animate-fadeInScale">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-4 border-blue-600 relative">
              <button
                onClick={() => {
                  const detailSection = document.getElementById('detail-section');
                  if (detailSection) {
                    detailSection.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    detailSection.style.opacity = '0';
                    detailSection.style.transform = 'translateY(30px)';
                    setTimeout(() => {
                      setSelectedPenyakit(null);
                    }, 600);
                  } else {
                    setSelectedPenyakit(null);
                  }
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="animate-fadeInUp pr-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {selectedPenyakit.nama}
                </h2>

                <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                  {selectedPenyakit.detail}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Floating Chat AI */}
            <FloatingChatAI />
          </div>
  );
};

export default About;