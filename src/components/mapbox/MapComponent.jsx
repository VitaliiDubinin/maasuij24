import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import useUpdateEntity from '../../lib/hooks/useUpdateEntity';
import { fetchAndUpdateEntities } from '../../lib/hooks/fetchAndUpdateEntities';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useQueryClient } from '@tanstack/react-query';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapComponent = ({
  lng,
  lat,
  zoom,
  onMove,
  pointsData,
  linesData,
  onDrawCreate,
  onDrawDelete,
  onPointClick,
  onLineClick,
  updatePoints,
  mapRef,
  drawRef,
  clonedPoint,
  handleClonedPointUpdate
}) => {
  const queryClient = useQueryClient();
  const mapContainer = useRef(null);
  const updateEntity = useUpdateEntity();
  const clonedPointRef = useRef(clonedPoint);

  useEffect(() => {
    clonedPointRef.current = clonedPoint;
  }, [clonedPoint]);

  useEffect(() => {
    if (mapRef.current) return; // initialize map only once
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    mapRef.current.loadImage('/airport-15.png', function (error, image) {
      if (error) throw error;
      mapRef.current.addImage('airport-15', image);
    });

    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        trash: true
      }
    });
    mapRef.current.addControl(drawRef.current);

    mapRef.current.on('load', () => {
      mapRef.current.addSource('points', {
        type: 'geojson',
        data: pointsData
      });
      mapRef.current.addLayer({
        id: 'points',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': 10,
          'circle-color': '#F84C4C' // red color
        }
      });

      mapRef.current.addSource('cloned-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
      mapRef.current.addLayer({
        id: 'cloned-points',
        type: 'circle',
        source: 'cloned-points',
        paint: {
          'circle-radius': 10,
          'circle-color': '#00FF00' // green color for cloned points
        }
      });

      mapRef.current.addSource('lines', {
        type: 'geojson',
        data: linesData
      });
      mapRef.current.addLayer({
        id: 'lines',
        type: 'line',
        source: 'lines',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': 'hsl(0, 0%, 13%)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 1, 10, 2],
          'line-dasharray': [0, 3],
        }
      });

      mapRef.current.addLayer({
        id: 'directions',
        type: 'symbol',
        source: 'lines',
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 50,
          'icon-image': 'airport-15', // Use a built-in icon that looks like an arrow
          'icon-size': 1.2,
          'icon-offset': [0, -1],
          'icon-rotate': 90,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });

      // Add click event handler for points
      mapRef.current.on('click', 'points', onPointClick);

      // Add click event handler for lines
      mapRef.current.on('click', 'lines', onLineClick);

      mapRef.current.on('mouseenter', 'points', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });

      mapRef.current.on('mouseleave', 'points', () => {
        mapRef.current.getCanvas().style.cursor = '';
      });

      mapRef.current.on('mouseenter', 'lines', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });

      mapRef.current.on('mouseleave', 'lines', () => {
        mapRef.current.getCanvas().style.cursor = '';
      });

      mapRef.current.on('move', onMove);

      mapRef.current.on('draw.create', onDrawCreate);
      mapRef.current.on('draw.delete', onDrawDelete);

      // Make cloned points draggable
      mapRef.current.on('mousedown', 'cloned-points', (e) => {
        e.preventDefault(); // Prevent default map drag behavior
        mapRef.current.getCanvas().style.cursor = 'grabbing';
        mapRef.current.on('mousemove', onClonedPointMove);
        mapRef.current.once('mouseup', () => {
          mapRef.current.getCanvas().style.cursor = '';
          mapRef.current.off('mousemove', onClonedPointMove);
          onClonedPointDrop();
        });
      });
    });

  }, [pointsData, linesData]);

  const onClonedPointMove = (e) => {
  //  console.log("try to move cloned point", clonedPointRef.current);
    if (!clonedPointRef.current) return;
  //  console.log("Moving cloned point");

    const newCoordinates = [e.lngLat.lng, e.lngLat.lat];

    const updatedClonedPoint = {
      ...clonedPointRef.current,
      geometry: {
        ...clonedPointRef.current.geometry,
        coordinates: newCoordinates
      }
    };

  //  console.log("Updated cloned point coordinates", newCoordinates);

    mapRef.current.getSource('cloned-points').setData({
      type: 'FeatureCollection',
      features: [updatedClonedPoint]
    });

    handleClonedPointUpdate(updatedClonedPoint); // Update the state with the new coordinates
  };

  const onClonedPointDrop = async () => {
    if (!clonedPointRef.current) return;
  //  console.log("Dropping cloned point");

    const updatedCoordinates = clonedPointRef.current.geometry.coordinates;
    const originalPointId = clonedPointRef.current.properties.id;

    // Update the original point with new coordinates
    const originalPoint = pointsData.features.find(point => point.properties.id === originalPointId);
    const cleanedId = originalPoint.properties.id.replace("point", "");
    // const updatedEntity = {
    //   ...originalPoint,
    //   geometry: {
    //     ...originalPoint.geometry,
    //     coordinates: updatedCoordinates
    //   }
    // };
    const updatedEntity = {
     // ...originalPoint,
     persistent:{
//      id: cleanedId,
      id: originalPoint.properties.id,
      creator: originalPoint.properties.creator},
    point: {
        //...originalPoint.geometry,
        x: updatedCoordinates[0],
        y: updatedCoordinates[1],
        //coordinates: updatedCoordinates
      }
    };

//console.log("updatedEntity",updatedEntity)
    updateEntity.mutate(updatedEntity, {
      onSuccess: async () => {
    //    console.log("Point updated successfully, fetching new data.");
        const berta = await fetchAndUpdateEntities(queryClient);
        updatePoints(berta);
        // Remove the cloned point
        mapRef.current.getSource('cloned-points').setData({
          type: 'FeatureCollection',
          features: []
        });
        handleClonedPointUpdate(null);
      },
      onError: (error) => {
        console.error("Error updating point:", error);
      }
    });
  };

  return <div ref={mapContainer} className="map-container" style={{ width: '80%', height: '600px' }} />;
};

export default MapComponent;
