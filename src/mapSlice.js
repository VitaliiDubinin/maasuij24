
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
     // const pointIndex = state.selectedPoints.findIndex(p => p.id === point.id);
     // console.log(pointIndex)
      // if (pointIndex !== -1) {
      //   state.selectedPoints = state.selectedPoints.filter(p => p.id !== point.id);
      //   console.log(state.selectedPoints)
      //   state.clonedPoint = null;
      // } else {
      //  console.log("point pushed")
        state.selectedPoints.push(point);
        state.clonedPoint = point;
  //    }

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
//     createLinkAndRoute: (state) => {
//       //console.log(state.selectedPoints)
// //      console.log(state.selectedPoints.length)
//       if (state.selectedPoints.length === 1) {
//         console.log("the Link and Route will be created there")
//         // Add your logic here to create a link and route using the selected points
//         // Clear the selection after creating the link and route
//         state.selectedPoints = [];
//         state.clonedPoint = null;
//       }
//     },
  }
});

export const { selectPoint, clearSelection, updateClonedPoint, createLinkAndRoute } = mapSlice.actions;

export default mapSlice.reducer;


