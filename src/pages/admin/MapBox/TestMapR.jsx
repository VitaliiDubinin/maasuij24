import React, { useState, useRef, useEffect } from "react";
import { useGetEntity } from '../../../lib/hooks/useGetEntity';
import useCreateEntity from '../../../lib/hooks/useCreateEntity';
import useDeleteEntity from '../../../lib/hooks/useDeleteEntity';
import useCreateLink from '../../../lib/hooks/useCreateLink';
import { fetchAndUpdateEntities } from '../../../lib/hooks/fetchAndUpdateEntities';
import MapComponent from "../../../components/mapbox/MapComponent";
import PointsComponent from "../../../components/mapbox/PointsComponent";
import Sidebar from "../../../components/mapbox/SideBar";
import InfoBox from "../../../components/mapbox/InfoBox";
import { useQueryClient } from '@tanstack/react-query';

const TestMap = () => {
  const queryClient = useQueryClient();
  const { data: pointsData, isLoading, error } = useGetEntity();
  const createEntity = useCreateEntity();
  const deleteEntity = useDeleteEntity();
  const createLink = useCreateLink();

  const [lng, setLng] = useState(27.6);
  const [lat, setLat] = useState(42.6);
  const [zoom, setZoom] = useState(9);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [clonedPoint, setClonedPoint] = useState(null); 
  const [isLinkCreating, setIsLinkCreating] = useState(false);

  const map = useRef(null);
  const draw = useRef(null);

  useEffect(() => {
    if (!isLoading && pointsData) {
      if (map.current && map.current.getSource('points')) {
        map.current.getSource('points').setData(pointsData);
      }
    }
  }, [isLoading, pointsData]);

  useEffect(() => {
//    console.log({selectedPoints,isLinkCreating})
    if (selectedPoints.length === 2 && !isLinkCreating) {
      setIsLinkCreating(true);
//      console.log("Creating Link between", selectedPoints);
      createLink.mutate(selectedPoints, {
        onSuccess: async () => {
//          console.log("Link created successfully");
          setIsLinkCreating(false);
          setSelectedPoints([]); // Clear selected points after link creation
          createRoute(selectedPoints[0].coordinates, selectedPoints[1].coordinates);
        },
        onError: (error) => {
          console.error("Link creation failed", error);
          setIsLinkCreating(false);
          setSelectedPoints([]);
          // Optionally add retry logic or user feedback here
        }
      });
    }
  }, [selectedPoints, isLinkCreating, createLink]);

  const createRoute = async (start, end) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      const route = data.routes[0].geometry;

      if (map.current.getSource('route')) {
        map.current.getSource('route').setData({
          type: 'Feature',
          geometry: route,
          properties: {}
        });
      } else {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: route,
            properties: {}
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#888',
            'line-width': 8
          }
        });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const onMove = () => {
    if (map.current) {
      const newLng = map.current.getCenter().lng.toFixed(4);
      const newLat = map.current.getCenter().lat.toFixed(4);
      const newZoom = map.current.getZoom().toFixed(2);
      setLng(newLng);
      setLat(newLat);
      setZoom(newZoom);
    }
  };

  const onDrawCreate = (e) => {
    const newPoint = e.features[0];
    const pointName = prompt("Enter a name for the new point:", "New Point");

    if (pointName) {
      const newSPoint = {
        persistent: {
          id: null,
          name: pointName,
          description: null,
          creator: 133,
          locales: [],
          active: null
        },
        number: 868,
        point: {
          x: newPoint.geometry.coordinates[0],
          y: newPoint.geometry.coordinates[1]
        }
      };

      createEntity.mutate(newSPoint, {
        onSuccess: async () => {
          const updatedPointsData = await fetchAndUpdateEntities(queryClient);
          updatePoints(updatedPointsData);
        }
      });
    } else {
      draw.current.delete(newPoint.id);
    }
  };

  const onDrawDelete = (e) => {
    const deletedPointIds = e.features.map(feature => feature.id);
    deletedPointIds.forEach(id => {
      deleteEntity.mutate(id, {
        onSuccess: async () => {
          const updatedPointsData = await fetchAndUpdateEntities(queryClient);
          updatePoints(updatedPointsData);
        }
      });
    });
  };

  const updatePoints = (updatedData) => {
    if (!draw.current) return;
    const data = draw.current.getAll();
    const finalData = updatedData || {
      ...pointsData,
      features: [
        ...pointsData.features.filter(f => f.properties.id.startsWith('point')),
        ...data.features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            id: f.id,
            name: f.properties.name || "Unnamed Point",
            creator: f.properties.creator || 138
          }
        }))
      ]
    };
    if (map.current && map.current.getSource('points')) {
      map.current.getSource('points').setData(finalData);
    }
  };

  const onPointClick = (e) => {
//    console.log(e)
    const coordinates = e.features[0].geometry.coordinates.slice();
    const pointId = e.features[0].properties.id;
    const pointName = e.features[0].properties.name;
    const pointCreator = e.features[0].properties.creator;

    if (clonedPoint) {
      map.current.getSource('cloned-points').setData({
        type: 'FeatureCollection',
        features: []
      });
      setClonedPoint(null);
    }

    const newClonedPoint = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      properties: {
        id: pointId,
        name: pointName,
        creator: pointCreator
      }
    };

    map.current.getSource('cloned-points').setData({
      type: 'FeatureCollection',
      features: [newClonedPoint]
    });

    setClonedPoint(newClonedPoint);

    setSelectedPoints((prevSelectedPoints) => {
      if (prevSelectedPoints.length === 0) {
//        console.log("startPoint of Link chosed")
        return [{ id: pointId, coordinates }];
      } else if (prevSelectedPoints.length === 1 && prevSelectedPoints[0].id !== pointId) {
//        console.log("endPoint of Link chosed")
        return [...prevSelectedPoints, { id: pointId, coordinates }];
      } else {
//        console.log("startPoint of Link rearranged")
        return [{ id: pointId, coordinates }];
      }
    });
 

    if (map.current) {
      const isSelected = map.current.getFeatureState({
        source: 'points',
        id: pointId
      }).selected;

      map.current.setFeatureState(
        { source: 'points', id: pointId },
        { selected: !isSelected }
      );
    }
  };

  

  const deleteSelectedPoints = () => {
    selectedPoints.forEach(point => {
      deleteEntity.mutate(point.id);
    });
    setSelectedPoints([]);
  };

  const handleClonedPointUpdate = (newClonedPoint) => {
    setClonedPoint(newClonedPoint);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading points data: {error.message}</div>;
  }

  return (
    <div>
      <Sidebar lng={lng} lat={lat} zoom={zoom} />
      <InfoBox

        deleteSelectedPoints={deleteSelectedPoints}

        selectedPoints={selectedPoints}
      />
      <MapComponent
        lng={lng}
        lat={lat}
        zoom={zoom}
        onMove={onMove}
        pointsData={pointsData}
        onDrawCreate={onDrawCreate}
        onDrawDelete={onDrawDelete}
        onPointClick={onPointClick}
        updatePoints={updatePoints}
        mapRef={map}
        drawRef={draw}
        clonedPoint={clonedPoint}
        handleClonedPointUpdate={handleClonedPointUpdate}
      />
      <PointsComponent mapRef={map} drawRef={draw} updatePoints={updatePoints} />
    </div>
  );
};

export default TestMap;
