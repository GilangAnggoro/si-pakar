import { Brain, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-blue-600 text-white mt-auto relative">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div className="animate-fadeInUp">
            <div className="flex items-center space-x-2 mb-4 group">
              <div className="p-2 bg-blue-700 rounded-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Brain className="w-6 h-6 animate-floating" />
              </div>
              <h3 className="text-xl font-bold text-white">Si-Pakar</h3>
            </div>
            <p className="text-blue-50 leading-relaxed text-sm">
              Sistem Pakar Deteksi Dini Gangguan Kecemasan menggunakan Forward Chaining & Certainty Factor
            </p>
          </div>

          {/* Quick Links */}
          <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xl font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3 text-blue-50">
              <li>
                <a href="/" className="hover:text-white transition-all duration-300 inline-block text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white transition-all duration-300 inline-block text-sm">
                  Tentang Sistem
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-all duration-300 inline-block text-sm">
                  Kontak
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-all duration-300 inline-block text-sm">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <h3 className="text-xl font-bold mb-4 text-white">Kontak</h3>
            <ul className="space-y-3 text-blue-50">
              <li className="flex items-center space-x-3 hover:text-white transition-all duration-300">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm">info@tenangin.com</span>
              </li>
              <li className="flex items-center space-x-3 hover:text-white transition-all duration-300">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm">+62 123 4567 890</span>
              </li>
              <li className="flex items-center space-x-3 hover:text-white transition-all duration-300">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm">Bangil, East Java, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-500 mt-8 pt-6 text-center text-blue-50">
          <p className="animate-fadeInUp text-sm" style={{ animationDelay: '300ms' }}>
            &copy; 2024 Si-Pakar TENANGIN. All rights reserved. | Developed with ❤️
          </p>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300 hover:-translate-y-1 transform z-50 animate-fadeInScale"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </footer>
  );
};

export default Footer;