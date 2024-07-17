
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedPoints: [],
  clonedPoint: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    selectPoint: (state, action) => {
      const { point } = action.payload;
      const pointIndex = state.selectedPoints.findIndex(p => p.id === point.id);

      if (pointIndex !== -1) {
        state.selectedPoints = state.selectedPoints.filter(p => p.id !== point.id);
        state.clonedPoint = null;
      } else {
        state.selectedPoints.push(point);
        state.clonedPoint = point;
      }

      if (state.selectedPoints.length > 2) {
        state.selectedPoints = [point];
      }
    },
    clearSelection: (state) => {
      state.selectedPoints = [];
      state.clonedPoint = null;
    },
    updateClonedPoint: (state, action) => {
      state.clonedPoint = action.payload.clonedPoint;
    },
  }
});

export const { selectPoint, clearSelection, updateClonedPoint } = mapSlice.actions;

export default mapSlice.reducer;


