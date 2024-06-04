// hooks/useGetEntity.js
import { useQuery } from '@tanstack/react-query';
 import { getData } from '../fetch';

// export const useGetEntity = () => {
//   return useQuery({
//     queryKey: ['spoints'],
//     queryFn: async () => {
//       const response = await getData('stop-point/find-all');
//       console.log(response)
//       return response.data;
//     },
//     refetchOnWindowFocus: false,
//   });
// };

//import { useGetEntity } from '../../../lib/hooks/useGetEntity';

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

export const useGetEntity = () => {
  return useQuery({
    queryKey: ['spoints'],
    queryFn: async () => {
      const response = await getData('stop-point/find-all');
      return convertToGeoJSON(response.data);
    },
    refetchOnWindowFocus: false,
  });
};