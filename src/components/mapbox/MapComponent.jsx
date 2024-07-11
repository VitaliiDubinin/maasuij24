import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import useUpdateEntity from '../../lib/hooks/useUpdateEntity';
import { fetchAndUpdateEntities } from '../../lib/hooks/fetchAndUpdateEntities';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { clearSelection, selectPoint,updateClonedPoint } from '../../mapSlice';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapComponent = ({
  lng,
  lat,
  zoom,
  onMove,
  pointsData,
  onDrawCreate,
  onDrawDelete,
  updatePoints,
  mapRef,
  drawRef,
  handleClonedPointUpdate,
  routesData,
  updateRoute
}) => {
  const queryClient = useQueryClient();
  const mapContainer = useRef(null);
  const updateEntity = useUpdateEntity();
  const dispatch = useDispatch();

  const clonedPoint = useSelector(state => state.map.clonedPoint);

 
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
  
    if (clonedPoint && clonedPoint.properties.id === feature.properties.id) {
      // Deselect the point if it's already selected
      dispatch(clearSelection());
    } else {
      // Select the point and set it as the cloned point
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
  
  console.log("clonedPoint",clonedPoint)
  
  const onClonedPointMove = (e) => {
    console.log("from onClonedPointMove 1",e)
    console.log("from onClonedPointMove 11",clonedPoint)

    if (!clonedPoint) return;

    console.log("from onClonedPointMove 2")

    const newCoordinates = [e.lngLat.lng, e.lngLat.lat];

    const updatedClonedPoint = {
      ...clonedPoint,
      geometry: {
        ...clonedPoint.geometry,
        coordinates: newCoordinates
      }
    };
    console.log(updatedClonedPoint)
    mapRef.current.getSource('cloned-points').setData({
      type: 'FeatureCollection',
      features: [updatedClonedPoint]
    });

    dispatch(updateClonedPoint({ clonedPoint: updatedClonedPoint }));
  };

  const onClonedPointDrop = async () => {
    if (!clonedPoint) return;

    const updatedCoordinates = clonedPoint.geometry.coordinates;
    const originalPointId = clonedPoint.properties.id;

    const originalPoint = pointsData.features.find(point => point.properties.id === originalPointId);
    if (!originalPoint) return;

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
        },
        before: 'points'
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
  }, [lng, lat, zoom, onMove, pointsData, onDrawCreate, onDrawDelete, routesData]);

  useEffect(() => {
    if (mapRef.current && mapRef.current.getSource('points')) {
      mapRef.current.getSource('points').setData(pointsData);
    }
    if (mapRef.current && mapRef.current.getSource('routes')) {
      mapRef.current.getSource('routes').setData(routesData);
    }
  }, [pointsData, routesData]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.getSource('cloned-points')) return;

    if (clonedPoint) {
      mapRef.current.getSource('cloned-points').setData({
        type: 'FeatureCollection',
        features: [clonedPoint]
      });
      console.log("cloned points should be visible", clonedPoint);
    } else {
      mapRef.current.getSource('cloned-points').setData({
        type: 'FeatureCollection',
        features: []
      });
      console.log("cloned points should be hidden");
    }
  }, [clonedPoint]);




  return <div ref={mapContainer} className="map-container" style={{ width: '80%', height: '600px' }} />;
};

export default MapComponent;
