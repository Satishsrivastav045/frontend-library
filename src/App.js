import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Shifts from './pages/Shifts';
import Seats from './pages/Seats';
import Payments from './pages/Payments';
import Bookings from './pages/Bookings';
import StudentBooking from './pages/StudentBooking';
import AdminProfile from './pages/AdminProfile';
import AdminAuth from './pages/AdminAuth';

import Layout from './components/Layout';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔓 PUBLIC ROUTES (NO SIDEBAR) */}
        <Route path="/admin" element={<AdminAuth />} />

        {/* 🔐 PROTECTED ROUTES (WITH SIDEBAR) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Layout>
                <Students />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/shifts"
          element={
            <ProtectedRoute>
              <Layout>
                <Shifts />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/seats"
          element={
            <ProtectedRoute>
              <Layout>
                <Seats />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Layout>
                <Bookings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Layout>
                <Payments />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-booking"
          element={
            <ProtectedRoute>
              <StudentBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-profile"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
