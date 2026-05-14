import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

/* =========================
   FETCH DASHBOARD CARDS
========================= */
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    const totalSeatsRes = await API.get('/seats/count/total');
    const availableSeatsRes = await API.get('/seats?status=available');

    return {
      totalSeats: totalSeatsRes.data.totalSeats || 0,
      availableSeats: availableSeatsRes.data.total || 0
    };
  }
);

/* =========================
   FETCH BOOKINGS
========================= */
export const fetchBookings = createAsyncThunk(
  'dashboard/fetchBookings',
  async () => {
    const res = await API.get('/bookings');
    return res.data.data;
  }
);

/* =========================
   MARK PAYMENT AS PAID (NO RELOAD)
========================= */
export const markPaymentPaidThunk = createAsyncThunk(
  'dashboard/markPaymentPaid',
  async (paymentId) => {
    const res = await API.put(`/payments/paid/${paymentId}`);
    return res.data.data; // updated payment
  }
);

/* =========================
   SLICE
========================= */
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    loading: false,
    totalSeats: 0,
    availableSeats: 0,
    bookings: []
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* DASHBOARD CARDS */
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.totalSeats = action.payload.totalSeats;
        state.availableSeats = action.payload.availableSeats;
      })

      /* BOOKINGS */
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      })

      /* MARK PAYMENT PAID (🔥 IMPORTANT) */
      .addCase(markPaymentPaidThunk.fulfilled, (state, action) => {
        const updatedPayment = action.payload;

        state.bookings = state.bookings.map(b =>
          b.paymentId && b.paymentId._id === updatedPayment._id
            ? { ...b, paymentId: updatedPayment }
            : b
        );
      });
  }
});

export default dashboardSlice.reducer;

