import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');

  // ❌ Agar login nahi hai
  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  // ✅ Agar login hai
  return children;
};

export default ProtectedRoute;
