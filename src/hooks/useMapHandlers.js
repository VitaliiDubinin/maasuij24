import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { clearSelection, selectPoint, updateClonedPoint, createLinkAndRoute } from '../store/mapSlice';
import { fetchAndUpdateEntities } from './fetchAndUpdateEntities';

export const useMapHandlers = (mapRef, queryClient, updateEntity, updatePoints) => {
  const dispatch = useDispatch();
  const clonedPointRef = useRef();
  const selectedPointsRef = useRef([]);
  const clonedPoint = useSelector(state => state.map.clonedPoint);
  const selectedPoints = useSelector(state => state.map.selectedPoints);
  //const pointsData = useSelector(state => state.map.pointsData);


useEffect(() => {
  clonedPointRef.current = clonedPoint;
  selectedPointsRef.current = selectedPoints;
}, [clonedPoint, selectedPoints]);


  const onPointClick = (e) => {
    const feature = e.features[0];
    const newClonedPoint = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: feature.geometry.coordinates.slice()
      },
      properties: {
        id: feature.properties.id,
        name: feature.properties.name,
        creator: feature.properties.creator
      }
    };
//    console.log("newClonedPoint",newClonedPoint)
    if (clonedPoint && clonedPoint.properties.id === feature.properties.id) {
      dispatch(clearSelection());

//   } else if (selectedPointsRef.current.length === 1) {

// //    console.log("SECOND point choosen")
// //    console.log("newClonedPoint",newClonedPoint)
//       dispatch(selectPoint({ point: newClonedPoint }));
// //      dispatch(createLinkAndRoute());
    } else {
      dispatch(selectPoint({ point: newClonedPoint }));
    }

  

    if (mapRef.current) {
      const isSelected = mapRef.current.getFeatureState({
        source: 'points',
        id: feature.properties.id
      }).selected;

      mapRef.current.setFeatureState(
        { source: 'points', id: feature.properties.id },
        { selected: !isSelected }
      );
    }
  };

  const onClonedPointMove = (e) => {
    if (!clonedPoint) return;
    const newCoordinates = [e.lngLat.lng, e.lngLat.lat];
    const updatedClonedPoint = {
      ...clonedPoint,
      geometry: {
        ...clonedPoint.geometry,
        coordinates: newCoordinates
      }
    };
    mapRef.current.getSource('cloned-points').setData({
      type: 'FeatureCollection',
      features: [updatedClonedPoint]
    });

    dispatch(updateClonedPoint({ clonedPoint: updatedClonedPoint }));
  };


  const onClonedPointDrop = async () => {
    if (!clonedPoint) return;

    const selectedPoint = selectedPointsRef.current[0];
    if (!selectedPoint) return;

    const updatedCoordinates = clonedPointRef.current.geometry.coordinates;


    const updatedEntity = {
      persistent: {
        id: selectedPoints[0].properties.id,
        creator: selectedPoints[0].properties.creator
      },
      point: {
        x: updatedCoordinates[0],
        y: updatedCoordinates[1]
      }
    };

    updateEntity.mutate(updatedEntity, {
      onSuccess: async () => {
        const updatedPointsData = await fetchAndUpdateEntities(queryClient);
        updatePoints(updatedPointsData);
        if (mapRef.current.getSource('cloned-points')) {
          mapRef.current.getSource('cloned-points').setData({
            type: 'FeatureCollection',
            features: []
          });
        }
        dispatch(clearSelection());
      },
      onError: (error) => {
        console.error("Error updating point:", error);
      }
    });
  };

  return { onPointClick, onClonedPointMove, onClonedPointDrop };
};
