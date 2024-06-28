
// import React, { useEffect } from 'react';
// import { useQueryClient, useQuery } from '@tanstack/react-query';
// import { getData } from '../../lib/fetch';

// const convertStoPointsGeoJSON = (data) => {
//   return {
//     type: 'FeatureCollection',
//     features: data.map(item => ({
//       type: 'Feature',
//       geometry: {
//         type: 'Point',
//         coordinates: [item.point.x, item.point.y]
//       },
//       properties: {
//         id: `point${item.persistent.id}`,
// //        id: item.persistent.id,
//         name: item.persistent.name,
//         creator: item.persistent.creator
//       }
//     }))
//   };
// };

// const convertLinksToGeoJSON = (links, stopPoints) => {
//   const stopPointMap = new Map();
  
//   // Create a map of stop points for easy lookup
//   stopPoints.forEach(point => {
//     stopPointMap.set(point.persistent.id, point);
//   });

//   return {
//     type: 'FeatureCollection',
//     features: links.map(link => {
//       const startPoint = stopPointMap.get(link.startPointId);
//       const finishPoint = stopPointMap.get(link.finishPointId);

//       return {
//         type: 'Feature',
//         geometry: {
//           type: 'LineString',
//           coordinates: [
//             [startPoint.point.x, startPoint.point.y],
//             [finishPoint.point.x, finishPoint.point.y]
//           ]
//         },
//         properties: {
//           id:`link${link.stored.id}`
//           // finishPointId: link.finishPointId,
//           // isProductive: link.isProductive,
//           // number: link.number,
//           // startPointId: link.startPointId,
//           // stored: {
//           //   id: link.stored.id,
//           //   active: link.stored.active,
//           //   creator: link.stored.creator
//           // }
//         }
//       };
//     })
//   };
// };



// const fetchAllData = async () => {
//   const [linksResponse, stopPointsResponse] = await Promise.all([
//     getData('link/find-all'),
//     getData('stop-point/find-all')
//   ]);

//   return {
//     linksData: convertLinksToGeoJSON(linksResponse.data),
//     stopPointsData: convertStoPointsGeoJSON(stopPointsResponse.data)
//   };
// };

// const DataLoader = ({ children }) => {
//   const queryClient = useQueryClient();

//   const { data, isLoading, error } = useQuery({
//     queryKey: 'initialData',
//     queryFn: fetchAllData,
//     refetchOnWindowFocus: false,
//   });

//   useEffect(() => {
//     if (data) {
//       queryClient.setQueryData('links', data.linksData);
//       queryClient.setQueryData('spoints', data.stopPointsData);
//     }
//   }, [data, queryClient]);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error loading initial data: {error.message}</div>;
//   }

//   return <>{children}</>;
// };

// export default DataLoader;