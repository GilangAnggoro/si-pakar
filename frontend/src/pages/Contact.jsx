import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({
    type: '',
    message: ''
  });

  const API_URL = 'http://localhost:5000/api/contact/send';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setStatus({ type: 'loading', message: 'Mengirim pesan...' });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          type: 'success',
          message: data.message || 'Pesan berhasil dikirim! Admin akan segera merespons.'
        });
        
        setTimeout(() => {
          setFormData({ name: '', email: '', subject: '', message: '' });
          setStatus({ type: '', message: '' });
        }, 3000);
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Gagal mengirim pesan. Silakan coba lagi.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Terjadi kesalahan koneksi. Pastikan server backend berjalan.'
      });
      console.error('Error:', error);
    }
  };

  const isFormValid = formData.name && formData.email && formData.subject && formData.message;

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeInUp">
          <MessageCircle className="w-12 h-12 text-gray-800 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Hubungi Kami</h1>
          <p className="text-base md:text-lg text-gray-600">
            Ada pertanyaan? Kami siap membantu Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-7 animate-fadeInScale border-l-4 border-blue-600">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-5">Kirim Pesan</h2>
            
            {/* Status Messages */}
            {status.type === 'success' && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center animate-fadeInUp">
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{status.message}</span>
              </div>
            )}

            {status.type === 'error' && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center animate-fadeInUp">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{status.message}</span>
              </div>
            )}

            {status.type === 'loading' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded-lg mb-4 flex items-center animate-fadeInUp">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-2"></div>
                <span className="text-sm">{status.message}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="Nama Anda"
                  disabled={status.type === 'loading'}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="email@example.com"
                  disabled={status.type === 'loading'}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Subjek
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="Subjek pesan"
                  disabled={status.type === 'loading'}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Pesan
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                  placeholder="Tulis pesan Anda..."
                  disabled={status.type === 'loading'}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid || status.type === 'loading'}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transform shadow-md hover:shadow-lg"
              >
                {status.type === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Kirim Pesan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Informasi Kontak */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-7 animate-fadeInScale border-l-4 border-yellow-500" style={{ animationDelay: '100ms' }}>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-5">Informasi Kontak</h2>
              
              <div className="space-y-5">
                <div className="flex items-start">
                  <div className="bg-yellow-50 p-3 rounded-lg mr-4 flex-shrink-0">
                    <Mail className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 text-sm">Email</h3>
                    <p className="text-gray-600 text-sm">si-pakar@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-50 p-3 rounded-lg mr-4 flex-shrink-0">
                    <Phone className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 text-sm">Telepon</h3>
                    <p className="text-gray-600 text-sm">085655023632</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-50 p-3 rounded-lg mr-4 flex-shrink-0">
                    <MapPin className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 text-sm">Alamat</h3>
                    <p className="text-gray-600 text-sm">
                      Jl. Raya Beji <br />
                      Bangil, Pasuruan<br />
                      Jawa Timur 67153<br />
                      Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeInScale border-l-4 border-red-500" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start mb-3">
                <div className="bg-red-50 p-2 rounded-lg mr-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Emergency</h3>
              </div>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                Jika Anda mengalami krisis kesehatan mental yang memerlukan bantuan segera, 
                hubungi layanan darurat:
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                  <p className="text-gray-800 font-semibold text-sm">
                    Hotline Sejiwa: 085655023632
                  </p>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                  <p className="text-gray-800 font-semibold text-sm">
                    Emergency: 112
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;