// // hooks/useGetLinks.js
// import { useQuery } from '@tanstack/react-query';
//  import { getData } from '../fetch';



// const convertToGeoJSON = (data) => {
//   return {
//     type: 'FeatureCollection',
//     features: data.map(item => ({
//       type: 'Feature',
//       finishPointId:item.finishPointId, 
//       isProductive:item.isProductive, 
//       number:item.number, 
//       startPointId:item.startPointId, 
//       stored: {
//         id: item.stored.id,
//         active: item.stored.active,
//         creator: item.stored.creator
//       }
//     }))
//   };
// };


// //export const useGetLinks = () => {
// const useGetLinks = () => {
//   return useQuery({
//     queryKey: ['links'],
//     queryFn: async () => {
//       const response = await getData('link/find-all');
//            console.log("from useGelLinks",response)
//  //     return convertToGeoJSON(response.data);
//       return response.data
//     },
//     refetchOnWindowFocus: false,
//   });
// };
// export default useGetLinks;

// hooks/useGetLinks.js
import { useQuery } from '@tanstack/react-query';
import { getData } from '../fetch';

// Convert the link data to GeoJSON, including the coordinates of the stop points
const convertLinksToGeoJSON = (links, stopPoints) => {
  const stopPointMap = new Map();
  
  // Create a map of stop points for easy lookup
  stopPoints.forEach(point => {
    stopPointMap.set(point.persistent.id, point);
  });

  return {
    type: 'FeatureCollection',
    features: links.map(link => {
      const startPoint = stopPointMap.get(link.startPointId);
      const finishPoint = stopPointMap.get(link.finishPointId);

      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [startPoint.point.x, startPoint.point.y],
            [finishPoint.point.x, finishPoint.point.y]
          ]
        },
        properties: {
          id:`link${link.stored.id}`
          // finishPointId: link.finishPointId,
          // isProductive: link.isProductive,
          // number: link.number,
          // startPointId: link.startPointId,
          // stored: {
          //   id: link.stored.id,
          //   active: link.stored.active,
          //   creator: link.stored.creator
          // }
        }
      };
    })
  };
};



// Custom hook to fetch link data and map to related stop points
export const useGetLinks = () => {
  return useQuery({
    queryKey: ['links', 'stopPoints'],
    queryFn: async () => {
      const [linkResponse, stopPointResponse] = await Promise.all([
        getData('link/find-all'),
        getData('stop-point/find-all')
      ]);

      const links = linkResponse.data;
      const stopPoints = stopPointResponse.data;

      return convertLinksToGeoJSON(links, stopPoints);
    },
    refetchOnWindowFocus: false,
  });
};

export default useGetLinks;

