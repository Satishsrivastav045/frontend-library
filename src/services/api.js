import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =========================
   DASHBOARD
========================= */
export const getTotalSeats = () =>
  API.get('/seats/count/total');

export const getAvailableSeats = () =>
  API.get('/seats?status=available');

/* =========================
   ADMIN AUTH
========================= */
export const adminRegister = (data) =>
  API.post('/admin/register', data);

export const adminLogin = (data) =>
  API.post('/admin/login', data);

/* =========================
   BOOKINGS
========================= */
export const getBookings = () =>
  API.get('/bookings');

export const createBooking = (data) =>
  API.post('/bookings', data);

/* =========================
   PAYMENTS
========================= */
export const markPaymentPaid = (paymentId) =>
  API.put(`/payments/paid/${paymentId}`);

/* =========================
   SEATS
========================= */
export const getSeats = () =>
  API.get('/seats');

// 🔥 SHIFT wise seats (with optional date filtering)
export const getSeatsByShift = (shiftId, bookingDate = '') =>
  API.get(`/seats/shift/${shiftId}${bookingDate ? `?bookingDate=${bookingDate}` : ''}`);

/* =========================
   SHIFTS
========================= */
export const getShifts = () =>
  API.get('/shifts');

export const createShift = (data) =>
  API.post('/shifts', data);

export const updateShift = (id, data) =>
  API.put(`/shifts/${id}`, data);

export const deactivateShift = (id) =>
  API.put(`/shifts/deactivate/${id}`);
export const deleteShift = (id) =>
  API.delete(`/shifts/${id}`);


/* =========================
   STUDENTS
========================= */
export const getStudents = () =>
  API.get('/students');

export const createStudent = (data) =>
  API.post('/students', data);

export const deleteStudent = (id) =>
  API.delete(`/students/${id}`);

export default API;
