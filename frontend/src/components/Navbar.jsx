import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  Menu,
  X,
  LogOut,
  Home,
  Info,
  History,
  Phone,
  User,
  Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-lg ${
        scrolled 
          ? 'bg-blue-600' 
          : 'bg-white/95 backdrop-blur-sm border-b-2 border-blue-600/20'
      }`}
      style={{
        boxShadow: scrolled 
          ? '0 8px 30px rgba(0, 0, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.3)' 
          : '0 8px 25px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link 
            to="/" 
            className={`flex items-center space-x-2 text-xl sm:text-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${
              scrolled ? 'text-white' : 'text-gray-800'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              scrolled ? 'bg-white' : 'bg-blue-600'
            }`}>
              <Brain className={`w-5 h-5 sm:w-6 sm:h-6 ${
                scrolled ? 'text-blue-600' : 'text-white'
              }`} />
            </div>
            <span>Si-Pakar</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/') 
                  ? scrolled 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-600 text-white'
                  : scrolled
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </Link>

            <Link 
              to="/about" 
              className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/about') 
                  ? scrolled 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-600 text-white'
                  : scrolled
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Info className="w-4 h-4" />
              <span className="font-medium">Tentang</span>
            </Link>

            {user && (
              <Link 
                to="/riwayat" 
                className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive('/riwayat') 
                    ? scrolled 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-600 text-white'
                    : scrolled
                      ? 'text-white hover:bg-white/20'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="font-medium">Riwayat</span>
              </Link>
            )}

            <Link 
              to="/contact" 
              className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/contact') 
                  ? scrolled 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-600 text-white'
                  : scrolled
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">Kontak</span>
            </Link>

            {user ? (
              <>
                <div className={`h-6 w-px mx-2 ${scrolled ? 'bg-white/30' : 'bg-gray-300'}`}></div>
                
                <span className={`flex items-center space-x-2 px-3 ${scrolled ? 'text-white' : 'text-gray-700'}`}>
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm hidden lg:inline">Halo, {user.username}</span>
                  <span className="font-medium text-sm lg:hidden">{user.username}</span>
                </span>

                <Link
                  to="/account-settings"
                  className={`relative group p-2 rounded-lg transition-all duration-200 ${
                    scrolled ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Settings
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className={`relative group p-2 rounded-lg transition-all duration-200 ${
                    scrolled ? 'text-white hover:bg-red-500/20' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <>
                <div className={`h-6 w-px mx-2 ${scrolled ? 'bg-white/30' : 'bg-gray-300'}`}></div>
                <Link
                  to="/login"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    scrolled ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Login</span>
                </Link>
                <Link
                  to="/register"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                    scrolled ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <span className="font-medium">Daftar</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-all duration-200 ${
              scrolled ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`space-y-2 border-t pt-4 ${scrolled ? 'border-white/20' : 'border-gray-200'}`}>
            <Link
              to="/"
              className={`block flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive('/') 
                  ? scrolled 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-600 text-white'
                  : scrolled
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/about"
              className={`block flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive('/about') 
                  ? scrolled 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-600 text-white'
                  : scrolled
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Info className="w-4 h-4" />
              <span>Tentang</span>
            </Link>

            {user && (
              <Link
                to="/riwayat"
                className={`block flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/riwayat') 
                    ? scrolled 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-600 text-white'
                    : scrolled
                      ? 'text-white hover:bg-white/20'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <History className="w-4 h-4" />
                <span>Riwayat</span>
              </Link>
            )}

            <Link
              to="/contact"
              className={`block flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive('/contact') 
                  ? scrolled 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-600 text-white'
                  : scrolled
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Phone className="w-4 h-4" />
              <span>Kontak</span>
            </Link>

            {user ? (
              <>
                <div className={`pt-2 border-t flex items-center space-x-2 px-4 py-2 ${
                  scrolled ? 'border-white/20 text-white' : 'border-gray-200 text-gray-700'
                }`}>
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm">Halo, {user.username}</span>
                </div>
                
                <Link
                  to="/account-settings"
                  className={`block w-full text-left flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    scrolled ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Pengaturan</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className={`w-full text-left flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    scrolled ? 'text-white hover:bg-red-500/20' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    scrolled ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className={`block flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md ${
                    scrolled ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>Daftar</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;