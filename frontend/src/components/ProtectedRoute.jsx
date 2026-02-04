import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // Hanya cek apakah user sudah login atau belum
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika sudah login, render halaman yang diminta
  return children;
};

export default ProtectedRoute;