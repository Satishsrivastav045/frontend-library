import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchShifts = createAsyncThunk(
  'shift/fetch',
  async () => {
    const res = await API.get('/shifts');
    return res.data.data;
  }
);

export const createShiftThunk = createAsyncThunk(
  'shift/create',
  async (data) => {
    const res = await API.post('/shifts', data);
    return res.data.data;
  }
);

export const updateShiftThunk = createAsyncThunk(
  'shift/update',
  async ({ id, data }) => {
    const res = await API.put(`/shifts/${id}`, data);
    return res.data.data;
  }
);

export const deactivateShiftThunk = createAsyncThunk(
  'shift/deactivate',
  async (id) => {
    const res = await API.put(`/shifts/deactivate/${id}`);
    return res.data.data;
  }
);

export const deleteShiftThunk = createAsyncThunk(
  'shift/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/shifts/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

const shiftSlice = createSlice({
  name: 'shift',
  initialState: { shifts: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.shifts = action.payload;
      })
      .addCase(deleteShiftThunk.fulfilled, (state, action) => {
        state.shifts = state.shifts.filter(s => s._id !== action.payload);
      });
  }
});

export default shiftSlice.reducer;

