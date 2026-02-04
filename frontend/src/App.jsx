import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DataDiri from './pages/DataDiri';
import Konsultasi from './pages/Konsultasi';
import HasilDiagnosa from './pages/HasilDiagnosa';
import RiwayatUser from './pages/RiwayatUser';
import AccountSettings from './pages/AccountSettings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-20">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
              <Route
                path="/data-diri"
                element={
                  <ProtectedRoute>
                    <DataDiri />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/konsultasi"
                element={
                  <ProtectedRoute>
                    <Konsultasi />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hasil-diagnosa"
                element={
                  <ProtectedRoute>
                    <HasilDiagnosa />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/riwayat"
                element={
                  <ProtectedRoute>
                    <RiwayatUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account-settings"
                element={
                  <ProtectedRoute>
                    <AccountSettings />
                  </ProtectedRoute>
                }
              />

              {/* 404 → Arahkan ke Home */}
             <Route path="/riwayat-user" element={<RiwayatUser />} />

            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;