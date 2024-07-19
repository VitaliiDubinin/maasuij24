import { useSelector, useDispatch } from 'react-redux';
import { clearSelection, selectPoint, updateClonedPoint } from '../../mapSlice';
import { fetchAndUpdateEntities } from '../../lib/hooks/fetchAndUpdateEntities';

export const useClonedPointMoveHandler = (mapRef, queryClient, updateEntity, updatePoints) => {
  const dispatch = useDispatch();
  const clonedPoint = useSelector(state => state.map.clonedPoint);
  const pointsData = useSelector(state => state.map.pointsData);



  const onClonedPointMove = (e) => {
    console.log(clonedPoint)
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



  return {onClonedPointMove };
};
