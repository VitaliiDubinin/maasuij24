import { useQueryClient } from '@tanstack/react-query';
import { getData } from '../fetch';

const convertToGeoJSON = (data) => {
    return {
      type: 'FeatureCollection',
      features: data.map(item => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.point.x, item.point.y]
        },
        properties: {
          id: `point${item.persistent.id}`,
  //        id: item.persistent.id,
          name: item.persistent.name
        }
      }))
    };
  };

  
  // Function to fetch and update entities
  export const fetchAndUpdateEntities = async (queryClient) => {
    const response = await getData('stop-point/find-all');
    const newPointsData = convertToGeoJSON(response.data);
//    console.log("newPointsData from fetch",newPointsData)
    queryClient.setQueryData(['spoints'], newPointsData);
    return newPointsData;
  };
  