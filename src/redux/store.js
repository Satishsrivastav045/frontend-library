import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import studentReducer from './slices/studentSlice';
import shiftReducer from './slices/shiftSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    students: studentReducer,
    shift: shiftReducer
  }
});
