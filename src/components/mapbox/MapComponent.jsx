import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

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
  onDrawUpdate,
  onPointClick,
  onLineClick,
  draggedPointId,
  setDraggedPointId,
  updatePoints,
  mapRef,
  drawRef
}) => {
  const mapContainer = useRef(null);

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
    });

    mapRef.current.on('move', onMove);

    mapRef.current.on('draw.create', onDrawCreate);
    mapRef.current.on('draw.delete', onDrawDelete);
    mapRef.current.on('draw.update', onDrawUpdate);

    // Make points draggable
    mapRef.current.on('mousedown', 'points', (e) => {
      const pointId = e.features[0].properties.id;
      setDraggedPointId(pointId);
      mapRef.current.getCanvas().style.cursor = 'grabbing';
      mapRef.current.on('mousemove', onDrag);
      mapRef.current.once('mouseup', onDrop);
    });

    const onDrag = (e) => {
      if (!draggedPointId) return;

      const newCoords = [e.lngLat.lng, e.lngLat.lat];
      const updatedFeatures = pointsData.features.map((feature) => {
        if (feature.properties.id === draggedPointId) {
          feature.geometry.coordinates = newCoords;
        }
        return feature;
      });

      const updatedData = {
        ...pointsData,
        features: updatedFeatures
      };

      updatePoints(updatedData);
      mapRef.current.getSource('points').setData(updatedData);
    };

    const onDrop = () => {
      setDraggedPointId(null);
      mapRef.current.getCanvas().style.cursor = '';
      mapRef.current.off('mousemove', onDrag);
      updatePoints();
    };

  }, [draggedPointId, pointsData, linesData]);

  return <div ref={mapContainer} className="map-container" style={{ width: '80%', height: '600px' }} />;
};

export default MapComponent;
