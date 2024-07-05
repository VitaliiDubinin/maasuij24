import { useQuery } from '@tanstack/react-query';
import { getData } from '../fetch';

// const convertToGeoJSON = (data) => {
//   return {
//     type: 'FeatureCollection',
//     features: data.map(item => ({
//       type: 'Feature',
//       linkId : item.linkId,
//       active: item.stored.active,
//       id: item.stored.id,
//       // linkPoints:item.linkPoints.map(point =>({
//       //   pointNum:point.number,
//       //   coord:point.coordinates
//       // })
//       // )
//       linkPoints:item.linkPoints.map(point =>({
//       pointNum:point.number,
//       coord:point.coordinates
//       })
//       )
//     }))
//   };
// };

// const convertToGeoJSON = (data) => {
//   return {
//     type: 'FeatureCollection',
//     features: data.map(item => ({
//       type: 'Feature',
//       geometry: {
//         type: 'LineString',
//   //      coordinates: item.linkPoints.map(point => point.coordinates)
//   coordinates: item.linkPoints.map(point => [point.coordinates.x, point.coordinates.y])
//       },
//       properties: {
//         linkId: item.linkId,
//         active: item.stored.active,
//         id: item.stored.id,
//         linkPoints: item.linkPoints.map(point => ({
//           pointNum: point.number,
//           coord: point.coordinates
//         }))
//       }
//     }))
//   };
// };


const convertToGeoJSON = (data) => {
  return {
    type: 'FeatureCollection',
    features: data.map(item => {
      console.log("item",item)
      const linkPointsWithStartFinish = [
        {
          pointNum: 0, 
          coord: item.startPoint.point
        },
        ...item.linkPoints.map(point => ({
          pointNum: point.number,
          coord: point.coordinates
        })),
        {
          pointNum: item.linkPoints.length + 1, 
          coord: item.finishPoint.point
        }
      ];

      const coordinatesWithStartFinish = [
        [item.startPoint.point.x, item.startPoint.point.y],
        ...item.linkPoints.map(point => [point.coordinates.x, point.coordinates.y]),
        [item.finishPoint.point.x, item.finishPoint.point.y]
      ];
      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          // coordinates: item.linkPoints.map(point => [point.coordinates.x, point.coordinates.y])
          coordinates: coordinatesWithStartFinish,
        },
        properties: {
          linkId: item.linkId,
          active: item.stored.active,
          id: item.stored.id,
          linkPoints: linkPointsWithStartFinish
        }
      };
    })
  };
};






export const useGetRoutes = () => {
  return useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const response = await getData('link-path/find-all');
      console.log("response",response)
      return convertToGeoJSON(response.data);
    },
    refetchOnWindowFocus: false,
  });
};