import React, { useState, useRef, useEffect } from "react";
import { useGetEntity } from '../../../lib/hooks/useGetEntity';
import { useGetRoutes } from '../../../lib/hooks/useGetRoutes';
import useCreateEntity from '../../../lib/hooks/useCreateEntity';
import useDeleteEntity from '../../../lib/hooks/useDeleteEntity';
import useCreateLink from '../../../lib/hooks/useCreateLink';
import { fetchAndUpdateEntities } from '../../../lib/hooks/fetchAndUpdateEntities';
import MapComponent from "../../../components/mapbox/MapComponent";
import PointsComponent from "../../../components/mapbox/PointsComponent";
import RouteComponent from "../../../components/mapbox/RouteComponent";
import Sidebar from "../../../components/mapbox/SideBar";
import InfoBox from "../../../components/mapbox/InfoBox";
import { useQueryClient } from '@tanstack/react-query';


const TestMap = () => {
  const queryClient = useQueryClient();
  const { data: pointsData, isLoading, error } = useGetEntity();
  
  //const { data: pointsData, isLoading: isLoadingPoints, error: pointsError } = useGetEntity();
  const { data: routesData, isLoading: isLoadingRoutes, error: routesError } = useGetRoutes();
  console.log("routesData",routesData)
  const createEntity = useCreateEntity();
  const deleteEntity = useDeleteEntity();
  const createLink = useCreateLink();


  const [lng, setLng] = useState(27.618);
  const [lat, setLat] = useState(42.6995);
  const [zoom, setZoom] = useState(12.8);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [clonedPoint, setClonedPoint] = useState(null); 
  const [isLinkCreating, setIsLinkCreating] = useState(false);
  // const [routesData, setRoutesData] = useState({
  //   type: 'FeatureCollection',
  //   features: []
  // });

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
    if (selectedPoints.length === 2 && !isLinkCreating) {
      setIsLinkCreating(true);
      createLink.mutate(selectedPoints, {
        onSuccess: async () => {
          setIsLinkCreating(false);
          const lineCoordinates = selectedPoints.map(point => point.coordinates);

          createRoute(lineCoordinates);
          setSelectedPoints([]);
        },
        onError: (error) => {
          console.error("Link creation failed", error);
          setIsLinkCreating(false);
          setSelectedPoints([]);
        }
      });
    }
  }, [selectedPoints, isLinkCreating, createLink]);

  

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
    const newFeature = e.features[0];
    const geometryType = newFeature.geometry.type;
  
    if (geometryType === 'Point') {
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
            x: newFeature.geometry.coordinates[0],
            y: newFeature.geometry.coordinates[1]
          }
        };
  
        createEntity.mutate(newSPoint, {
          onSuccess: async () => {
            const updatedPointsData = await fetchAndUpdateEntities(queryClient);
            updatePoints(updatedPointsData);
          }
        });
      } else {
        draw.current.delete(newFeature.id);
      }

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
        return [{ id: pointId, coordinates }];
      } else if (prevSelectedPoints.length === 1 && prevSelectedPoints[0].id !== pointId) {
        return [...prevSelectedPoints, { id: pointId, coordinates }];
      } else {
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

  const createRoute = (coords) => {
    console.log("coords",coords)
    const profile = 'driving';
    const newCoords = coords.map(coord => `${coord[0]},${coord[1]}`).join(';');
    const radius = coords.map(() => 25);
    getMatch(newCoords, radius, profile);
  };



  const updateRoute = (e) => {
    const coords = e.features[0].geometry.coordinates;
    console.log("coords", coords);
    const profile = 'driving';
    const newCoords = coords.map(coord => `${coord[0]},${coord[1]}`).join(';');
    const radius = coords.map(() => 50);
    getMatch(newCoords, radius, profile);
  };

  const getMatch = async (coordinates, radius, profile) => {
    const radiuses = radius.join(';');
    const query = await fetch(
      `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordinates}?geometries=geojson&radiuses=${radiuses}&steps=true&access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`,
      { method: 'GET' }
    );
    const response = await query.json();
    if (response.code !== 'Ok') {
      alert(
        `${response.code} - ${response.message}.\n\nFor more information: https://docs.mapbox.com/api/navigation/map-matching/#map-matching-api-errors`
      );
      return;
    }
    const matchedCoords = response.matchings[0].geometry;
    console.log(matchedCoords);
    draw.current.add({
      type: 'Feature',
      geometry: matchedCoords,
      properties: {}
    });
    await saveRouteToDatabase(matchedCoords); 
  };

  const saveRouteToDatabase = async (route) => {
    // Implement the logic to save the route to your database here
    await fetch('/api/save-route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ route }),
    });
  };

  if (isLoading || isLoadingRoutes) {
    return <div>Loading...</div>;
  }

  if (error || routesError) {
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
        routesData={routesData}
        updateRoute={updateRoute}
      />
      <PointsComponent mapRef={map} drawRef={draw} updatePoints={updatePoints} />
      {/* <RouteComponent mapRef={map} /> */}
    </div>
  );
};

export default TestMap;
