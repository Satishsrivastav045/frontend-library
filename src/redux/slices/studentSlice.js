import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// 🔹 Get all active students
export const fetchStudents = createAsyncThunk(
  'students/fetch',
  async () => {
    const res = await API.get('/students');
    return res.data.data;
  }
);

// 🔹 Create student
export const createStudent = createAsyncThunk(
  'students/create',
  async (student) => {
    const res = await API.post('/students', student);
    return res.data.data;
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState: {
    loading: false,
    students: []
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.students.unshift(action.payload);
      });
  }
});

export default studentSlice.reducer;
