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
  onDrawCreate,
  onDrawDelete,
  onPointClick,
  updatePoints,
  mapRef,
  drawRef,
  clonedPoint,
  handleClonedPointUpdate,
  routesData,
  updateRoute
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
    //    line_string: true,
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

      if (routesData) {
      mapRef.current.addSource('routes', {
        type: 'geojson',
        data: routesData
      });
      mapRef.current.addLayer({
        id: 'routes',
        type: 'line',
        source: 'routes',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#880000',
          'line-width': 4
        }
      });
    }

      mapRef.current.on('click', 'points', onPointClick);

      mapRef.current.on('mouseenter', 'points', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });

      mapRef.current.on('mouseleave', 'points', () => {
        mapRef.current.getCanvas().style.cursor = '';
      });

      // mapRef.current.on('mouseenter', 'routes', () => {
      //   mapRef.current.getCanvas().style.cursor = 'pointer';
      // });

      // mapRef.current.on('mouseleave', 'routes', () => {
      //   mapRef.current.getCanvas().style.cursor = '';
      // });

      mapRef.current.on('move', onMove);

      mapRef.current.on('draw.create', onDrawCreate);
      mapRef.current.on('draw.update', updateRoute); 
      mapRef.current.on('draw.delete', onDrawDelete);

      mapRef.current.on('mousedown', 'cloned-points', (e) => {
        e.preventDefault();
        mapRef.current.getCanvas().style.cursor = 'grabbing';
        mapRef.current.on('mousemove', onClonedPointMove);
        mapRef.current.once('mouseup', () => {
          mapRef.current.getCanvas().style.cursor = '';
          mapRef.current.off('mousemove', onClonedPointMove);
          onClonedPointDrop();
        });
      });
    });
  }, [lng, lat, zoom, onMove, pointsData, onDrawCreate, onDrawDelete, onPointClick, routesData]);
//  }, [lng, lat, zoom, onMove, pointsData, onDrawCreate, onDrawDelete, onPointClick]);

  useEffect(() => {
    if (mapRef.current && mapRef.current.getSource('points')) {
      mapRef.current.getSource('points').setData(pointsData);
    }
    if (mapRef.current && mapRef.current.getSource('routes')) {
      mapRef.current.getSource('routes').setData(routesData);
      console.log('Updated route data:', routesData);
    }
  }, [pointsData, routesData]);
 // }, [pointsData]);

  const onClonedPointMove = (e) => {
    if (!clonedPointRef.current) return;

    const newCoordinates = [e.lngLat.lng, e.lngLat.lat];

    const updatedClonedPoint = {
      ...clonedPointRef.current,
      geometry: {
        ...clonedPointRef.current.geometry,
        coordinates: newCoordinates
      }
    };

    mapRef.current.getSource('cloned-points').setData({
      type: 'FeatureCollection',
      features: [updatedClonedPoint]
    });

    handleClonedPointUpdate(updatedClonedPoint);
  };

  const onClonedPointDrop = async () => {
    if (!clonedPointRef.current) return;

    const updatedCoordinates = clonedPointRef.current.geometry.coordinates;
    const originalPointId = clonedPointRef.current.properties.id;

    const originalPoint = pointsData.features.find(point => point.properties.id === originalPointId);
    const updatedEntity = {
      persistent: {
        id: originalPoint.properties.id,
        creator: originalPoint.properties.creator
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
