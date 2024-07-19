import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import useUpdateEntity from '../../hooks/useUpdateEntity';
import { fetchAndUpdateEntities } from '../../hooks/fetchAndUpdateEntities';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { clearSelection, selectPoint,updateClonedPoint } from '../../store/mapSlice';
import { useMapHandlers } from '../../hooks/useMapHandlers';


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
  const { onPointClick, onClonedPointMove, onClonedPointDrop } = useMapHandlers(mapRef, queryClient, updateEntity, updatePoints);



  const clonedPoint = useSelector(state => state.map.clonedPoint);


//  const movedPointRef = useRef(clonedPoint); 


  useEffect(() => {
//    console.log(clonedPoint)
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

 
      // mapRef.current.on('mousedown', 'cloned-points', (e) => {
      //   console.log(e)
      //   console.log("points choosen", clonedPoint)
      //   e.preventDefault();
      //   mapRef.current.getCanvas().style.cursor = 'grabbing';
      //   mapRef.current.on('mousemove', onClonedPointMove);
      //   mapRef.current.once('mouseup', () => {
      //     mapRef.current.getCanvas().style.cursor = '';
      //     mapRef.current.off('mousemove', onClonedPointMove);
      //     onClonedPointDrop();
      //   });
      // });
    });
  }, [lng, lat, zoom, onMove, pointsData, onDrawCreate, onDrawDelete, routesData, onPointClick, updateRoute]);



  useEffect(() => {
    if (!mapRef.current || !mapRef.current.getSource('cloned-points')) return;

    if (clonedPoint) {
      mapRef.current.getSource('cloned-points').setData({
        type: 'FeatureCollection',
        features: [clonedPoint]
      });
  //    console.log("cloned points should be visible", clonedPoint);
    } else {
      mapRef.current.getSource('cloned-points').setData({
        type: 'FeatureCollection',
        features: []
      });
  //    console.log("cloned points should be hidden");
    }
  }, [clonedPoint]);

  useEffect(() => {
    if (!mapRef.current) return;

    const handleMouseDown = (e) => {
//      console.log(e);
//      console.log("points chosen", clonedPoint);
      e.preventDefault();
      mapRef.current.getCanvas().style.cursor = 'grabbing';
      mapRef.current.on('mousemove', onClonedPointMove);
      mapRef.current.once('mouseup', () => {
        mapRef.current.getCanvas().style.cursor = '';
        mapRef.current.off('mousemove', onClonedPointMove);
//        console.log("clonedPoint", clonedPoint.geometry.coordinates);
//        movedPointRef.current = clonedPoint;
//       console.log(movedPointRef);
       // onClonedPointDrop(clonedPoint, selectedPoints);
        onClonedPointDrop();
      });
    };

    mapRef.current.on('mousedown', 'cloned-points', handleMouseDown);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('mousedown', 'cloned-points', handleMouseDown);
      }
    };
  }, [clonedPoint, onClonedPointMove, onClonedPointDrop]);

  useEffect(() => {
    if (mapRef.current && mapRef.current.getSource('points')) {
      mapRef.current.getSource('points').setData(pointsData);
    }
    if (mapRef.current && mapRef.current.getSource('routes')) {
      mapRef.current.getSource('routes').setData(routesData);
    }
  }, [pointsData, routesData]);


  return <div ref={mapContainer} className="map-container" style={{ width: '80%', height: '600px' }} />;
};

export default MapComponent;
