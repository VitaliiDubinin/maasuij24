// // LinksComponent.js
// import React, { useEffect } from 'react';

// const LinksComponent = ({ mapRef, linksData }) => {
//   useEffect(() => {
//     if (!mapRef.current || !linksData) return;

//     if (mapRef.current.getSource('links')) {
//       mapRef.current.getSource('links').setData(linksData);
//     } else {
//       mapRef.current.addSource('links', {
//         type: 'geojson',
//         data: linksData
//       });

//       mapRef.current.addLayer({
//         id: 'links',
//         type: 'line',
//         source: 'links',
//         layout: {
//           'line-join': 'round',
//           'line-cap': 'round'
//         },
//         paint: {
//           'line-color': '#888',
//           'line-width': 8
//         }
//       });
//     }
//   }, [mapRef, linksData]);

//   return null;
// };

// export default LinksComponent;

// LinksComponent.js


// import React, { useEffect } from 'react';

// const LinksComponent = ({ mapRef, linksData }) => {
//   console.log("from Link component",linksData)
//   useEffect(() => {
//     if (!mapRef.current || !linksData) return;

//     // Validate linksData
//     const isValidGeoJSON = validateGeoJSON(linksData);
//     if (!isValidGeoJSON) {
//       console.error("Invalid GeoJSON data:", linksData);
//       return;
//     }

//     if (mapRef.current.getSource('links')) {
//       mapRef.current.getSource('links').setData(linksData);
//     } else {
//       mapRef.current.addSource('links', {
//         type: 'geojson',
//         data: linksData
//       });

//       mapRef.current.addLayer({
//         id: 'links',
//         type: 'line',
//         source: 'links',
//         layout: {
//           'line-join': 'round',
//           'line-cap': 'round'
//         },
//         paint: {
//           'line-color': '#888',
//           'line-width': 8
//         }
//       });
//     }
//   }, [mapRef, linksData]);

//   return null;
// };

// const validateGeoJSON = (geojson) => {
//   if (!geojson || geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
//     return false;
//   }

//   return geojson.features.every(feature => {
//     if (feature.type !== 'Feature' || !feature.geometry || feature.geometry.type !== 'LineString') {
//       return false;
//     }

//     const coordinates = feature.geometry.coordinates;
//     if (!Array.isArray(coordinates) || coordinates.length !== 2) {
//       return false;
//     }

//     return coordinates.every(coord => Array.isArray(coord) && coord.length === 2 && coord.every(num => typeof num === 'number'));
//   });
// };

// export default LinksComponent;


const LinksComponent = ({ mapRef}) => {
  return null; // This component does not render anything directly
};

export default LinksComponent;

