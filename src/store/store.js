// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import mapReducer from './mapSlice';

const store = configureStore({
  reducer: {
    map: mapReducer,
  },
});

export default store;
